"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be denied; the text stays selectable below.
    }
  }

  return (
    <button className="button button--primary" type="button" onClick={copy}>
      {copied ? "Copied ✓" : label}
    </button>
  );
}
