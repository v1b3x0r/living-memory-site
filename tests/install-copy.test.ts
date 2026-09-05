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
 * So this asserts over SOURCE: a retired name cannot be typed anywhere a person will read it,
 * whichever route renders it and whether or not that route is reachable without a receipt.
 *
 * WHAT COUNTS AS "A PERSON WILL READ IT" took two rounds of review to get right, and both
 * corrections came from Codex on PR #7:
 *
 * · THE EXEMPTION IS COMMENTS, NOT FILES. Exempting lib/install-copy.ts wholesale would have left
 *   the module that GENERATES installer steps and agent prompts unguarded — the largest copy
 *   surface in the repo, and exactly where the next miss would hide. What has to stay legal is the
 *   HISTORY: a rename note has to be able to name what it replaced.
 *
 * · SO THE COMMENT TEST TRACKS BLOCK STATE INSTEAD OF GUESSING. The first version matched lines
 *   starting with //, slash-star or star, which is wrong for JSX: `{/*` opens a comment whose
 *   CONTINUATION lines begin with ordinary prose (app/layout.tsx:126 and app/page.tsx:29 are both
 *   like this today). A rename note written inside one would have been read as product copy and
 *   failed CI for nothing. Comments are stripped with a scanner carrying state across lines, and
 *   the match runs on what is left.
 *
 * · MARKDOWN IS SCANNED WHOLE. public/skills/living-memory/SKILL.md is a live install surface —
 *   AGENT_GUIDE_PATH points at it and agents are told to read it first — and it has no comment
 *   syntax, so every line of it is copy. */
test("no surface retypes a retired server name", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const RETIRED = /lm-(room|cloud|local)/;

  /* Strip comments and keep everything else, carrying state across lines.
   *
   * STRINGS ARE COPY, so their contents stay — and their contents are also why the scanner has to
   * know it is inside one. `https://example.test` contains `//`, and a version of this that did
   * not track quoting read that as a line comment and threw away the rest of the line, taking a
   * retired name sitting after a URL with it. Verified by running it, not reasoned about: given
   * `<a href="https://example.test">Name it lm-cloud</a>` the old scanner returned
   * `<a href="https:` and the guard went green. Codex raised it as P2 on PR #7, round three.
   *
   * Backticks are the one quote that survives a line ending; ' and " do not, so they are reset at
   * the end of each line rather than leaking a mismatched quote into the rest of the file. */
  const codeOnly = (source: string, hasComments: boolean): string[] => {
    if (!hasComments) return source.split("\n");
    let inBlock = false;
    let inString: string | null = null;
    return source.split("\n").map((line) => {
      let out = "";
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inBlock) {
          if (line.startsWith("*/", i)) ((inBlock = false), i++);
        } else if (inString) {
          out += ch;
          if (ch === "\\") out += line[++i] ?? "";
          else if (ch === inString) inString = null;
        } else if (line.startsWith("/*", i)) ((inBlock = true), i++);
        else if (line.startsWith("//", i)) break;
        else {
          if (ch === "'" || ch === '"' || ch === "`") inString = ch;
          out += ch;
        }
      }
      if (inString && inString !== "`") inString = null;
      return out;
    });
  };

  /* The guard's own guard: a rule that silently stopped matching would leave the suite green and
   * the product unprotected, which is the failure this whole test was written about. */
  const probe = codeOnly(
    [
      'const a = "Name it lm-cloud";',
      "{/* RENAMED from",
      "   lm-room, which is history */}",
      'const b = "lm-local";',
      '<a href="https://example.test">Name it lm-cloud</a>',
    ].join("\n"),
    true,
  );
  assert.ok(RETIRED.test(probe[0]), "a retired name in a string is copy");
  assert.ok(
    !RETIRED.test(probe[2]),
    "a JSX comment's continuation line is history, not copy",
  );
  assert.ok(
    RETIRED.test(probe[3]),
    "code after a closed comment is copy again",
  );
  assert.ok(
    RETIRED.test(probe[4]),
    "a URL earlier on the line does not hide what follows it",
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

  const sources = (
    await Promise.all(
      ["app", "components", "lib", "content"].map((d) =>
        walk(d, /\.(tsx?|mjs)$/),
      ),
    )
  ).flat();
  const guides = await walk("public/skills", /\.md$/);

  const offenders: string[] = [];
  for (const file of [...sources, ...guides]) {
    const raw = await readFile(file, "utf8");
    codeOnly(raw, !file.endsWith(".md")).forEach((line, i) => {
      if (RETIRED.test(line))
        offenders.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }

  assert.deepEqual(offenders, []);
});
