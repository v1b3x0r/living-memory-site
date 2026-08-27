// mint-room.ts — the one client-side path to a free room. The hero button and
// the WebMCP front desk both call this; there is no second mint implementation.
import { ONS_MINT_URL } from "./install-copy.ts";

export interface OnsGrant {
  url: string;
  expiresAt: string;
}

export async function mintRoom(
  fetchImpl: typeof fetch = fetch,
): Promise<OnsGrant> {
  const res = await fetchImpl(ONS_MINT_URL, { method: "POST" });
  const body = (await res.json()) as OnsGrant & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `server answered ${res.status}`);
  return { url: body.url, expiresAt: body.expiresAt };
}
