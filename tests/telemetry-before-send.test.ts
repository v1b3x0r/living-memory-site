import assert from "node:assert/strict";
import test from "node:test";
import type { CaptureResult } from "posthog-js";
import { dropUnactionableExceptions } from "../lib/telemetry.ts";

function exceptionEvent(list: unknown): CaptureResult {
  return {
    uuid: "00000000-0000-0000-0000-000000000000",
    event: "$exception",
    properties: { $exception_list: list },
  } as CaptureResult;
}

test("drops the opaque cross-origin 'Script error.'", () => {
  const event = exceptionEvent([
    { type: "Error", value: "Script error.", mechanism: { synthetic: true } },
  ]);
  assert.equal(dropUnactionableExceptions(event), null);
});

test("keeps a real error that carries a stack", () => {
  const event = exceptionEvent([
    {
      type: "TypeError",
      value: "x is not a function",
      mechanism: { synthetic: false },
      stacktrace: { type: "raw", frames: [{ filename: "app.js", lineno: 12 }] },
    },
  ]);
  assert.equal(dropUnactionableExceptions(event), event);
});

test("keeps a synthetic report that still has frames", () => {
  const event = exceptionEvent([
    {
      mechanism: { synthetic: true },
      stacktrace: { type: "raw", frames: [{ filename: "app.js" }] },
    },
  ]);
  assert.equal(dropUnactionableExceptions(event), event);
});

test("leaves non-exception events untouched", () => {
  const event = { uuid: "x", event: "memory_write", properties: {} } as CaptureResult;
  assert.equal(dropUnactionableExceptions(event), event);
});
