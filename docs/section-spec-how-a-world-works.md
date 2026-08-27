# Section spec — "How a world works" (mental-model bridge)

```
status: PROPOSAL — approved for spec only, no code, no asset yet
date:   2026-08-24 · against repo sha 0550416 + uncommitted round-2 tree
author: Claude Code, from the founder's brief (design/spec proposal only)
```

## 1 · Should it exist? — YES, the gap is real, with one guard

The current sequence is Hero (*what this world is*) → WhatHappened (*proof it
happened*) → Installer (*how to connect*). The reader jumps from a timeline of
four events straight into "paste this URL" — the MECHANISM (work is left in a
place; the place outlives the session; a later agent picks it up) is never
stated. Today it must be inferred from the timeline, and the timeline is
deliberately a log, not an explanation. `<WhatItsFor/>` describes outcomes
("Work continues across agents") but as benefits, after the installer — too
late and not mechanical.

The guard: this section must stay **explanatory and static** (see §7) and
carry **no product claims beyond what is already verified** — it explains the
same facts the timeline proves, it does not add new ones. Under the site's
maintenance-budget rule it is safe: no live data, no state, nothing to go
stale except vocabulary.

## 2 · Canonical position

**Between `<WhatHappened/>` and `<Installer/>`.** Proof → model → practice:
the reader has just seen four real events; this section names the pattern
they just witnessed; the installer then lets them do it. Same position on
desktop and phone (the page never re-sequences — standing rule).

An observation that settles numbering: the page's numbered headings (1 ·
The installer, 2 · What it's for, 3 · Your own world) are all DO-sections;
the narrative sections (What happened on 15 August, You probably don't need
this yet) are unnumbered. This section is narrative → **unnumbered**. No
renumbering diff, no copy churn in the numbered set.

## 3 · The three beats — OWNER-LIFECYCLE REVISION (founder, 2026-08-24 00:51)

> Supersedes the first draft's write→persist→recall beats. The founder's
> frame: this is the lifecycle of a WORLD from its owner's perspective, not
> a handoff lifecycle. Semantics were checked against repo truth before
> this revision — see the claimability note under beat 2.

The old visual draft's beats — *Open a room / Invite your agents / Share
memories* — remain off-model for the reasons the first draft gave ("Invite"
= PR-C human-membership collision; "Share memories" = retired possession
frame). The owner-lifecycle replaces them:

  **Beat 1 — You create a world and work in it.**
  The owner opens the place and starts putting work down. The world is
  yours before it is anyone else's.

  **Beat 2 — You hand a key to another agent.**
  Access is GRANTED by the owner, agent by agent — the metaphor is a key
  changing hands, never agent A sending something to agent B, and never a
  person being invited.
  CLAIMABLE TODAY, with production evidence: `client_mint` issues "a
  revocable URL for an agent that cannot sign in" (llms.txt); "Keys are
  90-day leases (you can revoke)" (pricing card); "A key opens the world;
  it cannot burn it down" (assurance line); "You, plus the keys you mint"
  (compare table). The receiver of a key is ALWAYS an agent — that is
  exactly what keeps this outside PR-C, whose unshipped mechanism is
  inviting HUMANS. Forbidden vocabulary in copy: invite · member · join ·
  "share your world with someone". Forbidden imagery: envelopes,
  invitation cards, a second human receiving anything.

  **Beat 3 — Agents come and go. The world keeps the work.**
  Visitors change; the place and what was put down stay. One agent leaves
  through the arch, a different one sits down at the same table, finds what
  was left, continues. This beat closes the loop with the H1 ("One world.
  You and your agents come and go.") — the section ends where the hero
  began, now explained.

Three beats, one per zone. The timeline's own arc (wrote 08:46 → held →
read back 09:31) is now the EVIDENCE for beat 3 specifically.

## 4 · What the picture MUST show / MUST NOT imply

MUST SHOW
- ONE persistent place across all three beats — same table, same room; time
  passes around it (light changes), the place does not.
- Beat 1: the OWNER present and working — the world begins as theirs.
- Beat 2: a key changing hands, owner → agent. The key is small and the
  world is large (a key is a lease, not a deed). The receiver is a hooded
  agent figure in the hero's own visual language.
- Beat 3: DIFFERENT figures than before at the same table — one leaving,
  another arriving/seated, finding the work already on the table.
- Continuity of the work: what beat 1 puts down is visibly what beat 3's
  visitor finds.

THE OWNER'S DEPICTION (design decides, all three are semantics-safe):
  (i)  a distinct non-hooded figure — clearly THE person, singular;
  (ii) only a hand extending the key at the frame's edge (owner implied);
  (iii) figureless — the key left waiting at an empty chair.
  Whichever is chosen, the owner must never read as "a second customer" —
  one human total, everywhere on this page.

MUST NOT IMPLY
- **No agent-to-agent channel.** No arrow, beam, speech line, or handshake
  BETWEEN AGENTS. The only hand-to-hand moment on the page is owner→agent,
  and the object is a key (access), never work (content). Work moves
  through the place; keys move through the owner. Two different verbs, and
  the picture must keep them apart.
- No carrying of work: memory is not a box an agent walks out with.
- No second human (PR-C boundary). No envelopes, invitation cards, or
  welcome-at-the-door staging — the key is a granted lease, not an
  invitation.
- No crowd at the threshold: keys are minted one agent at a time.
- No room→world promotion, no paid/free gating of any beat (lifetime, not
  capability), no vendor logos on figures.
- No "sync/copy" imagery (two places mirroring). One place, many windows.
- Keys note: keys are a WORLD feature (a room has none — "anyone with the
  link"). The section is titled for the world, so this is honest — but the
  copy must not phrase beat 2 so that a free-room reader concludes the
  room cannot run the same loop (it can, by handing the URL itself).

## 5 · Copy hierarchy

**LOCKED — founder + design, 2026-08-24 01:02. Byte-exact; do not restyle.**

```
eyebrow   (none — narrative sections carry no number/eyebrow)
heading   How a world works
beat 1    You create a world and start working.
beat 2    Let an agent into the same world.
beat 3    Agents come and go. The work stays.

footnote  (optional, design's call at mockup time)
          "First app remembers. Second app recalls. Same world."
          (REUSE — installer.caption, pre-approved)
```

Why these four, so nobody relitigates them:
- The progression is YOU → YOU + AGENT → AGENTS over time; the world is
  created BEFORE any agent enters it, which is the ontology itself.
- Beat 2 is human-language on purpose: "key" is the PICTURE's vocabulary,
  not the copy's. The drawing shows a key changing hands; the sentence
  says what the key MEANS (letting an agent into the same world). A reader
  never needs to learn `client_mint` here — and the natural next question
  ("let it in HOW?") is answered by the very next section, the Installer.
  "the same world" is already approved site vocabulary (the WhatHappened
  aside and the installer caption both use it).
- Beat 3 builds its opposition inside one sentence — agents come and go /
  the work stays — without re-saying "world" (heading, beat 1, beat 2 and
  the unchanged table in the artwork already carry it), and it echoes the
  H1 without copying it.
- Heading: NOT "How it works" — that label already exists in nav + footer
  pointing at `#installer`; one label, two targets breaks the nav's
  promise.
- Vocabulary rails still stand: key · mint · revoke · lease are shipped
  words if ever needed in supporting copy; invite · member · join ·
  share-with are forbidden until PR-C ships.

## 6 · Single-asset composition requirements

> AMENDED 2026-08-24 01:21 (design confirmation): **triptych plates are the
> official art direction** — three distinct watercolor plates from one
> master; the same world/table provides continuity, each beat its own
> scene. "One continuous scene" below is superseded. Section ground =
> washed band (not a bordered panel) — plates sit on the world, not inside
> another UI container. Implemented as three crops of the v2 master
> (site-v4-how-v2.jpg → lme-how-{1,2,3}.webp).

One master artwork, one continuous scene — NOT three assets, NOT cards.

```
master:    ~3:1 panorama (≥3000×1000), same watercolor system as WorldEnv,
           near-white paper ground (multiply-compatible), no text baked in
reading:   left → right = beat 1 → 2 → 3, one zone per beat,
           SAME table appearing in all three zones (or one long table
           passing through them); time shown by light (lantern → moon),
           not by panel borders
left edge: fades to paper (labels column / mobile crops need it)
zones:     each third must survive being CROPPED to ~4:3 and still read —
           this single constraint is what lets one artwork serve both
           layouts below
zone 1:    the owner at the table, first papers going down — the world
           young and sparsely furnished
zone 2:    the threshold/arch — the key changing hands, owner → hooded
           agent (per §4's owner-depiction options); the table visible
           beyond, unattended but holding the work
zone 3:    the same table, richer with papers — one hooded figure leaving
           through an arch, a DIFFERENT one seated, reading what was left;
           lighting has moved (lantern → moon) to say time passed
```

- Desktop: the panorama spans the section under the heading; the three beat
  labels sit under their zones (plain text, no cards). The section itself is
  a panel like its siblings OR a washed narrative band like DontNeedThis —
  design's call; either respects the paper-wash invariant.
- Mobile: the SAME master, presented as three stacked crops (one per zone),
  label under each. Three crops of one artwork is not three assets — the
  composition stays single-source; a change to the scene changes all crops.
- Budget: master webp ≤150KB (the site's existing hero-asset budget); crops
  served from the same file via CSS object-position, not separate files,
  unless quality forces pre-cropped variants (then they are derived crops of
  the master, regenerated together, never drawn separately).

## 7 · Interaction — none

Purely explanatory and static. No tabs, no state, no JS, no hover reveals.
An `id` anchor (e.g. `#how-a-world-works`) for future linking is the only
affordance. If motion is ever proposed (a note fading in per scroll), that
is a separate STRUCTURAL declaration; v1 ships without it.

## 8 · Accessibility / reduced-motion / fallback

- The meaning lives in the visible text: heading + three beat labels are
  complete sentences that tell the whole story with images absent or unloaded
  — that IS the fallback, no alt-text novel needed.
- The artwork is therefore decorative: `alt=""` / `aria-hidden`, exactly like
  `<WorldEnv/>`.
- Semantics: `<section aria-labelledby>` + `h2`; beats as an `<ol>` of three
  items (the order is the content), labels as the list items' text.
- Static section → nothing to do for `prefers-reduced-motion` in v1; if
  motion is ever added it must fully disable under it (site-wide rule).
- Contrast: labels on paper ground per the paper-wash invariant; never text
  over the busy zone of the artwork.

## 9 · Contract classification & blast radius

Classification: **NEW COMPONENT — STRUCTURAL** (page order changes), founder-
initiated. Two contract amendments ride with it:

1. **WorldEnv exclusivity clause** currently reads "the ONLY illustration on
   the page — sections may not add their own scenes." This section needs a
   carved exception: *narrative panel artwork is allowed HERE only, same
   watercolor system, rendered in flow (never a second fixed environment
   layer).* Without amending this line the section violates the contract on
   arrival.
2. **Page order** gains one entry between WhatHappened and Installer.

Files expected to change at implementation time (for sizing, not action):

```
site/content/landing-copy.ts          new howAWorldWorks block (copy, after approval)
site/components/HowAWorldWorks.tsx    new — static section, ol of three beats
site/app/page.tsx                     insert between WhatHappened and Installer
site/app/globals.css                  section + zone/crop rules (tokens)
site/public/brand/lme-lifecycle.webp  new master asset (name TBD)
site/docs/ui-contract.md              new entry + the two amendments above
site/tests/rendered-html.test.mjs     presence + ORDER assertion (WhatHappened
                                      → new section → Installer), asset budget
```

Not touched: SiteHeader/SiteFooter (nav keeps "How it works" → #installer),
Installer (explicitly untouched — it remains the practical how-to), llms.txt
(no new claims), page-meta.

## Open for review

1. ~~Heading wording~~ — LOCKED 2026-08-24 01:02 (§5).
2. ~~Beat sentences~~ — LOCKED 2026-08-24 01:02 (§5).
3. Section ground — bordered panel (sibling-consistent) vs washed narrative
   band (DontNeedThis-like, more world visible). Design's call in the next
   mockup; both are contract-legal. **Still open.**
```
STOP LINE — no code, no asset, no copy lands until the founder approves §5's
NEW COPY items and design answers "Open for review". Artwork is generated
FROM §4 + §6 of this spec.
```
