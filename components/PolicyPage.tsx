import { LmeMark } from "./LmeMark";
import { BASE_PATH } from "../lib/base-path";

export function PolicyPage({
  eyebrow,
  title,
  updated,
  // A post is dated, not "last updated" — the label is the only difference,
  // so the shell takes it as a prop rather than forking.
  dateLabel = "Last updated",
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  dateLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="policy-shell">
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
