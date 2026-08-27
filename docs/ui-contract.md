# ui-contract.md — the landing page, in the repo's own names

```
sha:  53af02a   (main == origin/main == production viibe.to/living-memory, deployed 2026-08-24 ~02:00 +07, version 15abf9f7)
date: 2026-08-24
rule: if this sha is not HEAD, stop and ask for a fresh contract.
```

This is the shared vocabulary between the code (Claude Code) and the design
side (ChatGPT + GPT Image). A mockup comes back as an image **plus a slot-map**:
every region named with one of three verdicts — `UNCHANGED` / `TOKENS-ONLY` /
`STRUCTURAL`. Anything in the token sheet may change freely; changing anything
else is STRUCTURAL and must be declared as a line item, never arrive as a side
effect of drawing. Every non-default state is either drawn or written
"UNCHANGED" — never absent.

**Where words live:** every sentence on the page comes from
`site/content/landing-copy.ts` (frozen vocabulary: WORLD = paid place that
persists · ROOM = free 24h instance; the line between them is LIFETIME, not
capability). Components own layout, not copy. A copy change is its own diff.

## Page order (desktop = phone; collapses, never re-sequences)

`<Hero/>` → `<WhatHappened/>` → `<HowAWorldWorks/>` → `<Installer/>` →
`<DontNeedThis/>` → `<WhatItsFor/>` → `<Pricing/>` → `<KnownIssuesStrip/>` →
`<SiteFooter/>`

**Shell (STRUCTURAL, founder-approved rounds 1b–2, 2026-08-23/24):** the page
has two layers. `<WorldEnv/>` is ONE fixed full-viewport environment layer
(a fixed element, never `background-attachment: fixed` — iOS) holding the
world scene: wide crop right-anchored on wide screens, tall crop
bottom-anchored on phones (its upper half is paper, drawn as the copy's
ground). `<Hero/>` is a transparent window onto it, outside the constrained
`<main>` column, with `<SiteHeader/>` overlaid and copy in an inner
`--page`-aligned grid. Opaque panels scroll over the environment; the gaps
between sections keep revealing the same world — no section pays for its own
illustration. `<DontNeedThis/>` is deliberately NOT a panel (see its entry).

---

### `<SiteHeader/>`
used:   rendered inside `<Hero/>` (x1); every page via layout
props:  none — links from `landing.nav` + site-links
states: wide (inline nav) · narrow (`<details>` hamburger, works with no JS)
holds:  may not import the auth SDK (project boundary) — "Sign in" is a link,
        never a reflected auth state. CTA button must stay in the nav.

### `<Hero/>`
used:   / (x1) — full-bleed shell outside <main> (see Shell note above)
props:  none — copy from `landing.hero` (headline · support[3] · cta ·
        ctaNote · trust[3])
states: default · narrow (scene behind copy, top-anchored, bottom fade)
holds:  h1 is the product's one-sentence frame ("One world. You and your
        agents come and go." — relocked 2026-08-23) and llms.txt's blockquote
        must agree with it. The hero owns NO scene since round 2 — the world
        lives in <WorldEnv/> (the whale lives in the header mark). Trust row
        is plain text joined by "·", not badges. Copy must stay on the
        scene's paper-fade region — never on the busy part of the
        illustration.

### `<WhatHappened/>`
used:   / (x1)
props:  none — `landing.happened` (timeline[4] {time·actor·text} · notes[2] ·
        aside[3] · readMore)
states: default only
holds:  THE PROOF BLOCK — a friend independently read it as "เหมือนมี audit
        log"; preserve whatever produces that. Real clock times, actor pills
        (different vendors is the whole claim), real list not <pre> so names
        survive a 320px column. Deliberately prints NO room id. Do not turn
        into a compatibility matrix.

### `<HowAWorldWorks/>` (added 2026-08-24, spec: docs/section-spec-how-a-world-works.md)
used:   / (x1) — between the proof and the installer; id="how-a-world-works"
props:  none — `landing.howAWorldWorks` (heading + beats[3], copy LOCKED
        2026-08-24, byte-exact, do not restyle)
states: default only — purely explanatory, no JS, no interaction
holds:  narrative section (unnumbered). Washed band, never a bordered panel
        (design ruling). Three watercolor PLATES cropped from one master
        (triptych = official art direction); the same table carries the
        continuity; plates are decorative (alt="") — the meaning lives in
        the <ol> beat sentences, whose ORDER is the content. The only
        hand-to-hand moment on the page is drawn here: owner→agent passing
        a KEY (access) — never work, never to a person. The word "key"
        stays out of the copy; "let it in how?" is the Installer's job,
        directly below. Forbidden until PR-C: invite · member · join.

### `<Installer/>`
used:   / (x1) — §1, id="installer", target of every CTA on the page
props:  `{ id?: string }` — copy from `landing.installer` + lib/install-copy
states: rail cloud|local (changes STEP 1 only) · client tab ×5 (changes STEP
        2 only) · claude+cloud special step 1 · minting · minted (QR + room
        URL + expiry) · error (role=alert)
holds:  the two axes move DIFFERENT steps; steps 1 and 3 are identical for
        every client — the repetition is the message. The Cloud/Local rail
        must stay visible — it is the state axis (design ruling, round 2).
        Tab glyphs are GENERIC affordances, never vendor logos; the label is
        the authority. Steps render as three separate cards (round 2); step
        3's window-handoff glyph is decorative. Minted room URL renders with
        a "don't post or screenshot" caption. Warning band: rooms expire,
        cloud/local don't sync. Monospace blocks must stay readable at 320px.

### `<WorldEnv/>` (round 2)
used:   / (x1) — first child of the page, fixed behind everything
props:  none — two crops of the scene (lme-world.webp · lme-world-mobile.webp)
states: wide (≥900px, right-anchored) · tall (<900px, bottom-anchored)
holds:  aria-hidden, pointer-events: none, z-index below all content. The
        only ENVIRONMENT on the page — sections may not add their own
        scenes, with ONE carved exception: <HowAWorldWorks/> carries
        narrative plate artwork (same watercolor system, rendered in flow,
        never a second fixed layer). Swapping the artwork is TOKENS-ONLY;
        adding a second environment layer or parallax is STRUCTURAL.

### `<DontNeedThis/>`
used:   / (x1)
props:  none — `landing.dontNeed` (heading + columns[3])
states: default only
holds:  full width, most air on the page, TYPE ONLY — no icons, cards or
        borders. Since round 2 it is NOT a panel: type sits directly on the
        world through a soft readability wash — this section is where the
        page breathes and the environment shows through. The anti-sell is
        what makes every claim above it credible; do not shrink it.

### `<WhatItsFor/>`
used:   / (x1) — §2, id="what-its-for"
props:  none — `landing.whatItsFor.cards[5]` {title·body}
states: default only
holds:  five cards, count comes from the data.

### `<Pricing/>`
used:   / (x1) — §3, id="pricing"
props:  none — `landing.pricing` (room · world · cta · compare · assurance)
states: default only
holds:  the two plan cards are DELIBERATELY not parallel in shape (cards say
        WHY they differ in kind; the table says WHAT). The compare table reads
        its column count from data — a third tier is a copy change only. Row
        order is the argument: lifetime first. CTA is page blue, never green,
        and must lead to /keep (the only path attaching the buyer's customer
        id). Table lives in `.compare__scroll` (own x-scroll on phones).
        NEVER copy that gates handoff behind the paid tier.

### `<KnownIssuesStrip/>`
used:   / (x1)
props:  none — `landing.knownIssues` (one item only; full list on its page)
states: default only
holds:  exactly one issue inline + mailto + link to the full page. Honesty
        strip — do not decorate it into a feature card.

### `<SiteFooter/>`
used:   every page via layout
props:  none — link columns (Product/Developers/Company) + tagline + invariant
states: default only
holds:  every link resolves to a real page; anchors are absolute (footer also
        renders on /privacy, /keep). No Discord, no email capture — a form
        that goes nowhere contradicts the page's argument. Carries the
        invariant line "Agents are visitors. Worlds are not models."

### `<NewsTicker/>` (site-wide strip, not on the landing main flow)
used:   layout-level; height reserved by `--ticker-height`
props:  items from whats-new content
states: default · reduced-motion (must not animate)
holds:  information-bearing (real dated changes), not decoration.

---

## Token sheet — the explicitly reskinnable surface

IF IT IS HERE, THE DESIGN MAY CHANGE IT FREELY. If it is not, changing it is
STRUCTURAL.

```
color roles (light page, dark-ink text):
  --ink         #0a2540    headings, body on paper
  --muted       #54718a    secondary text
  --paper       #ffffff    page ground
  --paper-blue  #f8fbfe    tinted section ground
  --line        rgba(30,77,122,.18)   hairlines on light
  --line-on-dark rgba(191,219,235,.28)
  accent blue   #1e4d7a    buttons/links live in the same blue family —
                           CTA is never green
  danger        #b00020 / #8c0019 · warn #ffb02f · (one-off pink #ff2fb9)

type:
  family        Inter (ui-sans fallback) · mono: ui-monospace stack
  scale         clamp()-based; display up to clamp(3rem,7vw,5.4rem),
                h2 ~clamp(1.6rem,3.6vw,2.6rem), body ~clamp(1rem,1.5vw,1.12rem)

layout:
  page width    --page: min(100% - clamp(2rem,8vw,9rem), 90rem)
  gaps          clamp()-based, ~1rem–3rem
  radius        1px dominates (sharp, print-like); pills/round = 999px/50%
  ticker        --ticker-height: 2.4rem

illustration:  watercolor blue system (whale on hero today; the round-table /
               arch / walking-figures direction from the v2 draft is the
               candidate replacement — an illustration change is TOKENS-ONLY
               as long as the slot underneath keeps its size and text stays
               outside the image)

motion:        restrained; everything must respect prefers-reduced-motion
```

## Hard invariants (not tokens, not up for redraw)

- Paper wash is the lighting system (design ruling 2026-08-24): preserve the
  fixed world environment; solve text contrast LOCALLY with translucent
  paper-wash gradients/scrims, never by giving a section an opaque
  background. Nav = top gradient scrim; hero copy = breakpoint-local wash
  only where needed; footer alone may carry a stronger translucent paper
  surface (~0.9) so the world dissolves back into paper at the end.

- Two readers: humans and agents. llms.txt / SKILL.md must keep agreeing with
  the page.
- Lifetime-not-capability: no surface may gate handoff (or any core
  cross-agent capability) behind the paid tier.
- What's-New discipline: dated entries are append-only; superseded notes are
  appended, never rewritten.
- Claimable boundary: one human + many agents. No multi-human/invite copy
  until PR-C ships.
- No CMS, no generic SaaS animation, static content only.
