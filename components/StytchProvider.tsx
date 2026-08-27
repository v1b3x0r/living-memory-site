"use client";
// Stytch B2B provider for the OAuth pages only — the rest of the site stays
// provider-free (presentation boundary: sign-in capability exists solely to serve
// the OAuth authorization flow for the hosted MCP).
import { type ReactNode, useEffect, useState } from "react";
import { StytchB2BProvider, createStytchB2BClient } from "@stytch/react/b2b";

// Public by design (ships to every browser). Live-env token (cutover 2026-08-13).
const STYTCH_PUBLIC_TOKEN = "public-token-live-e5c546bf-e46a-4f04-b593-bfe7932a34f7";

export function StytchProvider({ children }: { children: ReactNode }) {
  // Client is created strictly after mount: the server AND the first client
  // render both emit null, so hydration matches (constructing during render
  // caused React #418/#525 — SSR null vs client tree).
  const [stytch, setStytch] = useState<ReturnType<typeof createStytchB2BClient> | null>(null);
  useEffect(() => { setStytch(createStytchB2BClient(STYTCH_PUBLIC_TOKEN)); }, []);
  if (!stytch) return null;
  return <StytchB2BProvider stytch={stytch}>{children}</StytchB2BProvider>;
}
