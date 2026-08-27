"use client";
// Mounted once from the root layout: boots PostHog (pageviews come from the
// SDK's defaults) and optionally stamps one named funnel event for the page
// that rendered it, e.g. landing_view on the landing page.
import { useEffect } from "react";
import { initTelemetry, track } from "../lib/telemetry";

export function Telemetry({ event }: { event?: string }) {
  useEffect(() => {
    initTelemetry();
    if (event) track(event);
  }, [event]);
  return null;
}
