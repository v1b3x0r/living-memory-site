import Image from "next/image";
import { landing } from "../content/landing-copy";
import { BASE_PATH } from "../lib/base-path";
import { AGENT_GUIDE_PATH, GITHUB_URL, NPM_URL } from "../lib/install-copy";
import {
  KNOWN_ISSUES_PATH,
  PRIVACY_PATH,
  SUPPORT_PATH,
  TERMS_PATH,
  WHATS_NEW_INDEX_PATH,
} from "../lib/site-links";

/**
 * Every link here resolves to a page that exists. Section anchors are absolute
 * rather than bare fragments because this footer renders on /privacy and
 * /keep too, where "#pricing" would go nowhere.
 *
 * No Discord: there is no staffed one, and an empty server is visible
 * abandonment. No email capture: a form that goes nowhere does not belong on a
 * page whose whole argument is that we tell the truth.
 */
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: `${BASE_PATH}/#installer` },
      { label: "Pricing", href: `${BASE_PATH}/#pricing` },
      { label: "What it's for", href: `${BASE_PATH}/#what-its-for` },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: AGENT_GUIDE_PATH },
      { label: "npm", href: NPM_URL },
      { label: "GitHub", href: GITHUB_URL },
      { label: "llms.txt", href: `${BASE_PATH}/llms.txt` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Privacy", href: PRIVACY_PATH },
      { label: "Terms", href: TERMS_PATH },
      { label: "Support", href: SUPPORT_PATH },
    ],
  },
  {
    title: "More",
    links: [
      { label: "What's new", href: WHATS_NEW_INDEX_PATH },
      { label: "Known issues", href: KNOWN_ISSUES_PATH },
      { label: "Status", href: "https://status.viibe.to/living-memory" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand">
          <Image
            src={`${BASE_PATH}/favicon.webp`}
            alt=""
            width={96}
            height={96}
            unoptimized
          />
          <p className="site-footer__tagline">{landing.footer.tagline}</p>
          <p className="site-footer__invariant">{landing.footer.invariant}</p>
          <a
            className="site-footer__social"
            href={GITHUB_URL}
            aria-label="Living Memory on GitHub"
          >
            GitHub
          </a>
          {/* Plain <img>, not next/image: these are hotlinked from the
              directories that issued them, and next/image would need each host
              declared in images.remotePatterns for a site that exports static
              anyway. width/height stay on the tags so the row reserves its
              space before the two SVGs arrive. */}
          <div className="site-footer__badges">
            <a
              href="https://www.stork.ai/en/living-memory-mcp"
              target="_blank"
              rel="noopener"
            >
              <img
                src="https://www.stork.ai/badge/verified-dark.svg"
                alt="Stork Verified — stork.ai AI tools directory"
                width={216}
                height={44}
              />
            </a>
            <a
              href="https://launchstag.com/p/tool-1786931000971"
              target="_blank"
              rel="noopener"
            >
              <img
                src="https://launchstag.com/badge-light.svg"
                alt="Featured on Launchstag"
                width={198}
                height={62}
              />
            </a>
            <a
              href="https://postyourstartup.co/startup/living-memory?ref=badge"
              target="_blank"
              rel="noopener"
            >
              <img
                src="https://postyourstartup.co/api/badge/living-memory?theme=dark"
                alt="Featured on PostYourStartup"
                width={212}
                height={55}
              />
            </a>
          </div>
        </div>
        {COLUMNS.map((column) => (
          <nav className="site-footer__column" key={column.title} aria-label={column.title}>
            <p className="site-footer__column-title">{column.title}</p>
            {column.links.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </nav>
        ))}
      </div>
      <p className="site-footer__legal">
        <span>{landing.footer.copyright}</span>
        <span>{landing.footer.domain}</span>
      </p>
    </footer>
  );
}
