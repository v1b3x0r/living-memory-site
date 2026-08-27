import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_SCOPES, requestedScopes } from "../lib/oauth-scope.ts";

// RFC 6749 §3.3 makes `scope` OPTIONAL on an authorization request. Cursor
// omits it; claude.ai sends "openid profile email". Handing Stytch an empty
// array answers a legal request with oauth_invalid_scope_requested, so the
// client that follows the spec is the one that cannot sign in.
test("falls back to the default set when the client sends no scope", () => {
  assert.deepEqual(requestedScopes(null), [...DEFAULT_SCOPES]);
  assert.deepEqual(requestedScopes(""), [...DEFAULT_SCOPES]);
  assert.deepEqual(requestedScopes("   "), [...DEFAULT_SCOPES]);
});

test("passes a client's own scopes through untouched", () => {
  assert.deepEqual(requestedScopes("openid profile email"), ["openid", "profile", "email"]);
  assert.deepEqual(requestedScopes("  openid   profile "), ["openid", "profile"]);
});

test("does not widen a narrow request — asking for less stays less", () => {
  assert.deepEqual(requestedScopes("openid"), ["openid"]);
});
