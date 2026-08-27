// whats-new.ts — the changelog, and the only source the ticker reads from.
//
// One list, two surfaces: the strip at the top of every page and the index at
// /whats-new/. They cannot disagree, because there is nowhere for them to
// disagree from.
//
// TWO DATES, AND THE DIFFERENCE IS THE POINT.
//
//   merged   — the day the change reached main. Read it off git; it is a fact
//              about this repository and nothing else. NOT a release date:
//              this project deploys by hand, so main can lead production by
//              hours. Wherever it is SHOWN it must be labelled "Merged".
//              Codex caught it printed bare in the ticker, under a heading
//              that says "New" — split in the data and joined again in the
//              markup is not split at all.
//   verified — the day a person opened the RUNNING product and watched this
//              work. Not "the tests pass". Not "it merged". Somebody called it
//              and saw the answer.
//
// A changelog is worth exactly what its worst row is worth, and the way these
// rot is always the same: a merge date gets printed as a ship date, and months
// later the page is quietly advertising something that never deployed. So a
// row without a `verified` date does not ship. If you cannot say who checked
// it and when, the honest move is to leave the entry out until you can.
//
// This list is also why there is no CMS: five rows in a typed array cannot
// drift out of sync with the site that renders them.
//
// Newest first. The ticker reads the top TICKER_LIMIT of them.

export interface NewsEntry {
  /** Day the change reached main. From git, not from memory. Never shown unlabelled. */
  merged: string;
  /** Ticker-length. It has to survive being read sideways at speed. */
  title: string;
  /** One sentence, for the index. What changed, not how it was built. */
  blurb: string;
  /** Only when a write-up actually exists. A row with no page has no link. */
  href?: string;
  /** Day someone last watched this work against production. Required. */
  verified: string;
  /** What they actually did to check. Kept honest by having to be written. */
  verifiedBy: string;
}

export const WHATS_NEW_LEDE =
  "These are the recent changes, newest first — not every commit, and no attempt to be a full history. Every row carries the day it was merged and the day somebody last opened the running product and watched it work. Those are different dates — this project deploys by hand — and a row that only has the first one does not belong on this page.";

/** How many entries the top strip cycles through before repeating. */
export const TICKER_LIMIT = 4;

export const WHATS_NEW: readonly NewsEntry[] = [
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
