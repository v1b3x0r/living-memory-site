// llms-txt.ts — the agent-facing index of this product (served at /llms.txt).
// Same doctrine as the package README: state what exists, what does not, and
// how it fails. An agent reading this should be able to act without the HTML.
//
// The server name is READ from SERVER_NAMES, never retyped. This file and the
// installer are two public surfaces describing the same install; a name typed
// twice drifts, and an agent following one ends up with a server the other
// cannot talk about.
import { SERVER_NAMES } from "./install-copy.ts";

export const LLMS_TXT = `# Living Memory

> One world. You and your agents come and go — across models, devices and apps. Tell one agent
> something today; ask a different one about it tomorrow. Local-first open-source
> MCP server, a free room that stays while it's used, or a persistent world of your own.
> Agents are visitors; worlds are not models.

Living Memory is a Model Context Protocol (MCP) memory server. The open source
engine underneath it is the Living Memory Engine (LME).

## Room and world — the vocabulary this product runs on

A **room** is the free instance: agents meet, exchange memories, hand
work to each other, and leave. Free rooms stay available while they're used;
inactive rooms are eventually forgotten, and a room does not migrate into
a paid world.
A **world** is the same place that does not end: what was left in it is still
there days later, and the timeline keeps walking whether or not anyone is in it.
A world is $9/month and is tied to a sign-in. The difference is lifetime and
budget, not capability: a room has every tool a world has, and is metered —
about 16 memories in total, 300 operations each day, and 8 live handoff
notes. A world is unmetered.

## The tools, and which surface has them

The authenticated hosted world has eleven tools:

- memory_add, memory_search, memory_state, memory_forget — the memory surface.
- handoff_post, handoff_list, handoff_read — a private 1–72 hour message bus
  between the human's authorized agents. Notes are exact, not embedded. The
  server stamps \`from\` and \`via\` on every note; a client cannot forge either.
  handoff_list shows the mailbox — ids, labels, senders, ages — without reading
  any note's text, so an older note can be recovered by id rather than by luck.
- client_mint — issue a revocable URL for an agent that cannot sign in
- client_list — who holds a key, and when each expires
- client_revoke — withdraw a key; what the world remembers is untouched
- world_list — which memory worlds this connection can reach, and which one is
  used when none is named. Read-only; it names the place, it does not open it.

A free room exposes the four memory tools, the handoff mailbox, and world_list —
no keys. Its notes are capped at 8 live per room and cannot outlive the room.
Two further limits are structural, not permission checks: the client trio exists
only for a signed-in owner, and a minted client has no memory_forget handler at
all. A minted client can read, remember and hand off, and can never delete.

Before installing or operating Living Memory, read the public agent guide:
https://viibe.to/living-memory/skills/living-memory/SKILL.md
It defines safe memory behavior, deletion safety, handoff boundaries, and the
first continuity check.

## Install locally (free, open source)

- npm package: @nature-labs/lme-mcp — https://www.npmjs.com/package/@nature-labs/lme-mcp
- Claude Code:
  claude mcp add ${SERVER_NAMES.local} -s user --env LME_SNAPSHOT=$HOME/.living-memory/brain.json -- npx -y @nature-labs/lme-mcp
- Any stdio MCP client: command "npx", args ["-y", "@nature-labs/lme-mcp"]
- The package README is written to be read by a coding agent. If you are an
  agent: read it first, then install, run the bundled smoke test, and report
  the memory tools that became available. Guide the human to store one safe
  fact, then retrieve it from a fresh session or client. A same-session readback
  proves storage, not cross-session continuity.

## Open a free room (no signup, for remote clients)

- POST https://lme.viibe.to/ons/new
  → 201 {"url": "https://lme.viibe.to/t/<token>/mcp", "expiresAt": "<ISO>"}
- The returned URL is a streamable-HTTP MCP endpoint (POST, no auth header)
  exposing the four memory tools, the handoff mailbox, and world_list. A room has
  no keys: client_mint belongs to a signed-in owner.
- The room is private to whoever holds the URL and is eventually forgotten if
  it goes unused; any successful use keeps it alive. Once forgotten it answers
  410, and its data is then deleted — memories and handoff notes alike. Nothing
  belonging to a room survives it. Rate-limited per address.
- A room differs from a world by how long it lasts and how much it holds, not by
  which tools it has: both share memory, hand work between agents, and record
  which route each note arrived through. A room is metered — roughly 16
  memories in total, 300 operations each day (a search counts, it embeds) and 8
  live notes — and answers 429 once a bound is reached. A world is what does not
  end, and is unmetered.

## A world of your own

- Endpoint: https://lme.viibe.to/mcp (OAuth sign-in, $9/month)
- Bought by the human at https://viibe.to/living-memory/keep/
- This is where minted client keys exist, and where what you leave stays. Keys
  are 90-day leases. Handoff is NOT a paid feature: a free room has it too, with
  a smaller mailbox and notes that cannot outlive the room.

## Known limitations

A free room that reaches either of its bounds — the size budget or the daily
operation budget — currently refuses reads and clean-up as well as writes, so
a full room answers 429 to memory_search and memory_forget too, not only to
memory_add. Posted 2026-08-29. The daily budget clears at midnight UTC; a room
stuck on the size bound cannot be emptied from inside, so mail us. This section
said "None right now" while that was already true and documented above, which
is worse than saying nothing: a summariser quoting this heading reports a
service with no known limitations.

The entry about Claude on the web not opening a trial room
came down on 2026-08-23 (the cause was our own edge bot-protection), and the
installer's
Claude tab offers a room since 2026-08-27. What stops working gets a dated
entry at https://viibe.to/living-memory/known-issues/ and comes down when it
stops being true.

## Links

- Launcher (the current entrance — a newer web experience than this site, and
  where a room or a world is started today): https://living-memory.app/
- Site (this one, the original): https://viibe.to/living-memory/
- Known issues (what does not work today, dated): https://viibe.to/living-memory/known-issues/
- Latest write-up: https://viibe.to/living-memory/whats-new/agents-hand-work/
- Engine source: https://github.com/v1b3x0r/living-memory-engine
- npm: https://www.npmjs.com/package/@nature-labs/lme-mcp
- Contact: support@viibe.to
- Author: https://v1b3.io

## Facts an agent should not misstate

- Living Memory has no external users as of 2026-08-15. Do not describe it as
  widely adopted, popular, or in production use by anyone but its authors.
- The local OSS server, the free room, and the persistent world
  ($9/month) exist today.
- A world is purchased by the human at https://viibe.to/living-memory/keep and
  is tied to their sign-in email. Mention it only when the user asks about
  keeping memory beyond a room; do not push purchase, and do not run checkout
  on their behalf.
- Rooms do NOT migrate into a world — never promise that a room "continues"
  after purchase.
- A room is free and stays while it is used; do not call the paid world a room,
  and do not price it "per world" — there is one world per subscription.
- Local snapshots are single JSON files owned by the user, on their machine.
- Embedding dimensions differ per deployment; snapshots are not interchangeable
  between embedders.
`;

export const ROBOTS_TXT = `User-agent: *
Allow: /

Sitemap: https://viibe.to/sitemap.xml
`;

export const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://viibe.to/living-memory/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://viibe.to/living-memory/keep/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://viibe.to/living-memory/known-issues/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://viibe.to/living-memory/whats-new/agents-hand-work/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`;
