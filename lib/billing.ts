/**
 * RevenueCat Web Purchase Links for the hosted Living Memory subscription.
 *
 * The link tokens are public identifiers (they ship to every browser) — the
 * purchase itself happens on pay.rev.cat with Stripe. The app_user_id is
 * appended as a path segment so the purchase lands on the exact RevenueCat
 * customer the server's entitlement gate checks (src/entitlement.ts).
 *
 * Empty string = link not configured yet; the /keep page renders a
 * "not yet available" state instead of a broken checkout button.
 */
// LIVE since 2026-08-13 ~20:45 ICT: Stripe account activated
// (charges_enabled) AND the RevenueCat Stripe App installed in Stripe LIVE
// mode — RevenueCat then minted this production link token (the older token
// was test-era and drifted onto /sandbox/). Verified: this URL stays on the
// production checkout.
export const WEB_PURCHASE_LINK: string = "https://pay.rev.cat/gesrgyeedsavgktj";

export function keepCheckoutUrl(rcUserId: string): string {
  if (!WEB_PURCHASE_LINK) return "";
  return `${WEB_PURCHASE_LINK.replace(/\/+$/, "")}/${encodeURIComponent(rcUserId)}`;
}
