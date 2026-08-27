import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const sourceRoots = ["app", "components", "content", "lib"];
const sourceExtensions = /\.(?:ts|tsx|js|jsx|mjs)$/;
const sources = (
  await Promise.all(
    sourceRoots.map(async (root) => {
      const entries = await readdir(new URL(`../${root}/`, import.meta.url), {
        recursive: true,
      });
      return entries
        .filter((entry) => sourceExtensions.test(entry))
        .map((entry) => `${root}/${entry}`);
    }),
  )
).flat();

const text = (
  await Promise.all(
    sources.map(async (path) => {
      try {
        return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
      } catch (error) {
        if (error?.code === "ENOENT") return "";
        throw error;
      }
    }),
  )
).join("\n");

// Claims the product cannot back up. Case-insensitive: the wording is the
// problem however it is cased.
for (const prohibited of [
  "It doesn’t forget everything at once.",
  "What returns grows stronger.",
  "remembers what matters",
  "remembers your name last",
]) {
  assert.doesNotMatch(text, new RegExp(prohibited, "i"));
}

// The banned thing is the all-caps status label CONNECTED — a claim that a
// live link exists, which the page cannot verify. Lower-case "connects" /
// "connected" is ordinary prose about what a client did, and the known-issues
// write-up needs it, so this one check stays case-sensitive.
assert.doesNotMatch(text, /CONNECTED/);

assert.match(
  text,
  /One Night Memory trial room stays available while it is used;\s+a room left\s+inactive for an\s+extended period \(currently about 21 days\) is forgotten/i,
);
assert.match(text, /its access token is\s+revoked and its memory file is deleted/i);

// The retention paragraph above was corrected to the inactivity lifecycle while a
// second sentence two screens below went on calling rooms "24-hour" — the policy
// asserting both lifecycles at once. A legal page may not contradict itself.
const privacy = await readFile(
  new URL("../app/privacy/page.tsx", import.meta.url),
  "utf8",
);
assert.doesNotMatch(
  privacy,
  /24-hour room/i,
  "the privacy policy still calls a free room 24-hour — it contradicts its own retention paragraph",
);

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(css, /animation:\s*none/);

// Delete the second half of `a, b { … }` and the orphaned `a,` silently adopts
// whatever block comes next. That shipped once: `.keep-plan ul` inherited
// `.auth-shell`'s `display: grid` and blew the /keep plan list apart, and
// nothing failed. Two fingerprints of a half-cut rule, neither of which occurs
// in CSS anyone wrote on purpose:
assert.doesNotMatch(
  css,
  /,\s*\/\*/,
  "a selector list ends in a comma before a comment — a rule was cut in half",
);
assert.doesNotMatch(
  css,
  /,\s*\{/,
  "a selector list ends in a comma before its block — a rule was cut in half",
);

// And the specific list this happened to, which has no visible markers without
// it (Tailwind's preflight strips them).
assert.match(css, /\.keep-plan ul[^{}]*\{[^{}]*list-style: disc/);

console.log("presentation capability policy verified");
