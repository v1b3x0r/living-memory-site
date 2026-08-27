import assert from "node:assert/strict";
import test from "node:test";
import { buildShareLink, parseShareFragment } from "../lib/share-link.ts";

const ROOM = "https://lme.viibe.to/t/ons_1d633786aa/mcp";

test("a share link carries the room in the FRAGMENT, never a query param", () => {
  const link = buildShareLink(ROOM);
  assert.equal(link, `https://viibe.to/living-memory/join#${ROOM}`);
  // The room URL is a bearer credential: a fragment never reaches the server,
  // CF logs, analytics, or link-preview bots. A query param reaches all four.
  assert.ok(!link.includes("?"));
});

test("only a real room URL renders — everything else is refused", () => {
  assert.equal(parseShareFragment(`#${ROOM}`), ROOM);
  // Anti-phishing: a crafted join link must not teach a visitor to paste a
  // stranger's endpoint into their client.
  assert.equal(parseShareFragment("#https://evil.example/t/ons_x/mcp"), null);
  assert.equal(parseShareFragment("#https://lme.viibe.to/mcp"), null); // the paid world is not a room invite
  assert.equal(parseShareFragment("#javascript:alert(1)"), null);
  assert.equal(parseShareFragment("#"), null);
  assert.equal(parseShareFragment(""), null);
  // A URL-encoded fragment (some apps encode on paste) still parses.
  assert.equal(parseShareFragment(`#${encodeURIComponent(ROOM)}`), ROOM);
});

test("round trip: what the hero builds is what the join page reads", () => {
  const link = buildShareLink(ROOM);
  const fragment = new URL(link).hash;
  assert.equal(parseShareFragment(fragment), ROOM);
});
