import { landing } from "../content/landing-copy";
import { HeroMint } from "./HeroMint";
import { SiteHeader } from "./SiteHeader";

/**
 * The entrance scene (reskin round 1b, 2026-08-23 — founder-approved
 * STRUCTURAL change). The hero is a full-bleed shell that sits OUTSIDE the
 * constrained page column: the world scene is the environment of the whole
 * band, the header overlays it, and the copy sits in an inner grid that
 * still aligns with the `--page` column everything below uses. On a phone
 * the scene stays behind the copy — the copy lands on the paper fade the
 * asset was drawn with, never as a second stacked block.
 */
export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* No background of its own since round 2 — the hero is a transparent
          window onto <WorldEnv/>, the page-level environment layer. */}
      <div className="hero__inner">
        <SiteHeader />
        <div className="hero__copy">
          <h1 id="hero-title">{landing.hero.headline}</h1>
          <p className="hero__support">
            {landing.hero.support.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          {/* WS2: the CTA mints in place — game start screen, not a scroll
              link. The installer below is the guide, not the gate. */}
          <HeroMint />
          <p className="trust-row">{landing.hero.trust.join(" · ")}</p>
        </div>
      </div>
    </section>
  );
}
