import { FEEDBACK_EMAIL, landing } from "../content/landing-copy";
import { KNOWN_ISSUES_PATH } from "../lib/site-links";

/** One item only. The full list lives on its own page. */
export function KnownIssuesStrip() {
  return (
    <section className="issues-strip" aria-labelledby="issues-strip-title">
      <h2 id="issues-strip-title">{landing.knownIssues.heading}</h2>
      <ul>
        <li>{landing.knownIssues.item}</li>
      </ul>
      <p className="issues-strip__foot">
        <span>
          {landing.knownIssues.tell}{" "}
          <a href={`mailto:${FEEDBACK_EMAIL}`}>{FEEDBACK_EMAIL}</a>
        </span>
        <a className="button button--secondary" href={KNOWN_ISSUES_PATH}>
          {landing.knownIssues.all}
        </a>
      </p>
    </section>
  );
}
