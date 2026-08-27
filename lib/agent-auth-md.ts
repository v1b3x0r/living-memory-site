// agent-auth-md.ts — /auth.md, login instructions for AI agents (Cloudflare
// Agent Readiness convention). Same doctrine as llms.txt: state what exists,
// what does not, and the exact mechanics.
//
// The honest headline: viibe.to is an umbrella domain and has NO umbrella
// login. The only sign-in surface is Living Memory. Saying that plainly is
// the whole value of this file — an agent that assumes a site-wide account
// here would waste its time looking for one.

// The first heading must be literally "# auth.md" — that is the convention's
// magic string (see cloudflare.com/auth.md) and what the readiness scanner
// greps for.
export const AUTH_MD = `# auth.md

## Authentication on viibe.to

viibe.to is an umbrella domain for products by nature-labs. There is no
site-wide account and no umbrella login. The only surface with sign-in is
Living Memory, below. Everything else on this domain is public reading.

## Living Memory — the only thing you can sign in to

- Remote MCP endpoint: https://lme.viibe.to/mcp (Streamable HTTP)
- Auth: OAuth 2.1 with dynamic client registration. Your MCP client
  registers itself (no pre-issued client id) and opens a browser sign-in
  for the human. Discovery document:
  https://lme.viibe.to/.well-known/oauth-protected-resource/mcp
- An unauthenticated request to the endpoint answers 401 with a
  WWW-Authenticate challenge pointing at that discovery document. That is
  the intended entry, not an error.
- No-signup path: POST https://lme.viibe.to/ons/new mints a free room that
  stays while it is used — a private MCP URL with no auth header at all.
  Good for trying the product or for clients that cannot do OAuth.
- A persistent world is bought by the human at
  https://viibe.to/living-memory/keep/ (US$9/month). Agents must not push
  the purchase.
- For an agent that cannot sign in, a signed-in owner mints a revocable
  90-day key URL with the client_mint tool. Never ask a human to paste an
  API key into chat or email; there are no manual API keys.

Full agent guide: https://viibe.to/living-memory/skills/living-memory/SKILL.md
Product index for agents: https://viibe.to/llms.txt
Status: https://status.viibe.to/living-memory
Security contact: https://viibe.to/.well-known/security.txt
`;

// /.well-known/api-catalog (RFC 9727) — the machine-readable directory of
// the services this domain fronts. Linkset JSON, registered relations only.
export const API_CATALOG = JSON.stringify(
  {
    linkset: [
      {
        anchor: "https://lme.viibe.to/mcp",
        "service-doc": [
          {
            href: "https://viibe.to/living-memory/skills/living-memory/SKILL.md",
            type: "text/markdown",
            title: "Living Memory — MCP operating guide for agents",
          },
        ],
        "service-meta": [
          {
            href: "https://viibe.to/llms.txt",
            type: "text/plain",
            title: "Living Memory — agent-facing product index",
          },
          {
            href: "https://viibe.to/auth.md",
            type: "text/markdown",
            title: "How agents register and sign in",
          },
        ],
      },
    ],
  },
  null,
  2,
);
