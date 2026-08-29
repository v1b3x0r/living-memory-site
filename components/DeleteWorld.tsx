"use client";
// DeleteWorld — the signed-in account control (scope-locked 2026-08-16).
//
// Founder's reason for it existing at all: if a world can be created online, it
// must be deletable online. Emailing a person to be forgotten is not a control.
//
// What this button does NOT claim: that every copy everywhere is gone. Backups
// are a second clock, so the copy always splits the two — "removed from the live
// service immediately" and "backups expire within 7 days" — and never says
// "unrecoverable" while a backup of it exists.
import { useState } from "react";
import { useStytchB2BClient } from "@stytch/react/b2b";
import { DELETE_WORLD_URL } from "../lib/install-copy";

type Phase = "idle" | "arming" | "deleting" | "done" | "error";

interface Result {
  memoriesRemoved: number;
  notesRemoved: number;
  credentialsRevoked: number;
}

const CONFIRM_WORD = "DELETE";

export interface DeleteWorldProps {
  /** Memory count from the status read; null when unknown — the copy adapts rather than guesses. */
  memories?: number | null;
  /**
   * Whether a Billing section is on the page above. It is not, for a visitor
   * with no subscription — and an anchor to a section that was never rendered
   * scrolls nowhere, which is worse than the plain sentence it replaced.
   */
  hasBilling?: boolean;
}

export function DeleteWorld({ memories = null, hasBilling = false }: DeleteWorldProps) {
  const billingHere = hasBilling ? (
    <>
      {" "}
      To stop paying, use <a href="#keep-billing-title">Billing</a> above.
    </>
  ) : null;
  const stytch = useStytchB2BClient();
  const [phase, setPhase] = useState<Phase>("idle");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [empty, setEmpty] = useState(false);

  async function destroy() {
    setPhase("deleting");
    setError("");
    setEmpty(false);
    // The session JWT, not the Connected-Apps token an agent uses. The server
    // verifies it against a separate issuer for exactly that reason.
    const jwt = stytch.session.getTokens()?.session_jwt;
    if (!jwt) {
      setError("Your session expired. Sign in again and retry.");
      return setPhase("error");
    }
    try {
      const res = await fetch(DELETE_WORLD_URL, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ confirm: CONFIRM_WORD }),
      });
      if (res.status === 404) {
        // The account with no world is, right now, exactly the account that PAYS:
        // subscriptions key on the sign-in that bought them, and signing in another
        // way makes a separate one. So this is the moment a paying customer is most
        // likely to conclude their purchase failed and buy again. It costs nothing
        // to tell them the truth instead.
        setEmpty(true);
        return setPhase("error");
      }
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? `Deletion failed (${res.status}). Nothing was removed.`);
        return setPhase("error");
      }
      setResult((await res.json()) as Result);
      setPhase("done");
    } catch {
      // A network failure is not a deletion. Say so plainly rather than leaving
      // someone believing their memories are gone when they are not.
      setError("Could not reach the service. Nothing was removed — try again.");
      setPhase("error");
    }
  }

  if (phase === "done" && result) {
    return (
      <section className="keep-danger keep-danger--done" aria-live="polite">
        <h2>Your world is gone.</h2>
        <p>
          Removed {result.memoriesRemoved}{" "}
          {result.memoriesRemoved === 1 ? "memory" : "memories"}, {result.notesRemoved}{" "}
          {result.notesRemoved === 1 ? "handoff note" : "handoff notes"}, and{" "}
          {result.credentialsRevoked}{" "}
          {result.credentialsRevoked === 1 ? "agent key" : "agent keys"}. Any agent still
          pointed at this world now gets nothing back.
        </p>
        <p className="keep-danger__fine">
          Removed from the live service immediately. Infrastructure backups of the server
          expire within 7 days; nobody can restore your world from them on request.
          Your sign-in and any billing records are separate — see{" "}
          <a href="/living-memory/privacy/">Privacy</a>. If you have an active
          subscription it is still running, and cancelling it is a separate step —
          sign in again and use Billing on this page so you are not billed for a
          world you no longer have.
        </p>
      </section>
    );
  }

  return (
    <section className="keep-danger" aria-labelledby="keep-danger-title">
      <h2 id="keep-danger-title">Your data</h2>
      <p>
        <strong>Delete my world</strong> — removes the memories, handoff notes and agent
        keys stored under this sign-in.
      </p>
      {/* The load-bearing sentence. It is the only thing standing between a customer
          who thinks their payment failed and an irreversible click. */}
      <p className="keep-danger__separation">
        This is about your stored data, not your subscription; deleting does not cancel
        billing, and cancelling does not delete anything.{billingHere}
      </p>

      {phase === "idle" && (
        <button className="button button--secondary" type="button" onClick={() => setPhase("arming")}>
          Delete my world…
        </button>
      )}

      {(phase === "arming" || phase === "deleting" || phase === "error") && (
        <div className="keep-danger__confirm">
          <label htmlFor="keep-danger-input">
            This permanently removes the Living Memory world associated with this
            signed-in identity
            {typeof memories === "number"
              ? ` — ${memories} ${memories === 1 ? "memory" : "memories"}, plus any handoff notes and agent keys.`
              : "."}
            <br />
            This cannot be undone from the live service.
            <br />
            Type <strong>{CONFIRM_WORD}</strong> to confirm.
          </label>
          <input
            id="keep-danger-input"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={CONFIRM_WORD}
          />
          <div className="keep-danger__actions">
            <button
              className="button button--danger"
              type="button"
              disabled={typed !== CONFIRM_WORD || phase === "deleting"}
              onClick={destroy}
            >
              {phase === "deleting" ? "Deleting…" : "Delete my world permanently"}
            </button>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => { setPhase("idle"); setTyped(""); setError(""); setEmpty(false); }}
            >
              Cancel
            </button>
          </div>
          {phase === "error" && empty && (
            <div className="keep-error" role="alert">
              <p>There is no memory world attached to this sign-in.</p>
              <p>
                If you expected one, <strong>do not create a new subscription</strong> —
                write to <a href="mailto:support@viibe.to">support@viibe.to</a>.
                Signing in with a different provider or email address creates a separate
                account, and your memories are probably attached to the one you used
                first.
              </p>
            </div>
          )}
          {phase === "error" && !empty && (
            <p className="keep-error" role="alert">{error}</p>
          )}
        </div>
      )}

      <p className="keep-danger__fine">
        Your sign-in account and billing records are handled separately —{" "}
        <a href="/living-memory/privacy/">Privacy</a> explains what happens to each, and
        how long infrastructure backups last.
      </p>
    </section>
  );
}
