import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [packageText, hostingText] = await Promise.all([
  readFile(new URL("package.json", root), "utf8"),
  readFile(new URL(".openai/hosting.json", root), "utf8"),
]);
const packageJson = JSON.parse(packageText);
const hosting = JSON.parse(hostingText);

assert.equal(packageJson.name, "lme-site");
assert.equal(packageJson.dependencies?.["drizzle-orm"], undefined);
assert.equal(packageJson.dependencies?.["react-loading-skeleton"], undefined);
assert.equal(packageJson.devDependencies?.["drizzle-kit"], undefined);
assert.equal(hosting.d1, null);
assert.equal(hosting.r2, null);

const allowedHostingKeys = ["d1", "r2"];
if (hosting.project_id !== undefined) {
  assert.match(hosting.project_id, /^appgprj_[a-z0-9]+$/);
  allowedHostingKeys.push("project_id");
}
assert.deepEqual(Object.keys(hosting).sort(), allowedHostingKeys.sort());

for (const path of [
  "app/chatgpt-auth.ts",
  "db/index.ts",
  "db/schema.ts",
  "drizzle.config.ts",
  "drizzle/meta/_journal.json",
  "examples/d1/app/api/notes/route.ts",
  "examples/d1/db/schema.ts",
  "app/_sites-preview/SkeletonPreview.tsx",
]) {
  await assert.rejects(access(new URL(path, root)));
}

console.log("presentation-only project boundary verified");
