import assert from "node:assert/strict";
import test from "node:test";
import { rcUserIdFromSub } from "../lib/rc-user-id.ts";
import { keepCheckoutUrl } from "../lib/billing.ts";

// Fixtures shared with test/rc-user-id-parity.test.ts at the repo root, which
// asserts the server's resolveSubject produces the same rcUserId for each sub.
test("keeps RC-safe subjects untouched (Stytch member ids)", () => {
  assert.equal(
    rcUserIdFromSub("member-test-1d633786-5a86-4095-9bce-923725aa3ac5"),
    "oauth_member-test-1d633786-5a86-4095-9bce-923725aa3ac5",
  );
});

test("encodes RC-hostile characters injectively", () => {
  assert.equal(rcUserIdFromSub("auth0|alice"), "oauth_auth0_7c_alice");
  assert.equal(rcUserIdFromSub("a:b"), "oauth_a_3a_b");
  // Injective: distinct subjects can never share a RevenueCat customer.
  assert.notEqual(rcUserIdFromSub("a:b"), rcUserIdFromSub("a/b"));
  assert.notEqual(rcUserIdFromSub("a b"), rcUserIdFromSub("a.b"));
});

test("result always matches RevenueCat's ^[0-9a-zA-Z_-]*$ id rule", () => {
  for (const sub of ["auth0|x", "a:b", "weird sub!", "member-live-123ok", "ผู้ใช้"]) {
    assert.match(rcUserIdFromSub(sub), /^[0-9a-zA-Z_-]+$/);
  }
});

test("checkout only produces the LIVE production link", () => {
  // Live since 2026-08-13: Stripe activated + RevenueCat app installed in
  // Stripe live mode. The production token differs from the test-era one —
  // if this assertion fails, verify the link doesn't drift onto /sandbox/.
  assert.equal(
    keepCheckoutUrl("oauth_member-live-abc"),
    "https://pay.rev.cat/gesrgyeedsavgktj/oauth_member-live-abc",
  );
});

// GOLDEN VECTORS — the cross-repo contract with the server (lme-remote
// test/rc-user-id-parity.test.ts pins the identical list against its
// resolveSubject truth). Since the repos split on 2026-08-27 this list IS the
// parity guard: change it in both repos together or not at all.
test("matches the server's golden vectors exactly", () => {
  const goldens: ReadonlyArray<[string, string]> = [
    ["member-test-1d633786-5a86-4095-9bce-923725aa3ac5", "oauth_member-test-1d633786-5a86-4095-9bce-923725aa3ac5"],
    ["member-live-11285995-bd1c-41be-8885-1ca0ca4d449f", "oauth_member-live-11285995-bd1c-41be-8885-1ca0ca4d449f"],
    ["auth0|alice", "oauth_auth0_7c_alice"],
    ["user:with:colons", "oauth_user_3a_with_3a_colons"],
    ["a b/c.d@e", "oauth_a_20_b_2f_c_2e_d_40_e"],
    ["ผู้ใช้", "oauth__e1c__e39__e49__e43__e0a__e49_"],
  ];
  for (const [sub, expected] of goldens) {
    assert.equal(rcUserIdFromSub(sub), expected);
  }
});
