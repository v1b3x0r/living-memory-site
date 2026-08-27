/**
 * RevenueCat customer id derived from a verified OAuth subject.
 *
 * PARITY CONTRACT: this must stay byte-identical to `rcCustomerIdFromSub` in
 * src/oauth.ts — the server is the source of truth; this mirror only exists so
 * the browser can pre-attach the same app_user_id to a RevenueCat Web Purchase
 * Link. Guarded by test/rc-user-id-parity.test.ts (root) and
 * site/tests/rc-user-id.test.ts.
 *
 * INJECTIVE encoding: RC ids must match ^[0-9a-zA-Z_-]*$, and a blanket `_`
 * substitution is not one-to-one ("a:b" and "a/b" would share a customer), so
 * every character outside [0-9a-zA-Z-] becomes `_<codepoint hex>_`. Stytch
 * member ids use only [0-9a-z-] and pass through unchanged.
 */
export function rcUserIdFromSub(sub: string): string {
  let out = "oauth_";
  for (const ch of sub) {
    out += /[0-9a-zA-Z-]/.test(ch)
      ? ch
      : `_${(ch.codePointAt(0) as number).toString(16)}_`;
  }
  return out;
}
