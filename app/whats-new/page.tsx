import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";
import { WHATS_NEW, WHATS_NEW_LEDE } from "../../content/whats-new";
import { pageMeta } from "../../lib/page-meta";
import { whatsNewEntryPath } from "../../lib/site-links";

export const metadata: Metadata = pageMeta({
  path: "whats-new",
  title: "What's new — Living Memory",
  description:
    "What you can see, try, or discover in Living Memory right now, newest first. Every entry carries the day somebody last opened the running product and watched that thing work.",
});

// The feed. Deliberately a list and not a blog: most changes do not deserve a
// write-up, and a changelog that only shows the changes big enough to write
// about is a changelog that looks stalled.
//
// The date on every row is `verified`, not `merged`. A merge date is a fact
// about a repository; this page answers "what can I see or try now", and the
// only date that answers it is the day a person watched the thing work.
export default function WhatsNewIndexPage() {
  const [latest] = WHATS_NEW;

  return (
    <PolicyPage
      eyebrow="WHAT'S NEW"
      title="What's new"
      updated={latest.verified}
      dateLabel="Last verified"
    >
      <p>{WHATS_NEW_LEDE}</p>

      <ol className="feed">
        {WHATS_NEW.map((entry) => (
          <li className="feed__entry" key={`${entry.verified}-${entry.title}`}>
            <time className="feed__date" dateTime={entry.verified}>
              Seen working {entry.verified}
            </time>
            <h2 className="feed__title">
              {entry.href ? (
                <a href={whatsNewEntryPath(entry.href)}>{entry.title}</a>
              ) : (
                entry.title
              )}
            </h2>
            <p className="feed__blurb">{entry.blurb}</p>
            {entry.tryIt ? (
              <p className="feed__try">
                <strong>Try it:</strong>{" "}
                <a href={entry.tryIt.href}>{entry.tryIt.label}</a> —{" "}
                {entry.tryIt.notice}
              </p>
            ) : null}
            <p className="feed__verified">
              Checked — {entry.verifiedBy}
              {entry.merged ? ` · Merged ${entry.merged}` : ""}
            </p>
          </li>
        ))}
      </ol>

      <p className="policy-page__colophon">
        <em>
          An entry appears here when the thing is running, not when it is
          written. If something is described on this page and does not work,
          that is a bug in this page and we want to hear about it.
        </em>
      </p>
    </PolicyPage>
  );
}
