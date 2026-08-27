import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";
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
      eyebrow="WHAT'S NEW"
      title="What's new"
      updated={latest.merged}
      dateLabel="Latest merge"
    >
      <p>{WHATS_NEW_LEDE}</p>

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
