// install-copy.ts — the words a visitor actually leaves with.
// Both prompts are self-describing: if the agent cannot finish, the human can
// still read what was being installed and do it by hand.

export const ONS_MINT_URL = "https://lme.viibe.to/ons/new";
/** The paid world. A trial room is a different address and does not become this one. */
export const HOSTED_MCP_URL = "https://lme.viibe.to/mcp";

// Account control on the same host as the memory it deletes (see src/purge.ts).
export const DELETE_WORLD_URL = "https://lme.viibe.to/world/delete";

// One entitlement read, so /keep never offers checkout to someone who already pays.
export const WORLD_STATUS_URL = "https://lme.viibe.to/world/status";
export const AGENT_GUIDE_PATH = "/living-memory/skills/living-memory/SKILL.md";
export const AGENT_GUIDE_URL = `https://viibe.to${AGENT_GUIDE_PATH}`;
export const NPM_PACKAGE = "@nature-labs/lme-mcp";
export const NPM_URL = `https://www.npmjs.com/package/${NPM_PACKAGE}`;
export const GITHUB_URL = "https://github.com/v1b3x0r/living-memory-engine";
export const KEEP_PATH = "/living-memory/keep/";

/**
 * Server names are not decoration. An agent connected to two Living Memory
 * worlds cannot tell which one answered — we watched one search the wrong
 * world about fourteen times. Distinct names per rail are the fix.
 */
export const SERVER_NAMES = {
  room: "lm-room",
  cloud: "lm-cloud",
  local: "lm-local",
} as const;

/** Shown before a room exists. Never a real token — see the mint flow. */
export const ROOM_URL_PLACEHOLDER = "https://lme.viibe.to/t/<token>/mcp";

/**
 * Deep link into Claude's "Add custom connector" modal (probed 2026-08-27).
 * FRAGILE BY NATURE: the ?modal= param and the #settings hash are undocumented
 * internals — the connectors page already moved once (settings → customize).
 * No prefill param exists (all candidates probed and the bundle scanned), so
 * the user still pastes the room URL themselves. Any UI using this link must
 * carry a hand-navigation fallback line next to it.
 */
export const CLAUDE_CONNECTOR_DEEPLINK =
  "https://claude.ai/new?modal=add-custom-connector#settings/customize-connectors";

export const LOCAL_INSTALL_COMMAND = `npx ${NPM_PACKAGE}`;

/* The Claude tab offered no room while claude.ai genuinely could not add one.
   That stopped being true on 2026-08-23 (our edge bot-protection was the
   cause — see known-issues), and the founder retired the exception on
   2026-08-27 (advisor A159): Claude now gets the same step 1 as every other
   client. If rooms ever break on claude.ai again, put a dated entry on
   known-issues first — do not resurrect a silent exception here. */

export type ClientId = "chatgpt" | "cursor" | "claude-code" | "claude" | "any";

export interface ClientTab {
  id: ClientId;
  label: string;
  /** Rendered under the label when the client name alone is ambiguous. */
  sublabel?: string;
}

export const CLIENT_TABS: readonly ClientTab[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "cursor", label: "Cursor" },
  { id: "claude-code", label: "Claude Code" },
  { id: "claude", label: "Claude", sublabel: "(web / desktop)" },
  { id: "any", label: "Any MCP client" },
];

export type Rail = "cloud" | "local";

export interface StepTwo {
  /** Prose lines, rendered in order above any code block. */
  lines: readonly string[];
  /** Copy-able snippet, when there is one. */
  code?: string;
  /** Optional trailing link — used for the claude.ai room limitation. */
  link?: { before: string; label: string; href: string; after: string };
}

function cursorRoomJson(roomUrl: string): string {
  return `{
  "mcpServers": {
    "${SERVER_NAMES.room}": { "url": "${roomUrl}" }
  }
}`;
}

const CURSOR_LOCAL_JSON = `{
  "mcpServers": {
    "${SERVER_NAMES.local}": {
      "command": "npx",
      "args": ["-y", "${NPM_PACKAGE}"]
    }
  }
}`;

/**
 * Step 2 for one client on one rail. Steps 1 and 3 never vary by client —
 * that repetition is the message.
 *
 * `roomUrl` is the freshly minted room when the visitor has clicked, and the
 * `<token>` placeholder before that. No room is ever baked into the markup.
 */
export function stepTwo(
  client: ClientId,
  rail: Rail,
  roomUrl: string = ROOM_URL_PLACEHOLDER,
): StepTwo {
  if (rail === "cloud") {
    switch (client) {
      case "chatgpt":
        return {
          lines: [
            "Settings → Connectors → developer mode → Add custom connector → paste the URL, authorization: none.",
            `Name it ${SERVER_NAMES.room}.`,
          ],
          code: roomUrl,
        };
      case "cursor":
        return {
          lines: [
            "Paste this into ~/.cursor/mcp.json (everywhere) or .cursor/mcp.json (this project only):",
          ],
          code: cursorRoomJson(roomUrl),
        };
      case "claude-code":
        return {
          lines: [],
          code: `claude mcp add --transport http ${SERVER_NAMES.room} ${roomUrl}`,
        };
      case "claude":
        return {
          lines: [
            "Settings → Connectors → Add custom connector → paste the URL.",
            `Name it ${SERVER_NAMES.room}.`,
          ],
          code: roomUrl,
        };
      case "any":
        return {
          lines: [
            "Use the room URL and the two transports (HTTP or SSE).",
            `Name the server ${SERVER_NAMES.room}.`,
          ],
          code: roomUrl,
        };
    }
  }

  switch (client) {
    case "chatgpt":
      return {
        lines: [
          "ChatGPT connectors are remote only — a server running on this machine cannot be added here.",
          "Use the Cloud rail for this tab.",
        ],
      };
    case "cursor":
      return {
        lines: [
          "Paste this into ~/.cursor/mcp.json (everywhere) or .cursor/mcp.json (this project only):",
        ],
        code: CURSOR_LOCAL_JSON,
      };
    case "claude-code":
      return {
        lines: [],
        code: `claude mcp add ${SERVER_NAMES.local} -s user -- npx -y ${NPM_PACKAGE}`,
      };
    case "claude":
      return {
        lines: [
          "Claude on the desktop reads the same stdio form, in claude_desktop_config.json.",
          "Claude on the web cannot reach a server on this machine.",
        ],
        code: CURSOR_LOCAL_JSON,
      };
    case "any":
      return {
        lines: [
          `Any stdio MCP client: command "npx", args ["-y", "${NPM_PACKAGE}"].`,
          `Name the server ${SERVER_NAMES.local}.`,
        ],
      };
  }
}

export const LOCAL_AGENT_PROMPT = `Install the Living Memory Engine memory server for me. First read its operating guide at ${AGENT_GUIDE_URL}. The server is the npm package "@nature-labs/lme-mcp" — a local stdio MCP server that gives you persistent memory tools. Read the package README, install it, configure it as an MCP server on this machine, run its bundled smoke test, and show me the tools that became available. Ask me before changing any existing configuration. Then follow the guide to help me store one safe fact and verify it from a fresh session or client. If you cannot finish, tell me exactly which step failed so I can do it by hand.`;

export function remoteAgentPrompt(url: string, expiresAt: string): string {
  const expires = new Date(expiresAt).toUTCString();
  return `Connect this remote MCP server for me: ${url} (streamable HTTP, POST, no auth header). It is a hosted Living Memory Engine room — a shared memory your agents can all reach — that stays available while it's used; if left inactive, it is currently set to expire ${expires}. First read its operating guide at ${AGENT_GUIDE_URL}. Register the endpoint in my MCP client configuration under the name "living-memory" and show me the tools that became available. Then follow the guide to help me store one safe fact and verify it from a fresh session or client. If you cannot finish, tell me exactly which step failed.`;
}
