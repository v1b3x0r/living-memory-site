import { landing } from "../content/landing-copy";

export function WhatItsFor() {
  return (
    <section className="for-what" id="what-its-for" aria-labelledby="for-what-title">
      <h2 id="for-what-title">{landing.whatItsFor.heading}</h2>
      <div className="for-what__grid">
        {landing.whatItsFor.cards.map((card) => (
          <article className="for-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
