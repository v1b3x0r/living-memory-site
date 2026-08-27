"use client";
// Signed-in avatar chip: first letter of the member's email on a color picked
// deterministically from the email, opening a small account menu. Renders
// nothing without a session, so it can sit on any Stytch-scoped page.
// Today the menu holds the signed-in email and Sign out; settings/API keys
// land here later.
import { useEffect, useRef, useState } from "react";
import {
  useStytchB2BClient,
  useStytchMember,
  useStytchMemberSession,
} from "@stytch/react/b2b";

// Distinct, ink-friendly hues that sit alongside the ocean palette.
const AVATAR_COLORS = [
  "#1e4d7a", // ocean
  "#2e7d4f", // green
  "#7a4da0", // purple
  "#a2372c", // rust
  "#b0762e", // amber
  "#3a7cab", // water
];

function colorForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function AuthAvatar() {
  const stytch = useStytchB2BClient();
  const { session } = useStytchMemberSession();
  const { member } = useStytchMember();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(ev: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!session) return null;

  const email = member?.email_address ?? "";
  const letter = (email[0] ?? "?").toUpperCase();

  async function signOut() {
    setSigningOut(true);
    try {
      await stytch.session.revoke();
    } finally {
      // Reload so every page falls back to its signed-out state cleanly.
      window.location.reload();
    }
  }

  return (
    <div className="avatar" ref={rootRef}>
      <button
        type="button"
        className="avatar__chip"
        style={{ background: colorForEmail(email) }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={email ? `Account: ${email}` : "Account"}
        onClick={() => setOpen((v) => !v)}
      >
        {letter}
      </button>
      {open && (
        <div className="avatar__menu" role="menu">
          <p className="avatar__email">{email || "Signed in"}</p>
          <button
            type="button"
            role="menuitem"
            className="avatar__action"
            disabled={signingOut}
            onClick={signOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
