import { DontNeedThis } from "../components/DontNeedThis";
import { FeedbackBox } from "../components/FeedbackBox";
import { Hero } from "../components/Hero";
import { HowAWorldWorks } from "../components/HowAWorldWorks";
import { Installer } from "../components/Installer";
import { KnownIssuesStrip } from "../components/KnownIssuesStrip";
import { Pricing } from "../components/Pricing";
import { Telemetry } from "../components/Telemetry";
import { WhatHappened } from "../components/WhatHappened";
import { WhatItsFor } from "../components/WhatItsFor";
import { WorldEnv } from "../components/WorldEnv";

// Section order is the same on desktop and on a phone; the layout collapses to
// one column, it does not re-sequence.
//
// The hero lives OUTSIDE the constrained <main> column (reskin round 1b): it
// is the full-bleed entrance shell, and #main-content starts where the
// paneled page begins — which is also what a skip target should skip to.
export default function Home() {
  return (
    <>
      <Telemetry event="landing_view" />
      <WorldEnv />
      <Hero />
      <main id="main-content">
        {/* WS2 (2026-08-26): the room creator IS the primary action — the
            handoff's "homepage becomes the room creator". The proof sections
            follow it; they no longer stand between a visitor and a room. */}
        <Installer />
        <WhatHappened />
        <HowAWorldWorks />
        <DontNeedThis />
        <WhatItsFor />
        <Pricing />
        <KnownIssuesStrip />
        {/* Unobtrusive on purpose: the landing catches passers-by, not
            friction — the full card lives where people actually get stuck
            (OAuth pages, /support). Advisor A144. */}
        <FeedbackBox variant="link" />
      </main>
    </>
  );
}
