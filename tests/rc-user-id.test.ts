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
