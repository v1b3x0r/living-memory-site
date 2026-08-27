"use client";

import { landing } from "../content/landing-copy";
import { CLAUDE_CONNECTOR_DEEPLINK } from "../lib/install-copy";
import { track } from "../lib/telemetry";
import { CopyButton } from "./CopyButton";

/**
 * Tier 1 mobile onboarding (2026-08-27): a minted room is only half the
 * journey — the other half is the paste into a client. On a phone the card
 * shortens that to copy → open → paste. Desktop is unchanged: the card is
 * CSS-hidden above the hero's mobile breakpoint, and the installer below
 * remains the full guide. Exactly two actions by design.
 */
export function MobileSetupCard({ url }: { url: string }) {
  const copy = landing.hero.mobileSetup;
  return (
    <div className="mobile-setup">
      <p className="mobile-setup__title">{copy.title}</p>
      <p className="mobile-setup__body">{copy.body}</p>
      <div className="mobile-setup__actions">
        <CopyButton text={url} label={copy.copyLabel} />
        <a
          className="button mobile-setup__open"
          href={CLAUDE_CONNECTOR_DEEPLINK}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("mobile_setup_deeplink")}
        >
          {copy.openLabel}
        </a>
      </div>
      {/* The deep link rides undocumented internals (see install-copy.ts) —
          the hand-navigation path ships next to it, always. */}
      <p className="mobile-setup__fallback">{copy.fallback}</p>
    </div>
  );
}
