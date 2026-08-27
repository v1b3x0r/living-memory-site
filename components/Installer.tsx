"use client";

import { useEffect, useState } from "react";
import { landing } from "../content/landing-copy";
import {
  CLIENT_TABS,
  LOCAL_INSTALL_COMMAND,
  ROOM_URL_PLACEHOLDER,
  stepTwo,
  type ClientId,
  type Rail,
} from "../lib/install-copy";
import { track } from "../lib/telemetry";
import { CopyButton } from "./CopyButton";
import { mintRoom, type OnsGrant } from "../lib/mint-room";
import { QrCode } from "./QrCode";
import { ClaudeMark, CursorMark, OpenAiMark } from "./ClientMarks";

/* Real vendor marks since 2026-08-27 (founder reversed design round 2's
   generic-glyph rule: the logos are what tell a visitor these connections
   are real). "any" keeps a generic glyph — it names a category, not an app. */
const TAB_MARKS: Record<ClientId, React.ReactNode> = {
  chatgpt: <OpenAiMark />,
  cursor: <CursorMark />,
  "claude-code": <ClaudeMark />,
  claude: <ClaudeMark />,
  any: (
    <svg
      className="client-tabs__glyph"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5.5 2v4m5-4v4M3.5 6h9v3a4.5 4.5 0 0 1-9 0zM8 13.5V15" />
    </svg>
  ),
};

function TabGlyph({ id }: { id: ClientId }) {
  return (
    <>{TAB_MARKS[id]}</>
  );
}

/* Step 3's little scene: one app window hands off to another. Decorative;
   the words above it carry the claim. */
function SecondAppGlyph() {
  return (
    <svg
      className="step__second-app"
      viewBox="0 0 120 44"
      width="180"
      height="66"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="44" height="32" rx="3" />
      <path d="M2 14h44M7 10.5h.01M11 10.5h.01M15 10.5h.01" />
      <path d="M9 21h30M9 27h22" opacity="0.55" />
      <path d="M52 22h14" strokeDasharray="2.5 3.5" />
      <path d="M63 18.5l4 3.5-4 3.5" />
      <rect x="74" y="6" width="44" height="32" rx="3" />
      <path d="M74 14h44M79 10.5h.01M83 10.5h.01M87 10.5h.01" />
      <path d="M81 21h30M81 27h22" opacity="0.55" />
    </svg>
  );
}

/**
 * §1 of the landing page.
 *
 * Two axes, and they move different things:
 *   the rail toggle (Cloud / Local) changes STEP 1 only;
 *   the client tabs change STEP 2 only.
 * Steps 1 and 3 are otherwise identical for every client — the repetition is
 * the message, so nothing here "helpfully" varies them.
 */
export function Installer({ id = "installer" }: { id?: string }) {
  const [rail, setRail] = useState<Rail>("cloud");
  const [client, setClient] = useState<ClientId>("chatgpt");
  const [grant, setGrant] = useState<OnsGrant | null>(null);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A room minted in the hero (HeroMint) is THE room: the steps below carry
  // its real URL instead of a placeholder, and the installer's own mint
  // button disappears the same way it does after minting here.
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
    window.addEventListener("lme:grant", onGrant);
    window.addEventListener("lme:grant:pending", onPending);
    window.addEventListener("lme:grant:failed", onFailed);
    return () => {
      window.removeEventListener("lme:grant", onGrant);
      window.removeEventListener("lme:grant:pending", onPending);
      window.removeEventListener("lme:grant:failed", onFailed);
    };
  }, []);

  const roomUrl = grant?.url ?? ROOM_URL_PLACEHOLDER;
  const two = stepTwo(client, rail, roomUrl);

  async function mint() {
    setMinting(true);
    setError(null);
    window.dispatchEvent(new CustomEvent("lme:grant:pending"));
    try {
      // The shared mint path — hero, WebMCP, and this button are one contract.
      const next = await mintRoom();
      setGrant(next);
      track("ons_minted");
      // Both creators broadcast; both listen; each dispatches only on its OWN
      // mint, so the two can never echo each other into a loop.
      window.dispatchEvent(new CustomEvent("lme:grant", { detail: next }));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "could not reach the room service",
      );
      window.dispatchEvent(new CustomEvent("lme:grant:failed"));
    } finally {
      setMinting(false);
    }
  }

  return (
    <section className="installer" id={id} aria-labelledby="installer-title">
      <div className="installer__head">
        <h2 id="installer-title">{landing.installer.heading}</h2>
        <div className="rail-toggle" role="group" aria-label="Where the world runs">
          {(["cloud", "local"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="rail-toggle__option"
              aria-pressed={rail === option}
              onClick={() => setRail(option)}
            >
              {option === "cloud" ? "Cloud" : "Local"}
            </button>
          ))}
        </div>
      </div>

      <div className="client-tabs" role="tablist" aria-label="MCP client">
        {CLIENT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={client === tab.id}
            aria-controls="step-two"
            className="client-tabs__tab"
            onClick={() => setClient(tab.id)}
          >
            <span className="client-tabs__face">
              <TabGlyph id={tab.id} />
              {tab.label}
            </span>
            {tab.sublabel !== undefined && (
              <span className="client-tabs__sublabel">{tab.sublabel}</span>
            )}
          </button>
        ))}
      </div>

      <ol className="steps">
        <li className="step">
          <span className="step__index">{landing.installer.steps.one.index}</span>
          {rail === "local" ? (
            <>
              <h3>{landing.installer.steps.oneLocal.title}</h3>
              <p className="step__note">{landing.installer.steps.oneLocal.note}</p>
              <pre className="code code--inline">{LOCAL_INSTALL_COMMAND}</pre>
              <CopyButton text={LOCAL_INSTALL_COMMAND} label="Copy the command" />
            </>
          ) : (
            <>
              <h3>{landing.installer.steps.one.title}</h3>
              <p className="step__note">{landing.installer.steps.one.note}</p>
              {/* One room per visitor is the promise: once a grant exists —
                  minted here OR imported from the hero — the button gives way
                  to the room it opened. A second active button minted a second
                  room and split the page's truth. (Codex, PR #18.) */}
              {grant === null && (
                <button
                  className="button button--primary"
                  type="button"
                  onClick={mint}
                  disabled={minting}
                >
                  {minting ? "Opening…" : landing.installer.steps.one.cta}
                </button>
              )}
              {error !== null && (
                <p className="step__error" role="alert">
                  {error}
                </p>
              )}
              <p className="step__scan">{landing.installer.steps.one.scan}</p>
              {grant === null ? (
                <>
                  <div className="qr qr--placeholder" aria-hidden="true" />
                  <p className="step__caption">
                    {landing.installer.steps.one.qrCaption}
                  </p>
                </>
              ) : (
                <>
                  <QrCode value={grant.url} />
                  <pre className="code code--room">{grant.url}</pre>
                  <p className="step__caption">
                    Stays available while it&apos;s used — kept at least until{" "}
                    {new Date(grant.expiresAt).toUTCString()}, and any use
                    extends that.
                    Anyone holding this URL can read and write this room
                    — don&apos;t post or screenshot it.
                  </p>
                  <CopyButton text={grant.url} label="Copy the room URL" />
                </>
              )}
            </>
          )}
        </li>

        <li className="step" id="step-two" role="tabpanel" aria-labelledby={`tab-${client}`}>
          <span className="step__index">{landing.installer.steps.two.index}</span>
          <h3>{landing.installer.steps.two.title}</h3>
          {two.lines.map((line) => (
            <p className="step__note" key={line}>
              {line}
            </p>
          ))}
          {two.code !== undefined && (
            <>
              <pre className="code">{two.code}</pre>
              <CopyButton text={two.code} label="Copy" />
            </>
          )}
          {two.link !== undefined && (
            <p className="step__note">
              {two.link.before}
              <a href={two.link.href}>{two.link.label}</a>
              {two.link.after}
            </p>
          )}
        </li>

        <li className="step">
          <span className="step__index">{landing.installer.steps.three.index}</span>
          <h3>{landing.installer.steps.three.title}</h3>
          {landing.installer.steps.three.lines.map((line) => (
            <p className="step__note" key={line}>
              {line}
            </p>
          ))}
          <SecondAppGlyph />
        </li>
      </ol>

      <p className="installer__caption">{landing.installer.caption}</p>

      <p className="warning-band" role="note">
        <span className="warning-band__mark" aria-hidden="true">
          ⚠
        </span>
        <span>
          {landing.installer.warning.map((line) => (
            <span className="warning-band__line" key={line}>
              {line}
            </span>
          ))}
        </span>
      </p>
    </section>
  );
}
