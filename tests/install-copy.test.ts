import assert from "node:assert/strict";
import test from "node:test";
import * as installCopy from "../lib/install-copy.ts";

test("local install hands the agent one public operating guide and a continuity check", () => {
  assert.equal(
    installCopy.AGENT_GUIDE_URL,
    "https://viibe.to/living-memory/skills/living-memory/SKILL.md",
  );
  assert.match(installCopy.LOCAL_AGENT_PROMPT, new RegExp(installCopy.AGENT_GUIDE_URL ?? "never-match"));
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
  assert.match(prompt, new RegExp(installCopy.AGENT_GUIDE_URL ?? "never-match"));
  assert.match(prompt, /fresh session or client/i);
});

test("the Claude tab shares the one step 1 — the exception is retired (A159)", () => {
  // Retired 2026-08-27 by the founder: claude.ai can add a room since
  // 2026-08-23 (known-issues), so no client tab claims otherwise.
  assert.ok(!("CLAUDE_CLOUD_STEP_ONE" in installCopy));
  const step = installCopy.stepTwo("claude", "cloud", "https://lme.example/t/x/mcp");
  assert.equal(step.code, "https://lme.example/t/x/mcp");
  assert.match(step.lines.join(" "), /connector/i);
});
