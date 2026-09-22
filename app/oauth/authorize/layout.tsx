"use client";
import { type ReactNode } from "react";
import { StytchProvider } from "../../../components/StytchProvider";

export default function OAuthAuthorizeLayout({ children }: { children: ReactNode }) {
  return <StytchProvider>{children}</StytchProvider>;
}
