import assert from "node:assert/strict";
import test from "node:test";
import {
  CLIENT_TABS,
  ONS_MINT_URL,
  SERVER_NAMES,
  AGENT_GUIDE_URL,
  stepTwo,
  remoteAgentPrompt,
} from "../lib/install-copy.ts";
import { mintRoom } from "../lib/mint-room.ts";
import {
  CREATE_FREE_ROOM_NAME,
  buildRoomGrantResponse,
  createFreeRoomTool,
} from "../lib/webmcp-tools.ts";

const GRANT = {
  url: "https://lme.example/t/trial/mcp",
  expiresAt: "2026-09-17T12:00:00.000Z",
};

test("the tool is the front desk, not a second mint implementation", async () => {
  let mints = 0;
  const tool = createFreeRoomTool({
    mint: async () => {
      mints += 1;
      return GRANT;
    },
  });

  assert.equal(tool.name, CREATE_FREE_ROOM_NAME);
  assert.equal(tool.name, "create_free_room");
  // No inputs: a caller agent cannot pick a plan, a duration, or an identity.
  assert.deepEqual(tool.inputSchema, {
    type: "object",
    properties: {},
    additionalProperties: false,
  });
  assert.equal(tool.annotations?.readOnlyHint, false);
  assert.match(tool.description, /free/i);
  assert.match(tool.description, /no sign-?up/i);

  const result = JSON.parse(await tool.execute({}));
  // One invocation, one room — the same contract the hero button has.
  assert.equal(mints, 1);
  assert.equal(result.room.url, GRANT.url);
  assert.equal(result.room.expiresAt, GRANT.expiresAt);
});

test("the response teaches every client the installer teaches, verbatim", () => {
  const res = buildRoomGrantResponse(GRANT);

  assert.equal(res.room.serverName, SERVER_NAMES.room);
  assert.equal(res.room.auth, "none");
  assert.equal(res.guide, AGENT_GUIDE_URL);
  // The clients offered are exactly the installer's tabs, and each one's
  // instructions are the installer's own words — drift is impossible because
  // both read the same function.
  assert.deepEqual(
    Object.keys(res.connect).sort(),
    CLIENT_TABS.map((t) => t.id).sort(),
  );
  for (const tab of CLIENT_TABS) {
    assert.deepEqual(res.connect[tab.id], stepTwo(tab.id, "cloud", GRANT.url));
  }
  // The ready-made prompt an agent can hand to ANOTHER agent is the same one
  // the installer ships.
  assert.equal(res.agentPrompt, remoteAgentPrompt(GRANT.url, GRANT.expiresAt));
  // THE RESPONSE MUST NOT CONTRADICT ITSELF. The assertion above compares the function's output to
  // the same function's output — it cannot fail whatever the prompt says. This one reads the prompt:
  // it told the agent to register the server as "living-memory" while the same response carried
  // serverName "room", so one answer gave two instructions. Predates the rename; the rename only
  // made it visible. (Codex, PR #3.)
  assert.match(res.agentPrompt, new RegExp(`under the name "${res.room.serverName}"`));
  assert.doesNotMatch(res.agentPrompt, /under the name "living-memory"/);
  // Lifecycle truth: inactivity, not a fixed lifetime.
  assert.match(res.lifecycle, /inactiv/i);
  // The same secrecy warning the hero shows a human.
  assert.match(res.warning, /anyone holding this url/i);
});

test("a failed mint surfaces the failure instead of fabricating a room", async () => {
  const tool = createFreeRoomTool({
    mint: async () => {
      throw new Error("rate limited");
    },
  });
  await assert.rejects(() => tool.execute({}), /rate limited/);
});

test("mintRoom speaks to the one mint endpoint and keeps its error words", async () => {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  const okFetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      json: async () => ({ url: GRANT.url, expiresAt: GRANT.expiresAt }),
    };
  }) as unknown as typeof fetch;

  const grant = await mintRoom(okFetch);
  assert.deepEqual(grant, GRANT);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, ONS_MINT_URL);
  assert.equal(calls[0].init.method, "POST");

  const failFetch = (async () => ({
    ok: false,
    status: 429,
    json: async () => ({ error: "too many rooms from this address today" }),
  })) as unknown as typeof fetch;
  await assert.rejects(
    () => mintRoom(failFetch),
    /too many rooms from this address today/,
  );

  const wordlessFetch = (async () => ({
    ok: false,
    status: 503,
    json: async () => ({}),
  })) as unknown as typeof fetch;
  await assert.rejects(() => mintRoom(wordlessFetch), /server answered 503/);
});
