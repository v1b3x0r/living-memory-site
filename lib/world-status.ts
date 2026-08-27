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

export interface WorldStatus {
  entitled: boolean | null;
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
