"use client";
// Scopes the Stytch provider to the OAuth pages only — the rest of the site
// renders without any auth SDK.
import { type ReactNode } from "react";
import { StytchProvider } from "../../components/StytchProvider";

export default function OAuthLayout({ children }: { children: ReactNode }) {
  return <StytchProvider>{children}</StytchProvider>;
}
