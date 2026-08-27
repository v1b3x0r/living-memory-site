import { landing } from "../content/landing-copy";
import { AGENT_GUIDE_PATH, KEEP_PATH } from "../lib/install-copy";
import { KNOWN_ISSUES_PATH, WHATS_NEW_INDEX_PATH } from "../lib/site-links";
import { LmeMark } from "./LmeMark";

/**
 * One link list, rendered twice: inline on a wide screen, inside a disclosure
 * on a phone. `/keep` is in both because a paying visitor could not find the
 * way back in — that page is where they sign in, see the subscription, and
 * sign out.
 *
 * The menu is <details>/<summary>, so it opens with no JavaScript and no
 * hydration. It also keeps this header clear of the auth SDK, which the
 * project boundary (scripts/verify-project-boundary.mjs) does not allow the
 * presentation site to import — so the header links to sign-in rather than
 * reflecting whether you are signed in.
 */
const LINKS = [
  ...landing.nav.links,
  { label: "Docs", href: AGENT_GUIDE_PATH },
  { label: "What's new", href: WHATS_NEW_INDEX_PATH },
] as const;

const MENU_ONLY = [
  { label: "Known issues", href: KNOWN_ISSUES_PATH },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <LmeMark href="#main-content" />

      <nav className="site-nav" aria-label="Site">
        {LINKS.map((link) => (
          <a className="text-link" href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
        <a className="text-link" href={KEEP_PATH}>
          Sign in
        </a>
        <a className="button button--primary button--compact" href="#installer">
          {landing.nav.cta}
        </a>
      </nav>

      <details className="nav-menu">
        <summary aria-label="Menu">
          <span className="nav-menu__bars" aria-hidden="true" />
        </summary>
        <div className="nav-menu__panel">
          {[...LINKS, ...MENU_ONLY].map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
          <a className="nav-menu__account" href={KEEP_PATH}>
            Sign in — your world
          </a>
          <a className="button button--primary" href="#installer">
            {landing.nav.cta}
          </a>
        </div>
      </details>
    </header>
  );
}
