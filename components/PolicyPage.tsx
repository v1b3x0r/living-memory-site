import { LauncherBridge } from "./LauncherBridge";
import { LmeMark } from "./LmeMark";
import { BASE_PATH } from "../lib/base-path";

export function PolicyPage({
  eyebrow,
  title,
  updated,
  // A post is dated, not "last updated" — the label is the only difference,
  // so the shell takes it as a prop rather than forking.
  dateLabel = "Last updated",
  /* Which of these pages this is, for the bridge's `from` parameter — the
   * whole reason for a parameter is to learn which entrance people cross at,
   * and one shared value for seven pages would answer nothing. */
  bridgeSource,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  dateLabel?: string;
  bridgeSource: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="policy-shell">
      {/* ABOVE the page's own header, because it is not part of this page — it
          is about which building you walked into. These pages are where search
          engines and shared links deposit people (/whats-new is the confirmed
          case), and "Back to LME" was the only way out of any of them: a way
          deeper into the same old site, never across to the current one. */}
      <LauncherBridge source={`legacy-${bridgeSource}`} />
      <header className="policy-header">
        <LmeMark href={`${BASE_PATH}/`} />
        <a className="text-link" href={`${BASE_PATH}/`}>Back to LME</a>
      </header>
      <article className="policy-page">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="policy-page__updated">
          {dateLabel}: {updated}
        </p>
        {children}
      </article>
    </main>
  );
}
