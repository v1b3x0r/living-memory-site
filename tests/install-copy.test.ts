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
 * reachable without a receipt.
 *
 * THE EXEMPTION IS COMMENTS, NOT FILES — Codex raised the first version as P2 on PR #7 and was
 * right. Exempting lib/install-copy.ts wholesale would have left the module that GENERATES the
 * installer steps and agent prompts unguarded, which is the largest copy surface in the repo and
 * exactly the kind of place the next miss would hide. What has to stay legal is the history: that
 * file documents which names it replaced, and a rename note has to be allowed to name them. So a
 * retired name is permitted only on a comment line, in any file, and a comment line here is one
 * whose first non-space character opens or continues a comment. That is a heuristic and it is
 * stated as one: it reads this repository's actual comment style rather than parsing TypeScript. */
test("no surface retypes a retired server name", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const RETIRED = /lm-(room|cloud|local)/;
  const isComment = (line: string) => /^\s*(\/\/|\/\*|\*)/.test(line);

  /* The guard's own guard: a rule that silently stopped matching would leave the suite green and
   * the product unprotected, which is the failure this whole test was written about. */
  assert.ok(
    RETIRED.test("Name it lm-cloud so you") &&
      !isComment("Name it lm-cloud so you"),
  );
  assert.ok(
    isComment(" * RENAMED 2026-09-02 from lm-room / lm-cloud / lm-local."),
  );

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
    const source = await readFile(file, "utf8");
    source.split("\n").forEach((line, i) => {
      if (RETIRED.test(line) && !isComment(line))
        offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }

  assert.deepEqual(offenders, []);
});
