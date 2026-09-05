import { spawnSync } from "node:child_process";

/**
 * The gate, in one list, run by a person locally and by CI on every pull
 * request. ONE list is the point: a workflow file that retyped these seven
 * lines would be a second gate wearing the first one's name, and the two
 * would drift the first time somebody adds a check to only one of them.
 *
 * THE ORDER IS LOAD-BEARING, not stylistic. `test:rendered` imports
 * dist/server/index.js and renders real pages through it, so `build` has to
 * have produced that file first. Reordering these for tidiness breaks the
 * suite in a way whose error message says nothing about ordering.
 *
 * --no-audit EXISTS FOR CI, and the reason is worth stating rather than
 * hiding in a flag name. `audit:prod` reports advisories in transitive
 * dependencies we do not control the timing of; today it fails on
 * browserslist and fast-uri. A required check that is red on arrival teaches
 * everyone to ignore the red, which costs more than the advisories do. So CI
 * runs this list without it and runs `audit:prod` separately as a
 * non-blocking step: the information stays visible, and "red" keeps meaning
 * "you broke something".
 */
const skipAudit = process.argv.includes("--no-audit");

const tasks = [
  ["npm", ["run", "test:unit"]],
  ["npm", ["run", "verify:boundary"]],
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "build"]],
  ["npm", ["run", "verify:policy"]],
  ["npm", ["run", "test:rendered"]],
  ...(skipAudit ? [] : [["npm", ["run", "audit:prod"]]]),
];

for (const [command, args] of tasks) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
