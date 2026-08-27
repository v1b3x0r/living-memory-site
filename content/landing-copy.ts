// landing-copy.ts — every word on the landing page, in one place.
//
// The copy is frozen (build brief, 2026-08-15). No sentence about what Living
// Memory does may be invented here: if a claim is not in the brief, it has not
// been verified and does not ship. Vocabulary is load-bearing —
//   WORLD = the place. Paid, $9/month, tied to a sign-in, persists.
//   ROOM  = a free instance of one. Dies whole, and does not promote.
//
// THE LINE BETWEEN THEM IS LIFETIME, NOT CAPABILITY (decided 2026-08-22, and
// it supersedes the rule that used to sit in this comment). A room is not a
// crippled world; it is a short one. Do not write copy that gates the core
// cross-agent experience — handoff included — behind the paid tier. What you
// buy is that the place is still there tomorrow.
//
// Never write "your own room" for the paid tier, and never call the free tier
// a world.
//
// RESOLVED 2026-08-23: the stale-on-purpose note that used to sit here is done.
// Free-room handoff deployed to the droplet at 13:14 +07 (PR #15, 3a50d9b) and
// was checked against the live service — a room minted after it answers
// tools/list with eight tools, handoff_post/list/read among them. So the paid
// line no longer claims handoff as its own; what it claims is how long a note
// is allowed to live, which is the lifetime-not-capability rule above.

export const FEEDBACK_EMAIL = "support@viibe.to";

export const landing = {
  nav: {
    links: [
      { label: "How it works", href: "#installer" },
      { label: "Pricing", href: "#pricing" },
    ],
    cta: "Open a room — free",
  },

  hero: {
    // Relocked 2026-08-23 (founder + GPT design round 1): the world is the
    // thing that persists; people and agents are the ones passing through.
    headline: "One world. You and your agents come and go.",
    support: [
      "Across models, devices, and apps.",
      "Tell one agent something today.",
      "Ask a different one about it tomorrow.",
    ],
    cta: "Open a room — free",
    ctaNote: "No signup. No credit card.",
    // Tier 1 mobile onboarding card (2026-08-27, onboarding-deeplink handoff).
    // The claim is the founder-confirmed route (advisor A165): set up once in
    // any browser, then the connection keeps working inside the phone app.
    // "Claude" is named because the deep link goes there; other clients keep
    // the installer below. Probe result: the modal opens, nothing prefills —
    // so the card teaches copy → open → paste, with a hand-navigation
    // fallback because the link rides undocumented internals.
    mobileSetup: {
      title: "On your phone? One minute of setup.",
      body: "Copy the room URL, open Claude's connector form, and paste it in. After that, the room works inside your Claude app — no computer needed.",
      copyLabel: "Copy the room URL",
      openLabel: "Open Claude's connector form",
      fallback: "If the form doesn't open: claude.ai → Settings → Connectors → Add custom connector.",
    },
    trust: [
      "One world, many agents",
      "Private by default",
      "Open source engine",
    ],
  },

  // Deliberately prints no room id — the earlier draft showed a live one.
  //
  // Every row is an event with a real clock time that we watched happen. The
  // 07:01 row is the handoff loop closing in the paid world, server-stamped
  // (h_mstlthyr → Cursor → h_mstm2bke); the others were watched on the wire.
  // Codex, Hermes and OpenClaw are not on this list because we have not run
  // them — the point of the section is that it is a log, not a compatibility
  // matrix.
  happened: {
    heading: "What happened on 15 August",
    timeline: [
      {
        time: "00:07",
        actor: "Cursor",
        text: "invented a codeword of its own and wrote it into the world, addressed to another agent by name.",
      },
      {
        time: "07:01",
        actor: "Cursor",
        text: "found another agent's note by itself, nine seconds after a five-word question.",
      },
      {
        time: "08:46",
        actor: "ChatGPT",
        text: "wrote a memory into a room.",
      },
      {
        time: "09:31",
        actor: "Claude Code",
        text: "read it back, word for word.",
      },
    ],
    notes: [
      "Different vendor, different machine.",
      "Nobody carrying anything.",
    ],
    aside: [
      "You didn't copy anything.",
      "Two apps opened a window into the same world.",
      "A session is just a window into it.",
    ],
    readMore: "Read the write-up →",
  },

  // Narrative section (unnumbered, like `happened` and `dontNeed`): the
  // mental model between the proof and the installer. Copy LOCKED 2026-08-24
  // (founder + design) — see site/docs/section-spec-how-a-world-works.md for
  // the rationale; do not restyle these sentences. The key appears only in
  // the artwork, never in the copy: the picture shows a key changing hands,
  // the sentence says what it means, and "let it in HOW?" is answered by
  // the installer directly below.
  howAWorldWorks: {
    heading: "How a world works",
    beats: [
      "You create a world and start working.",
      "Let an agent into the same world.",
      "Agents come and go. The work stays.",
    ],
  },

  installer: {
    heading: "1 · The installer",
    steps: {
      one: {
        index: "1",
        title: "Open a room",
        note: "No signup. Free, and it stays while you use it.",
        cta: "Open a room",
        scan: "or scan",
        qrCaption: "Room URL appears here after you click.",
      },
      oneLocal: {
        index: "1",
        title: "Run it on this machine",
        note: "One command. Nothing leaves your machine.",
      },
      two: { index: "2", title: "Paste it in" },
      three: {
        index: "3",
        title: "Now do it again — in a second app",
        lines: [
          "Ask that one what you told the first.",
          "That is the whole product.",
        ],
      },
    },
    caption: "First app remembers. Second app recalls. Same world.",
    warning: [
      "Cloud and Local are different worlds. They do not sync.",
      "Free rooms stay while they're used. Inactive rooms are eventually forgotten, and cannot be migrated to a paid world.",
    ],
  },

  // Full-width, most air on the page. Type only — no icons, cards or borders.
  dontNeed: {
    heading: "You probably don't need this yet.",
    columns: [
      "If you only use one AI assistant in one app on one machine, you already have enough memory.",
      "Buy this when 2+ agents and 2+ apps start to collide.",
      "If you're not tired of re-briefing, don't buy this.",
    ],
  },

  whatItsFor: {
    heading: "2 · What it's for",
    cards: [
      {
        title: "Ask any agent where everything stands.",
        body: "Open whichever one is in front of you and ask what's outstanding. It answers from what the others did.",
      },
      {
        title: "Work continues across agents.",
        body: "One fixes the server in the afternoon. Another writes the docs at night. Neither gets re-briefed.",
      },
      {
        title: "Mistakes don't repeat.",
        body: "One agent catches a mistake. Next week a different agent doesn't repeat it.",
      },
      {
        title: "Close a window. The work stays.",
        body: "No open tabs. No context left. The next window opens into the same world.",
      },
      {
        title: "Bring your own superpowers.",
        body: "Use whatever model, whatever client, whatever device. They share one memory.",
      },
    ],
  },

  // The two blocks are deliberately NOT parallel in length or shape.
  pricing: {
    heading: "3 · Your own world",
    room: {
      name: "Room (free)",
      price: "$0",
      lines: [
        "A place to meet.",
        "Exchange and go.",
        "Lasts while you use it.",
        "Then it's gone.",
      ],
    },
    world: {
      name: "World (paid)",
      // Never "per world / month" — there is no multi-world plan.
      price: "$9 / month",
      lines: [
        "A place to put things down.",
        "They stay.",
        "Handoff notes last up to 72 hours.",
        "Keys are 90-day leases (you can revoke).",
      ],
    },
    cta: "Create your world — $9 / month",

    // THE CARDS SAY WHY, THE TABLE SAYS WHAT. That is why both can stand here
    // without the cards having to become symmetric: a room and a world are
    // different kinds of thing (the cards), and a comparison has to be
    // comparable (the table).
    //
    // SHAPED FOR A THIRD COLUMN FROM THE START. Adding a tier is one entry in
    // `columns` and one cell on every row — the component reads the arrays and
    // has no idea how many there are. What it is NOT shaped for is content
    // from a tier that does not exist: every value below is the running
    // product on 2026-08-23, not a roadmap.
    //
    // ROW ORDER IS THE ARGUMENT. Lifetime first — after free rooms got the
    // handoff mailbox it is the only real distinction — then everything the
    // two share, then, last, what to use each one for. A reader who scans
    // top to bottom gets: the difference, the sameness, the decision.
    //
    // "Who can get in" rather than "Sign-in required". Both are true; only one
    // reads as a cost the paid tier adds. A world being reached through an
    // account is what makes it yours, and a room being reached through a URL
    // is a real thing a developer should know before pasting that URL.
    //
    // Live-note caps (8 per room, 32 per world) are left out on purpose: the
    // 32 has never been watched in production, and half a proven row is worse
    // than no row.
    compare: {
      heading: "Compare",
      columns: [
        { name: "Room", price: "free" },
        { name: "World", price: "$9 / month" },
      ],
      // "yes" and "no" render as a mark; anything else prints as written.
      rows: [
        {
          label: "How long it lasts",
          cells: ["While you use it, then gone", "As long as you keep it"],
        },
        {
          label: "A handoff note can live",
          cells: ["up to 72 hours — never outliving the room", "up to 72 hours"],
        },
        {
          label: "Memory — add, search, state, forget",
          cells: ["yes", "yes"],
        },
        { label: "Handoff between agents", cells: ["yes", "yes"] },
        { label: "Keys for agents that can't sign in", cells: ["no", "yes"] },
        {
          label: "Who can get in",
          cells: ["Anyone with the link", "You, plus the keys you mint"],
        },
        {
          label: "Use it for",
          cells: ["Trying it, and a day's work", "Work your agents come back to"],
        },
      ],
    },
    assurance:
      "A key opens the world; it cannot burn it down. A minted client cannot delete or forget memory. Keys are 90-day leases; you can revoke access anytime. Private by default.",
  },

  knownIssues: {
    heading: "Known issues",
    item: "Nothing open right now. The last entry — Claude (web) couldn't open a room — was resolved on 2026-08-23; rooms now work from every client we list.",
    tell: "Tell us about other issues:",
    all: "All known issues →",
  },

  footer: {
    tagline: "Living Memory — The open engine for shared memory across AI agents.",
    invariant: "Agents are visitors. Worlds are not models.",
    copyright: "© 2026 Living Memory. Open source engine.",
    domain: "lme.viibe.to",
  },
} as const;
