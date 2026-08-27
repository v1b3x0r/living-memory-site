"use client";

import { useEffect, useState } from "react";
import { landing } from "../content/landing-copy";
import { mintRoom, type OnsGrant } from "../lib/mint-room";
import { track } from "../lib/telemetry";
import { CopyButton } from "./CopyButton";
import { MobileSetupCard } from "./MobileSetupCard";

/**
 * WS2 (2026-08-26): the hero IS the room creator — press the button, get the
 * link, hand it to any agent. Game-onboarding shape by design: one action,
 * one artifact, no signup in between. The installer below remains the full
 * per-client guide; GRANT_EVENT is how it learns a room already exists, so a
 * visitor who minted here scrolls into steps that carry their real URL
 * instead of a placeholder.
 */
export const GRANT_EVENT = "lme:grant";
/* Both surfaces lock the moment EITHER starts a request — a slow POST left
   the other button active and raced two rooms. (Codex, PR #18 round 4.) */
export const GRANT_PENDING_EVENT = "lme:grant:pending";
export const GRANT_FAILED_EVENT = "lme:grant:failed";

export function HeroMint() {
  const [grant, setGrant] = useState<OnsGrant | null>(null);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Symmetric with the installer's listener: a room minted THERE reaches this
  // hero too, so scrolling back up never shows an active second mint button.
  // (Codex, PR #18 round 2 — the sync used to flow one way only.)
  useEffect(() => {
    const onGrant = (e: Event) => {
      const detail = (e as CustomEvent<OnsGrant>).detail;
      if (detail?.url) setGrant(detail);
      setMinting(false);
      // A room now exists — a failure message from an earlier attempt on
      // THIS surface is stale the moment the other surface succeeds.
      setError(null);
    };
    const onPending = () => setMinting(true);
    const onFailed = () => setMinting(false);
    window.addEventListener(GRANT_EVENT, onGrant);
    window.addEventListener(GRANT_PENDING_EVENT, onPending);
    window.addEventListener(GRANT_FAILED_EVENT, onFailed);
    return () => {
      window.removeEventListener(GRANT_EVENT, onGrant);
      window.removeEventListener(GRANT_PENDING_EVENT, onPending);
      window.removeEventListener(GRANT_FAILED_EVENT, onFailed);
    };
  }, []);

  async function mint() {
    setMinting(true);
    setError(null);
    window.dispatchEvent(new CustomEvent(GRANT_PENDING_EVENT));
    try {
      // The shared mint path — the WebMCP front desk calls the same one.
      const next = await mintRoom();
      setGrant(next);
      track("ons_minted", { surface: "hero" });
      window.dispatchEvent(new CustomEvent(GRANT_EVENT, { detail: next }));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "could not reach the room service",
      );
      window.dispatchEvent(new CustomEvent(GRANT_FAILED_EVENT));
    } finally {
      setMinting(false);
    }
  }

  if (grant) {
    return (
      <div className="hero-mint hero-mint--granted">
        <pre className="code code--room">{grant.url}</pre>
        <div className="hero-mint__actions">
          <CopyButton text={grant.url} label="Copy the room URL" />
          <span className="hero-mint__hint">
            Paste it into ChatGPT, Claude, Codex, Cursor, or any MCP client —{" "}
            <a href="#installer">the guide below shows each one</a>.
          </span>
        </div>
        <div className="hero-mint__warning">
          Anyone holding this URL can read and write this room — don&apos;t
          post or screenshot it.
        </div>
        {/* Mobile-only (CSS): the copy → open → paste shortcut. Fed from THIS
            grant state, so there is no second listener and no second truth. */}
        <MobileSetupCard url={grant.url} />
      </div>
    );
  }

  return (
    <div className="hero-mint">
      <button
        type="button"
        className="button button--primary hero-mint__button"
        onClick={mint}
        disabled={minting}
      >
        {minting ? "Opening your room…" : landing.hero.cta}
      </button>
      {/* role=alert: a failed mint must reach assistive tech, not only
          silently swap the note's text. (Codex, PR #18 round 4.) */}
      {error !== null ? (
        <span className="hero__cta-note" role="alert">
          {error}
        </span>
      ) : (
        <span className="hero__cta-note">{landing.hero.ctaNote}</span>
      )}
    </div>
  );
}
