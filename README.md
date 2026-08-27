# living-memory-site

The website for **Living Memory** — a shared memory service for AI agents,
live at [viibe.to/living-memory](https://viibe.to/living-memory).

The homepage is the room creator: press one button (or, with WebMCP, ask the
AI you already use) and you get a free shared room any MCP client can join —
ChatGPT, Claude, Codex, Cursor, and friends — with no signup in between.

## Provenance

This site was extracted on 2026-08-27 from a private monorepo where it had
been developed since 2026-08-12, so its git history starts fresh here. The
backend (the MCP server the site talks to) remains private; this repository
is the complete source of the public website.

**WebMCP integration** (`create_free_room` and everything referencing
`document.modelContext`) is new work created during the WebMCP Challenge
hackathon period (2026-08-25 → 2026-09-03). Everything else — the landing
page, the installer guide, the room-minting UI — predates the hackathon.

## Stack

- [Vinext](https://github.com/cloudflare/vinext) (Next.js-compatible, deployed as a Cloudflare Worker)
- React 19, Tailwind 4
- Node.js `>=22.13.0`

## Commands

```bash
npm install
npm run dev     # local dev server
npm test        # boundary checks + unit tests + production build
npm run lint
```

## Project boundary

- Presentation code lives under `app/`, `components/`, `lib/`, `content/`.
- The site owns no persistence and no sign-in of its own; rooms and memory
  live behind the Living Memory MCP API.
- `npm run build` produces the Worker output; deploys go out with Wrangler.

## License

[MIT](./LICENSE)
