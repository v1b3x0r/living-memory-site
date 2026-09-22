"use client";
// Stytch B2B provider shared by /oauth and /keep; presentation pages stay provider-free.
import { type ReactNode, useEffect, useState } from "react";
import { StytchB2BProvider, createStytchB2BClient } from "@stytch/react/b2b";

// Public by design (ships to every browser). Live-env token (cutover 2026-08-13).
// Connected App consent uses the project's OIDC issuer. Google/GitHub discovery
// must start at the dashboard's provider callback host, api.stytch.com.
const STYTCH_API_DOMAIN = "https://exciting-kayak-4871.customers.stytch.com";

const STYTCH_PUBLIC_TOKEN = "public-token-live-e5c546bf-e46a-4f04-b593-bfe7932a34f7";

export function StytchProvider({ children, apiBase = "issuer" }: { children: ReactNode; apiBase?: "issuer" | "provider-oauth" }) {
  // Client is created strictly after mount: the server AND the first client
  // render both emit null, so hydration matches (constructing during render
  // caused React #418/#525 — SSR null vs client tree).
  const [stytch, setStytch] = useState<ReturnType<typeof createStytchB2BClient> | null>(null);
  useEffect(() => {
    // Google/GitHub return to api.stytch.com in this project. Their discovery
    // start must use that same host; Connected App consent uses the OIDC issuer.
    const options = apiBase === "issuer" ? { customBaseUrl: STYTCH_API_DOMAIN } : undefined;
    setStytch(createStytchB2BClient(STYTCH_PUBLIC_TOKEN, options));
  }, [apiBase]);
  if (!stytch) return null;
  return <StytchB2BProvider stytch={stytch}>{children}</StytchB2BProvider>;
}
