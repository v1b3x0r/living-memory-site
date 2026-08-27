import assert from "node:assert/strict";
import test from "node:test";
import { landing } from "../content/landing-copy.ts";
import { CLAUDE_CONNECTOR_DEEPLINK } from "../lib/install-copy.ts";

test("the deep link is the probed working shape, with no baked-in room", () => {
  const url = new URL(CLAUDE_CONNECTOR_DEEPLINK);
  assert.equal(url.origin, "https://claude.ai");
  // The /new form was the one that opened the modal on every attempt
  // (2026-08-27 probe); /settings/connectors is a stub and must not be used.
  assert.equal(url.pathname, "/new");
  assert.equal(url.searchParams.get("modal"), "add-custom-connector");
  assert.equal(url.hash, "#settings/customize-connectors");
  // No prefill param exists on Claude's side — a room URL in this link would
  // silently leak a bearer credential into browser history for nothing.
  assert.doesNotMatch(CLAUDE_CONNECTOR_DEEPLINK, /lme\.viibe\.to/);
});

test("the card's words teach copy → open → paste, and carry the fallback", () => {
  const copy = landing.hero.mobileSetup;
  assert.match(copy.copyLabel, /copy/i);
  assert.match(copy.openLabel, /claude/i);
  // The link rides undocumented internals; the hand-navigation path must
  // ship beside it (probe report, fragility flag a).
  assert.match(copy.fallback, /settings/i);
  assert.match(copy.fallback, /connector/i);
  // Truth rule: the card must not promise a one-tap install that Claude
  // cannot do — the user pastes the URL themselves.
  assert.match(copy.body, /paste/i);
});
