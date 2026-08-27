import { spawnSync } from "node:child_process";

const tasks = [
  ["npm", ["run", "test:unit"]],
  ["npm", ["run", "verify:boundary"]],
  ["npm", ["run", "typecheck"]],
  ["npm", ["run", "build"]],
  ["npm", ["run", "verify:policy"]],
  ["npm", ["run", "test:rendered"]],
  ["npm", ["run", "audit:prod"]],
];

for (const [command, args] of tasks) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
