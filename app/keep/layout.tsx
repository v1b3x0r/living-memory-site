"use client";
// Scope the Stytch provider to /keep; presentation pages stay auth-SDK-free.
import { type ReactNode } from "react";
import { StytchProvider } from "../../components/StytchProvider";

export default function KeepLayout({ children }: { children: ReactNode }) {
  return <StytchProvider>{children}</StytchProvider>;
}
