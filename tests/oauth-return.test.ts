import assert from "node:assert/strict";
import test from "node:test";
import {
  OAUTH_RETURN_PARAM,
  oauthLoginPath,
  safeAuthorizeReturn,
} from "../lib/oauth-return.ts";

const ORIGIN = "https://viibe.to";
const AUTHORIZE = "/living-memory/oauth/authorize?client_id=client-1&state=state-1";

test("accepts only the same-origin OAuth authorize route", () => {
  assert.equal(safeAuthorizeReturn(AUTHORIZE, ORIGIN), AUTHORIZE);
  assert.equal(
    safeAuthorizeReturn(`${ORIGIN}${AUTHORIZE}#ignored`, ORIGIN),
    AUTHORIZE,
  );
});

test("rejects foreign, protocol-relative, and lookalike return URLs", () => {
  for (const value of [
    "https://attacker.example/living-memory/oauth/authorize",
    "//attacker.example/living-memory/oauth/authorize",
    "/living-memory/oauth/authorize-elsewhere",
    "/redirect?next=/living-memory/oauth/authorize",
    "not a URL",
    null,
  ]) {
    assert.equal(safeAuthorizeReturn(value, ORIGIN), null);
  }
});

test("login path round-trips the authorize request through one query value", () => {
  const loginPath = oauthLoginPath(AUTHORIZE);
  const parsed = new URL(loginPath, ORIGIN);
  assert.equal(parsed.pathname, "/living-memory/oauth/login");
  assert.equal(parsed.searchParams.get(OAUTH_RETURN_PARAM), AUTHORIZE);
  assert.equal(safeAuthorizeReturn(parsed.searchParams.get(OAUTH_RETURN_PARAM), ORIGIN), AUTHORIZE);
});

// Regression: next.config.ts sets trailingSlash:true, so production 308-redirects
// /oauth/authorize -> /oauth/authorize/ before this code ever runs. Rejecting the
// slashed form made the authorize page reject its own URL, so the no-session
// branch bailed out silently and the page hung on "Checking your session…".
test("accepts the trailing-slash form production actually serves", () => {
  const slashed = "/living-memory/oauth/authorize/?client_id=client-1&state=state-1";
  assert.equal(safeAuthorizeReturn(slashed, ORIGIN), slashed);
  assert.equal(safeAuthorizeReturn(`${ORIGIN}${slashed}`, ORIGIN), slashed);
});

test("still rejects lookalikes that merely start with the authorize path", () => {
  for (const value of [
    "/living-memory/oauth/authorize/../../evil",
    "/living-memory/oauth/authorize/extra",
    "/living-memory/oauth/authorizex/",
  ]) {
    assert.equal(safeAuthorizeReturn(value, ORIGIN), null);
  }
});
