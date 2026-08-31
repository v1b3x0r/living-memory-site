// whats-new.ts — what a person can see, try, or discover right now.
//
// One list, two surfaces: the strip at the top of every page and the index at
// /whats-new/. They cannot disagree, because there is nowhere for them to
// disagree from.
//
// THIS IS NOT AN ENGINEERING CHANGELOG.
//
// It was one, and the field that made it one was `merged`, which the old
// doctrine defined as "a fact about this repository and nothing else". A
// required field with that definition is not a date — it is the edge of the
// world. Everything real that happens outside this repository falls off it
// automatically, with nobody deciding to leave it out: a shop whose front desk
// runs on a room, an agent from another company that connects, a world in
// production doing the thing the product is for. Living Memory is not one
// repository any more — engine, MCP over stdio, MCP over HTTP, the site — and a
// reader has never cared which of those a change landed in. They care what is
// different for them.
//
// So the question a row has to answer is: WHAT CAN A HUMAN SEE, TRY, OR
// DISCOVER NOW? An engineering change earns a row only when it produced
// something observable from outside. A flag that hides a tool from a listing is
// a real change and does not belong here; it belongs on the known-issues page,
// where a reader goes to find out why something is missing.
//
// TWO DATES, AND THE DIFFERENCE IS STILL THE POINT.
//
//   verified — REQUIRED. The day a person opened the RUNNING product and
//              watched this work. Not "the tests pass". Not "it merged".
//              Somebody called it and saw the answer. This is the date the
//              reader is shown, because it is the only one that is about them.
//   merged   — OPTIONAL, and only ever a fact about a repository we happen to
//              own. Read it off git or leave it out. It is NOT a release date:
//              this project deploys by hand, so main can lead production by
//              hours. Wherever it is SHOWN it must be labelled "Merged" —
//              Codex caught it printed bare under a heading that says "New",
//              and split in the data but joined in the markup is not split.
//
// A changelog is worth exactly what its worst row is worth, and a page that
// says "go and look" is worth less than that when the looking fails — a stale
// row is boring, a broken invitation is a person standing in front of the
// thing, watching it not work. So a row without a `verified` date does not
// ship. If you cannot say who checked it and when, leave it out until you can.
//
// This list is also why there is no CMS: a few rows in a typed array cannot
// drift out of sync with the site that renders them.
//
// Newest first. The ticker reads the top TICKER_LIMIT of them.

export interface NewsEntry {
  /** Ticker-length. It has to survive being read sideways at speed. */
  title: string;
  /** One sentence, for the index. What is different for a reader. */
  blurb: string;
  /** Day someone last watched this work against production. Required. */
  verified: string;
  /** What they actually did to check. Kept honest by having to be written. */
  verifiedBy: string;
  /**
   * Where to go and what to notice when you get there. Optional, because some
   * rows are their own instruction — but when there is somewhere to look, a
   * reader should not have to work out where.
   */
  tryIt?: { href: string; label: string; notice: string };
  /** Only when a write-up actually exists. A row with no page has no link. */
  href?: string;
  /** Day the change reached main, when there is a main it reached. From git. */
  merged?: string;
}

export const WHATS_NEW_LEDE =
  "These are the recent things you can see, try, or find for yourself — newest first, not every commit, and no attempt to be a full history. Every row carries the day somebody last opened the running product and watched that thing work; a row that cannot name that day does not belong on this page. Some of it happened in this codebase and some of it happened out in the world, and the page does not rank those differently, because you cannot tell the difference from where you are standing.";

/** How many entries the top strip cycles through before repeating. */
export const TICKER_LIMIT = 4;

export const WHATS_NEW: readonly NewsEntry[] = [
  {
    title: "A cat hotel's front desk runs on a room",
    blurb:
      "WINK Grooming & Hotel in Chiang Mai runs its real front desk through a Living Memory room. The shop's prices, its rooms and its boarding rules live in the room rather than in the code, so the people who run the shop can change what the agent says without anyone deploying anything.",
    tryIt: {
      href: "https://winkgrooming.com",
      label: "winkgrooming.com",
      notice:
        "open the chat and ask a price in Thai or in English. Notice that it asks how much your cat weighs before it quotes one, that it works out three nights at ฿300 a night on its own, and that when the shop has not written something down it sends you to the shop's LINE instead of inventing an answer. Nothing in that widget's code knows a single price.",
    },
    verified: "2026-09-01",
    verifiedBy:
      "asked the live endpoint four questions from outside, in Thai and English, and read the answers: the bath question came back asking for weight and coat length, three nights came back as ฿900, and a question the room has no answer for came back as a hand-off to LINE rather than a guess",
  },
  {
    merged: "2026-08-29",
    title: "A free room now tells you how much it holds",
    blurb:
      "The pricing table gained a line the page had been quiet about: a free room fits about 16 memories in total, and allows 300 operations each day — a search counts as one, because it embeds. The room card also says the number instead of implying one — a room stays 21 days from your last visit, and each visit moves that. Nothing changed about what a room can do; we were simply not saying what it costs to use one.",
    verified: "2026-08-29",
    verifiedBy:
      "read the bounds in the running server source rather than inferring them, then fetched the live page from outside on both the slash and no-slash paths and checked the retired wording was gone, not just the new wording present",
  },
  {
    merged: "2026-08-26",
    title: "A room now stays as long as you use it",
    blurb:
      "The fixed 24-hour lifetime is gone: a free room stays available while it's used — any successful use keeps it alive — and an inactive room is eventually forgotten, its data deleted with it. Entries below this one still say \"24-hour\"; those numbers were true on their day.",
    verified: "2026-08-27",
    verifiedBy:
      "minted a room and read its grant: kept at least until a date three weeks out, with use extending it; the previous day's deploy check watched an idle room answer 410 'forgotten after a long period of inactivity'",
  },
  {
    merged: "2026-08-25",
    title: "Claude on the web can open a free room now",
    blurb:
      "The known-issues entry that said it couldn't is down. The cause was ours after all — a bot-protection default on our edge rejected the connection before it reached the server — despite the original entry saying it wasn't something we could fix from our side.",
    verified: "2026-08-23",
    verifiedBy:
      "turned the edge setting off and watched claude.ai connect to a room it had refused minutes earlier; a third-party monitor went green the same minute",
  },
  {
    merged: "2026-08-23",
    title: "A free room can hand work between agents",
    blurb:
      "The handoff mailbox is no longer something you have to pay for. A free 24-hour room now carries handoff_post, handoff_list and handoff_read alongside memory — and a note in a room cannot outlive the room: ask for 72 hours and you get the room's own 24.",
    verified: "2026-08-23",
    verifiedBy:
      "minted a room on lme.viibe.to, posted a handoff and read it back; a 72h ask came back clamped to the room's own 24h",
  },
  {
    merged: "2026-08-21",
    title: "See the mailbox without reading it",
    blurb:
      "handoff_list shows every note waiting in a world — who left it, how old it is, how big it is — without opening any of them. An agent can tell whether there is anything to pick up before it decides to look.",
    verified: "2026-08-22",
    verifiedBy: "called against the live server",
  },
  {
    merged: "2026-08-16",
    title: "Delete your world yourself, from the website",
    blurb:
      "Sign in at /keep and the delete button is there. It runs on the same host as the memory it deletes, so nothing waits in a queue for a human to action later.",
    verified: "2026-08-22",
    verifiedBy: "route answered in production",
  },
  {
    merged: "2026-08-15",
    title: "Agents can now hand work to each other",
    blurb:
      "Two applications, from two different companies, passed work between them through one Living Memory world — in both directions, with nobody carrying the message. The write-up keeps the part that failed.",
    href: "agents-hand-work",
    verified: "2026-08-22",
    verifiedBy: "handoff read back across two vendors",
  },
  {
    merged: "2026-08-15",
    title: "The known-issues page, maintained by hand",
    blurb:
      "What does not work, with the date each limitation was last checked. At the time, Claude on the web could not open a free room; that entry stayed up until it stopped being true.",
    verified: "2026-08-22",
    verifiedBy: "page served in production",
  },
  {
    merged: "2026-08-14",
    title: "See every key into your world, and when it expires",
    blurb:
      "Agents that cannot sign in — a CLI, an editor — hold a key instead of an account. The owner can now list them: who holds each one, and the day it runs out. Keys are 90-day leases.",
    verified: "2026-08-22",
    verifiedBy: "client_list showed two live keys and their expiry",
  },
] as const;
