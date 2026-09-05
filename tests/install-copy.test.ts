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

/* THE GUARD THAT WAS MISSING, and the reason it exists rather than a one-line fix alone.
 *
 * The 2026-09-02 rename to room / world / local reached every surface except one line on /keep,
 * where the name was typed as text instead of read from SERVER_NAMES. It survived three days for
 * two compounding reasons: /keep is a client page nobody opens until they have PAID, and the only
 * guard in the suite was `doesNotMatch(html, /lm-room/)` on the LANDING page — one name out of
 * three, on one surface out of many. A partial guard reads as a guard.
 *
 * IT DOES NOT READ SYNTAX, AND THAT IS THE WHOLE DESIGN — arrived at the hard way, over five
 * rounds of review on PR #7. Every earlier version tried to tell copy from commentary by parsing:
 * exempt the file that documents the rename (which unguarded the module that GENERATES installer
 * copy), then match comment prefixes (wrong for JSX, whose `{/*` has continuation lines of plain
 * prose), then track block state (which read the `//` in `https://` as a comment and threw away
 * the rest of the line), then track quoting too, then report an unterminated comment at EOF — and
 * that last one still missed a false block opened by a regex like `/[/*]/` and closed by the next
 * JSDoc, which swallows the copy in between and leaves the file looking balanced.
 *
 * Each round was green, and green for a different wrong reason. The lesson is not "the scanner
 * needed one more case"; it is that a test guarding twelve words of copy had been asked to become
 * a JavaScript lexer, and a lexer that is nearly right is confidently wrong in new ways.
 *
 * So the rule is now unconditional and legible: a retired name is a failure ANYWHERE, unless the
 * line carries the marker [retired-name-ok]. Nothing is inferred. The exemption is deliberate,
 * greppable, and visible in review — which is what it always should have been, since the whole
 * point is to make a name that is not supposed to exist impossible to type by accident. */
const RETIRED = /lm-(room|cloud|local)/;
const ALLOW = "[retired-name-ok]";

test("no surface retypes a retired server name", async () => {
  const { readdir, readFile } = await import("node:fs/promises");

  /* The guard's own guard: a rule that silently stopped matching would leave the suite green and
   * the product unprotected, which is the failure this test exists to prevent. */
  assert.ok(
    RETIRED.test('<a href="https://x.test">Name it lm-cloud</a>'),
    "copy is caught",
  );
  assert.ok(
    RETIRED.test("const re = /[/*]/; // lm-room"),
    "no syntax can hide a name",
  );
  assert.ok(
    " * RENAMED from lm-room " + ALLOW,
    "history is exempt by marker, not by guesswork",
  );

  const walk = async (dir: string, match: RegExp): Promise<string[]> => {
    const out: string[] = [];
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) out.push(...(await walk(path, match)));
      else if (match.test(entry.name)) out.push(path);
    }
    return out;
  };

  /* Every surface a person or an agent reads: the app, the Worker that serves robots.txt,
   * llms.txt and the auth guide as public text, and the published skill artifacts. */
  const files = (
    await Promise.all([
      ...["app", "components", "lib", "content", "worker"].map((d) =>
        walk(d, /\.(tsx?|mjs)$/),
      ),
      walk("public/skills", /\.(md|ya?ml)$/),
    ])
  ).flat();

  const offenders: string[] = [];
  for (const file of files) {
    const raw = await readFile(file, "utf8");
    raw.split("\n").forEach((line, i) => {
      if (RETIRED.test(line) && !line.includes(ALLOW))
        offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }

  assert.deepEqual(offenders, []);
});
