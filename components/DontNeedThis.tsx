import { landing } from "../content/landing-copy";

/**
 * Full width, the most air on the page. Type only — no icons, no cards, no
 * borders. This is the block most likely to be screenshotted and shared, and
 * it is what makes every claim above it credible, so it does not get shrunk
 * to fit.
 */
export function DontNeedThis() {
  return (
    <section className="dont-need" aria-labelledby="dont-need-title">
      <h2 id="dont-need-title">{landing.dontNeed.heading}</h2>
      <div className="dont-need__columns">
        {landing.dontNeed.columns.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </section>
  );
}
