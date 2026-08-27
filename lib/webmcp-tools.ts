// webmcp-tools.ts — the software-guest entrance to the same action the hero
// button offers a human. WebMCP is the front desk only: provisioning and
// connection guidance. Memory itself stays behind the room's own MCP rail.
import {
  AGENT_GUIDE_URL,
  CLIENT_TABS,
  SERVER_NAMES,
  stepTwo,
  remoteAgentPrompt,
  type ClientId,
  type StepTwo,
} from "./install-copy.ts";
import type { OnsGrant } from "./mint-room.ts";

export const CREATE_FREE_ROOM_NAME = "create_free_room";

export interface RoomGrantResponse {
  room: {
    url: string;
    expiresAt: string;
    serverName: string;
    transport: string;
    auth: "none";
  };
  lifecycle: string;
  warning: string;
  guide: string;
  connect: Record<ClientId, StepTwo>;
  agentPrompt: string;
}

/**
 * Everything a caller agent needs to carry the room back to its human — the
 * machine-readable grant plus the installer's own per-client words, read from
 * the same functions the visible installer renders. (Advisor A162: one
 * behavioral contract, so the two surfaces cannot drift.)
 */
export function buildRoomGrantResponse(grant: OnsGrant): RoomGrantResponse {
  const connect = Object.fromEntries(
    CLIENT_TABS.map((tab) => [tab.id, stepTwo(tab.id, "cloud", grant.url)]),
  ) as Record<ClientId, StepTwo>;
  return {
    room: {
      url: grant.url,
      expiresAt: grant.expiresAt,
      serverName: SERVER_NAMES.room,
      transport: "streamable HTTP (POST), SSE also available",
      auth: "none",
    },
    lifecycle:
      "The room stays available while it is used; left inactive, it is " +
      `currently set to be forgotten after ${grant.expiresAt}. Activity ` +
      "extends it.",
    warning:
      "Anyone holding this URL can read and write this room — do not post " +
      "or screenshot it.",
    guide: AGENT_GUIDE_URL,
    connect,
    agentPrompt: remoteAgentPrompt(grant.url, grant.expiresAt),
  };
}

interface CreateFreeRoomDeps {
  /** The shared mint path (see mint-room.ts), possibly wrapped with UI events. */
  mint: () => Promise<OnsGrant>;
}

export interface WebMcpTool {
  name: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean };
  execute: (params: unknown) => Promise<string>;
}

export function createFreeRoomTool({ mint }: CreateFreeRoomDeps): WebMcpTool {
  return {
    name: CREATE_FREE_ROOM_NAME,
    description:
      "Create a free shared Living Memory room — no signup, no auth. " +
      "Returns the room's MCP URL plus step-by-step connection instructions " +
      "for ChatGPT, Claude, Codex/Cursor, and any MCP client, so you can " +
      "teach your human (and their other agents) how to join the same " +
      "shared memory. One call creates one room; the human holding the URL " +
      "owns the outcome.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    async execute() {
      const grant = await mint();
      return JSON.stringify(buildRoomGrantResponse(grant), null, 2);
    },
  };
}
