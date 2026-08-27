import { landing } from "../content/landing-copy";
import { WHATS_NEW_PATH } from "../lib/site-links";

/**
 * The proof block. It prints times and vendors and deliberately prints no room
 * id — an earlier draft showed one, and that room was live.
 *
 * Each actor is a pill because the whole claim rests on them being different
 * applications from different companies. Rendered as a real list rather than a
 * <pre> so the names stay legible when a phone narrows the column.
 */
export function WhatHappened() {
  return (
    <section className="happened" aria-labelledby="happened-title">
      <h2 id="happened-title">{landing.happened.heading}</h2>
      <div className="happened__grid">
        <div className="timeline">
          <ol className="timeline__rows">
            {landing.happened.timeline.map((entry) => (
              <li className="timeline__row" key={entry.time}>
                <time className="timeline__time">{entry.time}</time>
                <span className="pill">{entry.actor}</span>
                <span className="timeline__text">{entry.text}</span>
              </li>
            ))}
          </ol>
          <p className="timeline__notes">
            {landing.happened.notes.map((note) => (
              <span key={note}>{note}</span>
            ))}
          </p>
        </div>
        <div className="happened__aside">
          {landing.happened.aside.map((line, index) => (
            <p key={line} className={index === 0 ? "happened__lede" : undefined}>
              {line}
            </p>
          ))}
          <a className="text-link" href={WHATS_NEW_PATH}>
            {landing.happened.readMore}
          </a>
        </div>
      </div>
    </section>
  );
}
