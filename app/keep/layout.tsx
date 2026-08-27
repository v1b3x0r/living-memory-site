"use client";
// Scopes the Stytch provider to the /keep checkout page only — same boundary
// rule as app/oauth/layout.tsx: the rest of the site stays auth-SDK-free.
import { type ReactNode } from "react";
import { StytchProvider } from "../../components/StytchProvider";

export default function KeepLayout({ children }: { children: ReactNode }) {
  return <StytchProvider>{children}</StytchProvider>;
}
