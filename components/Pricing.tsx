import { landing } from "../content/landing-copy";
import { KEEP_PATH } from "../lib/install-copy";

/**
 * The two blocks are deliberately not parallel in length or shape. A room is
 * an exchange; a world is somewhere you can put something down. Making them
 * symmetric would say they are the same kind of thing at two prices, which is
 * the one thing they are not.
 *
 * The table underneath them is symmetric, and that is not a contradiction:
 * the cards answer WHY these are different kinds of thing, the table answers
 * WHAT each one gives you, and a comparison that is not comparable is not a
 * comparison. Developers arrive here already knowing they want to compare.
 *
 * The table takes its column count from the data. A third tier is a change to
 * landing-copy.ts and nothing else.
 *
 * The CTA is the same blue as the rest of the page — never green — and it
 * leads to /keep, the only path that attaches the buyer's own customer id to
 * the checkout link.
 */

/** "yes"/"no" are marks; every other value is a phrase and prints as written. */
function Cell({ value }: { value: string }) {
  if (value !== "yes" && value !== "no") return <>{value}</>;
  const has = value === "yes";
  return (
    <>
      <span aria-hidden="true">{has ? "\u2713" : "\u2014"}</span>
      <span className="visually-hidden">{has ? "Yes" : "No"}</span>
    </>
  );
}

export function Pricing() {
  return (
    <section className="pricing" id="pricing" aria-labelledby="pricing-title">
      <h2 id="pricing-title">{landing.pricing.heading}</h2>
      <div className="pricing__grid">
        <article className="plan plan--room">
          <header>
            <h3>{landing.pricing.room.name}</h3>
            <strong className="plan__price">{landing.pricing.room.price}</strong>
          </header>
          {landing.pricing.room.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>
        <article className="plan plan--world">
          <header>
            <h3>{landing.pricing.world.name}</h3>
            <strong className="plan__price">{landing.pricing.world.price}</strong>
          </header>
          {landing.pricing.world.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <a className="button button--primary" href={KEEP_PATH}>
            {landing.pricing.cta}
          </a>
        </article>
      </div>
      <div className="compare__scroll">
        <table className="compare">
          <thead>
            <tr>
              <th scope="col">{landing.pricing.compare.heading}</th>
              {landing.pricing.compare.columns.map((column) => (
                <th scope="col" key={column.name}>
                  {column.name}
                  <span className="compare__price">{column.price}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {landing.pricing.compare.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell, index) => (
                  <td key={landing.pricing.compare.columns[index].name}>
                    <Cell value={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pricing__assurance">
        <span className="pricing__lock" aria-hidden="true">
          🔒
        </span>
        {landing.pricing.assurance}
      </p>
    </section>
  );
}
