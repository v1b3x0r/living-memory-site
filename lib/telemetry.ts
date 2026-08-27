// telemetry.ts — PostHog funnel events, client side (spec 2026-08-14).
//
// The project key is a public identifier (it ships to every browser), same
// convention as billing.ts. Server-side funnel events (MCP connect, memory
// write/search, payment_* via the RC webhook) are captured by lme-remote with
// the same key, keyed by the same rcUserId — identify() below is what
// stitches the browser journey to the server journey.
//
// Privacy contract: event names + coarse props only. No emails, no memory
// contents. distinct_id is the opaque rcUserId once known.
import posthog from "posthog-js";

const POSTHOG_KEY = "phc_q8cxTW1AtomKPbgdnKf7AEEuNPMpXoiJxrqdvOy06QZ";
const POSTHOG_HOST = "https://us.i.posthog.com";

let initialized = false;

/** Idempotent; safe to call from any client component. No-op outside the browser. */
export function initTelemetry(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    defaults: "2026-05-30",
  });
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  initTelemetry();
  posthog.capture(event, props);
}

/** Tie this browser to the opaque billing/server id so funnels join across surfaces. */
export function identify(rcUserId: string): void {
  if (typeof window === "undefined") return;
  initTelemetry();
  posthog.identify(rcUserId);
}
