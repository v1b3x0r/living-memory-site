"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  CLAUDE_CONNECTOR_DEEPLINK,
  SERVER_NAMES,
  stepTwo,
} from "../lib/install-copy";
import { parseShareFragment } from "../lib/share-link";
import { BASE_PATH } from "../lib/base-path";
import { track } from "../lib/telemetry";
import { CopyButton } from "./CopyButton";
import { ClaudeMark, OpenAiMark } from "./ClientMarks";

/**
 * The receiving end of a share link (2026-08-27 dogfood: a raw room URL in a
 * chat hands a friend a credential with no door). The room arrives in the URL
 * FRAGMENT — read client-side only, never sent to any server — and only our
 * own room shape renders (see share-link.ts).
 *
 * Three doors by design: a Claude deep link for people who don't want to hunt
 * for menus, spelled-out ChatGPT steps, and the raw URL for anyone who knows
 * their own client. No name field — rooms have no names to set.
 */
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export function JoinRoom() {
  // The fragment is an external store the server never sees: the server
  // snapshot is null (renders nothing, as before), the client snapshot is the
  // live hash — and a hashchange re-renders for free.
  const hash = useSyncExternalStore<string | null>(
    subscribeToHash,
    () => window.location.hash,
    () => null,
  );
  const room = hash === null ? null : parseShareFragment(hash);

  useEffect(() => {
    if (room !== null) track("join_page_opened");
  }, [room]);

  if (hash === null) return null;

  if (room === null) {
    return (
      <>
        <p className="policy-page__lede">
          <strong>This invite link is missing its room.</strong>
        </p>
        <p>
          The room address travels after the <code>#</code> in the link — some
          apps trim it. Ask whoever sent it to copy the invite link again and
          resend it whole.
        </p>
        <p>
          Or skip the invite and{" "}
          <a href={`${BASE_PATH}/`}>open a room of your own</a> — free, no
          signup.
        </p>
      </>
    );
  }

  const claude = stepTwo("claude", "cloud", room);
  const chatgpt = stepTwo("chatgpt", "cloud", room);

  return (
    <>
      <p className="policy-page__lede">
        <strong>
          Someone opened a shared memory room and wants you in it.
        </strong>
      </p>
      <p>
        A room is a place your AI can remember things together with theirs —
        tell your assistant something today, their assistant can recall it
        tomorrow. Connecting takes about a minute: pick your app below, paste
        one address, done.
      </p>
      <pre className="code code--room">{room}</pre>
      <p className="step__note">
        Anyone holding this address can read and write this room — don&apos;t
        post it publicly. The room stays available while it&apos;s used;
        left unused it is eventually forgotten.
      </p>

      <h2 className="join-door">
        <ClaudeMark size={20} /> Using Claude?
      </h2>
      {claude.lines.map((line) => (
        <p className="step__note" key={line}>
          {line}
        </p>
      ))}
      <div className="join-actions">
        <CopyButton text={room} label="Copy the room address" />
        <a
          className="button button--secondary"
          href={CLAUDE_CONNECTOR_DEEPLINK}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("join_claude_deeplink")}
        >
          Open Claude&apos;s connector form
        </a>
      </div>
      <p className="step__note">
        If the form doesn&apos;t open: claude.ai → Settings → Connectors → Add
        custom connector.
      </p>

      <h2 className="join-door">
        <OpenAiMark size={20} /> Using ChatGPT?
      </h2>
      {chatgpt.lines.map((line) => (
        <p className="step__note" key={line}>
          {line}
        </p>
      ))}
      <CopyButton text={room} label="Copy the room address" />

      <h2>Another app, or you know your way around?</h2>
      <p className="step__note">
        Add the address above as a remote MCP server (streamable HTTP or SSE,
        no auth header) and name it {SERVER_NAMES.room}. The{" "}
        <a href={`${BASE_PATH}/#installer`}>full guide</a> covers Cursor,
        Claude Code, and everything else.
      </p>
    </>
  );
}
