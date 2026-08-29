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
      updated="August 29, 2026"
    >
      <p className="policy-page__lede">
        <strong>What doesn&apos;t work right now, and what to do instead.</strong>
      </p>
      <p>
        We would rather tell you than have you find out. Every entry is dated,
        and we take them down when they stop being true.
      </p>

      <h2>A free room that reaches a limit blocks recovery too</h2>
      <p className="policy-page__stamp">
        <strong>Posted 2026-08-29</strong>
      </p>
      <p>
        A free room is metered. When it reaches one of its bounds, the limit is
        applied to the whole connection before any tool runs — so reading and
        removing memories are refused along with writing them. That is the part
        we consider a bug rather than a limit: at the moment you most need to
        look at what is in a room, or clear something out of it, you cannot.
      </p>
      <p>
        There are two bounds and they do not behave the same way. The daily
        operation budget clears by itself at midnight UTC, and a search counts
        against it because it embeds. Total capacity does not clear by itself,
        because the one action that would free space is blocked by the same
        gate.
      </p>
      <p>
        The message the server returns today suggests running the open-source
        server instead. That is not a recovery path for a room you already have
        — it is a different install, and it will not bring back what is in the
        room. If this happens to yours, mail us at the address below before you
        do anything else; the room is intact, it is the door that is shut. We
        are working on letting recovery through while writes stay blocked.
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
