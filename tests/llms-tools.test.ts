/* THE TOOL SURFACE, GUARDED BY THE LIST RATHER THAN BY THE SENTENCE.
 *
 * On 2026-09-05 this file's predecessor asserted `/eleven tools/`. A twelfth tool — world_raise —
 * shipped to production that afternoon, and the assertion stayed GREEN while the sentence it
 * defended became false. Worse, correcting the sentence to "twelve" would have turned CI RED:
 * telling the truth was the thing that broke the build.
 *
 * So the count is no longer written down anywhere. WORLD_TOOLS is the list, the prose is rendered
 * from it, and these tests compare the rendered document against the list. There is no second
 * place holding a number, which means there is no second place to forget.
 *
 * WHAT THIS CANNOT DO, said plainly rather than implied: this repo cannot import lme-remote, so
 * nothing here proves the list matches the server. It proves the DOCUMENT cannot contradict
 * itself. Keeping the two repos honest with each other is a cross-repo contract and is not
 * pretended at here.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { LLMS_TXT, WORLD_TOOLS, ROOM_TOOLS } from "../lib/llms-txt.ts";

test("every tool the world offers is named in the document", () => {
  for (const tool of WORLD_TOOLS)
    assert.match(LLMS_TXT, new RegExp(`\\b${tool.name}\\b`), tool.name);
});

test("the escalation tool is described, because it is the one an agent must not invent", () => {
  assert.ok(
    WORLD_TOOLS.some((t) => t.name === "world_raise"),
    "world_raise shipped on 2026-09-05 and belongs in the world's surface",
  );
});

/* A room is not a smaller world in every direction — it is a world with nobody behind it. The
 * document said "a room has every tool a world has ... not capability" while also saying the
 * client trio is owner-only, and world_raise made the contradiction unarguable: an anonymous room
 * has no owner to reach, so the tool is not registered there at all. */
test("what a room offers is a strict subset of what a world offers", () => {
  const world = new Set<string>(WORLD_TOOLS.map((t) => t.name));
  for (const name of ROOM_TOOLS) assert.ok(world.has(name), `${name} is not a world tool`);
  assert.ok(ROOM_TOOLS.length < WORLD_TOOLS.length, "a room cannot offer everything a world does");
});

test("the document does not claim a room and a world differ only in lifetime and budget", () => {
  assert.doesNotMatch(LLMS_TXT, /every tool a world has/);
});

/* The failure this whole file exists to prevent: a written-out count drifting from the list.
 * If a number in words ever reappears next to "tools", it is a number nobody will update. */
test("no spelled-out tool count is written down to go stale", () => {
  assert.doesNotMatch(LLMS_TXT, /\b(six|seven|eight|nine|ten|eleven|twelve|thirteen) tools\b/);
});
