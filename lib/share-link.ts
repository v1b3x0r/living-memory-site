// share-link.ts — the invite funnel's two ends (2026-08-27 dogfood finding:
// sharing a raw room URL leaves the recipient with no door, only a credential).
//
// The room URL is a BEARER CREDENTIAL, so the share link carries it in the
// URL fragment: a fragment never reaches the server, edge logs, analytics,
// referrers, or link-preview bots. The exposure is exactly the chat message
// the sharer was already sending — no more.
import { BASE_PATH } from "./base-path.ts";

export const SITE_ORIGIN = "https://viibe.to";
export const JOIN_PATH = `${BASE_PATH}/join`;

/** Rooms only — the paid world's /mcp is a sign-in, not an invite. */
const ROOM_URL_SHAPE = /^https:\/\/lme\.viibe\.to\/t\/[A-Za-z0-9_-]+\/mcp$/;

export function buildShareLink(roomUrl: string): string {
  return `${SITE_ORIGIN}${JOIN_PATH}#${roomUrl}`;
}

/**
 * The validated room URL from a join page's fragment, or null. Refusing
 * anything but our own room shape is the anti-phishing line: this page must
 * never teach a visitor to paste a stranger's endpoint into their client.
 */
export function parseShareFragment(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (raw === "") return null;
  let candidate = raw;
  try {
    candidate = decodeURIComponent(raw);
  } catch {
    return null;
  }
  return ROOM_URL_SHAPE.test(candidate) ? candidate : null;
}
