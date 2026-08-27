import { BASE_PATH } from "./base-path.ts";

/**
 * Routes this site actually serves. A link that has no page does not ship —
 * the landing page is an argument that we tell the truth, and a 404 in the
 * footer is the cheapest possible way to lose it.
 */
export const KNOWN_ISSUES_PATH = `${BASE_PATH}/known-issues/`;
export const WHATS_NEW_PATH = `${BASE_PATH}/whats-new/agents-hand-work/`;
export const PRIVACY_PATH = `${BASE_PATH}/privacy/`;
export const TERMS_PATH = `${BASE_PATH}/terms/`;
export const SUPPORT_PATH = `${BASE_PATH}/support/`;

/**
 * The feed index. WHATS_NEW_PATH above stays pointed at the 15 August write-up
 * on purpose: the landing timeline links to THAT post ("Read the write-up"),
 * and the nav links here. Two links, two destinations, one of which is a list.
 */
export const WHATS_NEW_INDEX_PATH = `${BASE_PATH}/whats-new/`;

/** An entry's own page. Entries without a write-up do not call this. */
export const whatsNewEntryPath = (slug: string) =>
  `${WHATS_NEW_INDEX_PATH}${slug}/`;
