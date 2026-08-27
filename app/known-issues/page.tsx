import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";
import { FEEDBACK_EMAIL } from "../../content/landing-copy";
import { pageMeta } from "../../lib/page-meta";

export const metadata: Metadata = pageMeta({
  path: "known-issues",
  title: "Known issues — Living Memory",
  description:
    "What doesn't work right now, and what to do instead. Every entry is dated, and we take them down when they stop being true.",
});

// Maintained by hand. An entry comes down when it stops being true — a stale
// entry on this page is itself a bug.
export default function KnownIssuesPage() {
  return (
    <PolicyPage
      eyebrow="WHAT DOESN'T WORK"
      title="Known issues"
      updated="August 25, 2026"
    >
      <p className="policy-page__lede">
        <strong>What doesn&apos;t work right now, and what to do instead.</strong>
      </p>
      <p>
        We would rather tell you than have you find out. Every entry is dated,
        and we take them down when they stop being true.
      </p>

      <h2>Nothing is on this page right now</h2>
      <p>
        Every limitation we knew about has stopped being true, so the entries
        came down. If you hit something we should know about, the address below
        still works.
      </p>

      <h3>Recently resolved</h3>
      <p className="policy-page__stamp">
        <strong>Posted 2026-08-15 · Resolved 2026-08-23</strong>
      </p>
      <p>
        <strong>Claude on the web couldn&apos;t open a One Night room.</strong>{" "}
        The original entry said this wasn&apos;t something we could fix by
        changing a setting on our side. That turned out to be wrong: a
        bot-protection default on our edge was rejecting the connection before
        it reached us. We turned it off, watched Claude on the web open a room,
        and took the entry down. Rooms now work from every client we list.
      </p>

      <h2>Found something else?</h2>
      <p>
        Tell us: <strong><a href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</a></strong>{" "}
        — including the boring things. If it turns out to be ours, it goes on
        this page with a date.
      </p>

      <p className="policy-page__colophon">
        <em>
          Living Memory · this page is maintained by hand, not generated. If an
          entry is stale, that&apos;s a bug too.
        </em>
      </p>
    </PolicyPage>
  );
}
