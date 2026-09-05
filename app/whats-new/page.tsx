import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";
import { launcherUrl } from "../../lib/launcher";
import { WHATS_NEW, WHATS_NEW_LEDE } from "../../content/whats-new";
import { pageMeta } from "../../lib/page-meta";
import { whatsNewEntryPath } from "../../lib/site-links";

export const metadata: Metadata = pageMeta({
  path: "whats-new",
  title: "What's new — Living Memory",
  description:
    "Recent changes to Living Memory, newest first. Each entry carries the day it was merged and the day somebody last opened the running product and watched it work.",
});

// The feed. Deliberately a list and not a blog: most changes do not deserve a
// write-up, and a changelog that only shows the changes big enough to write
// about is a changelog that looks stalled.
export default function WhatsNewIndexPage() {
  const [latest] = WHATS_NEW;

  return (
    <PolicyPage
      bridgeSource="whats-new"
      eyebrow="WHAT'S NEW"
      title="What's new"
      updated={latest.merged}
      dateLabel="Latest merge"
    >
      <p>{WHATS_NEW_LEDE}</p>

      {/* THE CONFIRMED TRAP, AND WHY THIS PAGE GETS MORE THAN THE BANNER.
          A real visitor arrived here from outside, read the feed, and left
          without ever learning that a newer experience existed. It is the most
          linked-to page on this site after the landing — search results, the
          ticker on every page, the footer of every page, and outbound links
          from the Launcher itself all end here — and until now every one of
          those arrivals ended in a list of dates with no product behind it.

          It says the two things a banner cannot fit, and in this order: what
          this page IS (the first version's changelog), and what the reader
          probably came looking for (the product, which now opens somewhere
          else). Then one destination — the Launcher itself, not the Launcher's
          copy of this same feed, which would only move somebody from one
          changelog to another changelog. */}
      <aside className="bridge-panel" aria-label="The current entrance">
        <p className="eyebrow">THE CURRENT ENTRANCE</p>
        <h2 className="bridge-panel__title">
          There is a newer Living Memory, and this is not it
        </h2>
        <p className="bridge-panel__copy">
          You are reading the changelog of the original site. It still works and
          it stays here. But the way into the product now starts at the
          Launcher — a free room with no sign-in, or a world your agents come
          back to.
        </p>
        <a
          className="button button--primary"
          href={launcherUrl("legacy-whats-new")}
        >
          Open the Launcher<span aria-hidden="true"> →</span>
        </a>
      </aside>

      <ol className="feed">
        {WHATS_NEW.map((entry) => (
          <li className="feed__entry" key={`${entry.merged}-${entry.title}`}>
            <time className="feed__date" dateTime={entry.merged}>
              Merged {entry.merged}
            </time>
            <h2 className="feed__title">
              {entry.href ? (
                <a href={whatsNewEntryPath(entry.href)}>{entry.title}</a>
              ) : (
                entry.title
              )}
            </h2>
            <p className="feed__blurb">{entry.blurb}</p>
            <p className="feed__verified">
              Verified running {entry.verified} — {entry.verifiedBy}
            </p>
          </li>
        ))}
      </ol>

      <p className="policy-page__colophon">
        <em>
          An entry appears here when the change is running, not when it is
          written. If something is described on this page and does not work,
          that is a bug in this page and we want to hear about it.
        </em>
      </p>
    </PolicyPage>
  );
}
