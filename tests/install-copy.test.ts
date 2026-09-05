import assert from "node:assert/strict";
import test from "node:test";
import * as installCopy from "../lib/install-copy.ts";
import * as llms from "../lib/llms-txt.ts";

test("local install hands the agent one public operating guide and a continuity check", () => {
  assert.equal(
    installCopy.AGENT_GUIDE_URL,
    "https://viibe.to/living-memory/skills/living-memory/SKILL.md",
  );
  assert.match(
    installCopy.LOCAL_AGENT_PROMPT,
    new RegExp(installCopy.AGENT_GUIDE_URL ?? "never-match"),
  );
  assert.match(installCopy.LOCAL_AGENT_PROMPT, /fresh session or client/i);
  assert.match(installCopy.LOCAL_AGENT_PROMPT, /ask me before changing/i);
});

test("remote install carries expiry truth and the same continuity check", () => {
  const prompt = installCopy.remoteAgentPrompt(
    "https://lme.example/t/trial/mcp",
    "2026-08-14T12:00:00.000Z",
  );

  assert.match(prompt, /https:\/\/lme\.example\/t\/trial\/mcp/);
  assert.match(prompt, /Fri, 14 Aug 2026 12:00:00 GMT/);
  assert.match(
    prompt,
    new RegExp(installCopy.AGENT_GUIDE_URL ?? "never-match"),
  );
  assert.match(prompt, /fresh session or client/i);
});

test("the Claude tab shares the one step 1 — the exception is retired (A159)", () => {
  // Retired 2026-08-27 by the founder: claude.ai can add a room since
  // 2026-08-23 (known-issues), so no client tab claims otherwise.
  assert.ok(!("CLAUDE_CLOUD_STEP_ONE" in installCopy));
  const step = installCopy.stepTwo(
    "claude",
    "cloud",
    "https://lme.example/t/x/mcp",
  );
  assert.equal(step.code, "https://lme.example/t/x/mcp");
  assert.match(step.lines.join(" "), /connector/i);
});

test("the public agent index teaches the same local server name as the installer", () => {
  // /llms.txt is a distribution surface, not a comment: an agent that follows it
  // registers the server for real. Two public surfaces naming the same server
  // differently is the drift SERVER_NAMES exists to prevent (Codex P2).
  assert.match(
    llms.LLMS_TXT,
    new RegExp(`claude mcp add ${installCopy.SERVER_NAMES.local}\\b`),
  );
  assert.doesNotMatch(llms.LLMS_TXT, /claude mcp add living-memory\b/);
});

/* THE GUARD THAT WAS MISSING, and the reason this test exists rather than a fix alone.
 *
 * The 2026-09-02 rename to room / world / local reached every surface except one line on /keep,
 * where the name was typed as text instead of read from SERVER_NAMES. It survived three days for
 * two compounding reasons: /keep is a client page nobody opens until they have PAID, and the only
 * guard in the suite was `doesNotMatch(html, /lm-room/)` on the LANDING page — one name out of
 * three, on one surface out of many. A partial guard reads as a guard.
 *
 * So this asserts over SOURCE rather than over one rendered page: a retired name cannot be typed
 * anywhere a person will read it, whichever route renders it and whether or not that route is
 * reachable without a receipt. lib/install-copy.ts is exempt because it is where the rename is
 * DOCUMENTED — the history has to be allowed to say what it replaced. */
test("no surface retypes a retired server name", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const RETIRED = /lm-(room|cloud|local)/;
  const OWNS_THE_HISTORY = "lib/install-copy.ts";

  const walk = async (dir: string): Promise<string[]> => {
    const out: string[] = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) out.push(...(await walk(path)));
      else if (/\.(tsx?|mjs)$/.test(entry.name)) out.push(path);
    }
    return out;
  };

  const files = (
    await Promise.all(
      ["app", "components", "lib", "content"].map((d) => walk(d)),
    )
  ).flat();
  const offenders: string[] = [];
  for (const file of files) {
    if (file === OWNS_THE_HISTORY) continue;
    const source = await readFile(file, "utf8");
    source.split("\n").forEach((line, i) => {
      if (RETIRED.test(line))
        offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }

  assert.deepEqual(offenders, []);
});
