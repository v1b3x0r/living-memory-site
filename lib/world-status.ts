// world-status.ts — the single read /keep makes about the signed-in visitor.
//
// It exists to stop the page saying two false things to a paying customer: that
// they still need to buy, and — sitting right beside that — that deleting their
// memories is a thing they might want to do about it.
//
// `entitled: null` means "we could not ask", NOT "no". The page must stay quiet
// in that case: telling a subscriber they have no subscription is the sentence
// that sells a second one.
import { WORLD_STATUS_URL } from "./install-copy";

/**
 * What the page may say about the caller's money. Mirrors BillingFacts in
 * lme-remote/src/entitlement.ts; every field comes from RevenueCat and none is
 * stored here.
 *
 * null means "no answer", which is a THIRD state, not a synonym for "not
 * subscribed" — an unreachable billing API and a comped world both land here,
 * and both must fall back to the receipt-email wording rather than render an
 * empty or invented panel.
 */
export interface Billing {
  store: string;
  status: string;
  autoRenews: boolean;
  currentPeriodEndsAt: string | null;
  /** RevenueCat's hosted portal for this subscription. Absent for promotional grants. */
  managementUrl: string | null;
}

export interface WorldStatus {
  entitled: boolean | null;
  billing: Billing | null;
  world: { memories: number } | null;
}

export async function fetchWorldStatus(jwt: string): Promise<WorldStatus | null> {
  try {
    const res = await fetch(WORLD_STATUS_URL, {
      headers: { authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as WorldStatus;
  } catch {
    return null; // unknown, never "no"
  }
}
