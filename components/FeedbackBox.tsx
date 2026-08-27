"use client";
// One-tap problem signal (GTM pass, 2026-08-24 — advisor A144/A145).
//
// The chip click IS the feedback: it captures immediately, so a visitor who
// taps "Something failed" and closes the tab still left evidence. The text
// and email fields are optional detail, joined to the signal by a
// client-generated feedback_id so PostHog reads both events as one story.
//
// Privacy contract (same as telemetry.ts): auto-attached context is kind +
// path only. No world content, no diagnostics, nothing the visitor did not
// type themselves.
import { useState } from "react";
import { track } from "../lib/telemetry";

const KINDS = [
  { id: "failed", label: "Something failed" },
  { id: "wrong-answer", label: "Wrong answer" },
  { id: "cant-continue", label: "Can't continue" },
  { id: "idea", label: "Idea" },
] as const;

type KindId = (typeof KINDS)[number]["id"];

function newFeedbackId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `fb-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }
}

export function FeedbackBox({ variant = "card" }: { variant?: "card" | "link" }) {
  const [open, setOpen] = useState(variant === "card");
  const [kind, setKind] = useState<KindId | null>(null);
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const path = typeof window !== "undefined" ? window.location.pathname : "";

  function pick(next: KindId) {
    const id = feedbackId ?? newFeedbackId();
    setFeedbackId(id);
    setKind(next);
    track("feedback_signal", { feedback_id: id, kind: next, path });
  }

  function sendDetail(e: React.FormEvent) {
    e.preventDefault();
    if (!kind || !feedbackId) return;
    track("feedback_detail", {
      feedback_id: feedbackId,
      kind,
      path,
      ...(message.trim() ? { message: message.trim().slice(0, 2000) } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
    });
    setSent(true);
  }

  if (!open) {
    return (
      <p className="feedback-box__opener-row">
        <button type="button" className="feedback-box__opener" onClick={() => setOpen(true)}>
          Something broke? Tell us
        </button>
      </p>
    );
  }

  return (
    <div className="feedback-box" data-c="FeedbackBox">
      {sent ? (
        <p className="feedback-box__thanks">
          Got it — thank you. If you left an email, we&apos;ll reply there.
        </p>
      ) : (
        <>
          <p className="feedback-box__prompt">
            <strong>Something broke? Wrong answer?</strong> One tap is enough — it reaches us
            even if you write nothing.
          </p>
          <div className="feedback-box__chips" role="group" aria-label="What happened?">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                className={`feedback-box__chip${kind === k.id ? " feedback-box__chip--on" : ""}`}
                onClick={() => pick(k.id)}
              >
                {k.label}
              </button>
            ))}
          </div>
          {kind !== null && (
            <form className="feedback-box__detail" onSubmit={sendDetail}>
              <textarea
                className="feedback-box__text"
                rows={3}
                placeholder="What happened? (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="feedback-box__send-row">
                <input
                  className="feedback-box__email"
                  type="email"
                  placeholder="Email, if you want a reply (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="feedback-box__send">Send</button>
              </div>
            </form>
          )}
          <p className="feedback-box__alt">
            Prefer email? <a href="mailto:support@viibe.to">support@viibe.to</a>
          </p>
        </>
      )}
    </div>
  );
}
