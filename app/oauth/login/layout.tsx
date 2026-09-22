"use client";
import { type ReactNode } from "react";
import { StytchProvider } from "../../../components/StytchProvider";

export default function OAuthLoginLayout({ children }: { children: ReactNode }) {
  return <StytchProvider apiBase="provider-oauth">{children}</StytchProvider>;
}
