import Image from "next/image";
import { landing } from "../content/landing-copy";
import { BASE_PATH } from "../lib/base-path";
import { launcherUrl } from "../lib/launcher";
import { AGENT_GUIDE_PATH, GITHUB_URL, NPM_URL } from "../lib/install-copy";
import { PRIVACY_PATH, SUPPORT_PATH, TERMS_PATH } from "../lib/site-links";

/**
 * Product surfaces, developer entry points, and trust destinations are separate
 * so the footer can keep growing without turning into a feature list. Every
 * destination below was checked against the current site or Launcher before it
 * was added; product directories are linked from their actual index rather
 * than from invented standalone routes.
 *
 * No Discord: there is no staffed one, and an empty server is visible
 * abandonment. No email capture: a form that goes nowhere does not belong on a
 * page whose whole argument is that we tell the truth.
 */
const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: launcherUrl("legacy-footer-how", "/reading") },
      { label: "Rooms & Worlds", href: launcherUrl("legacy-footer-lobby", "/lobby") },
      { label: "Pricing", href: launcherUrl("legacy-footer-pricing", "/reading#access") },
    ],
  },
  {
    title: "Explore",
    links: [
      {
        label: "Public rooms & Time Capsule",
        href: launcherUrl("legacy-footer-explore", "/lobby/explore"),
      },
      {
        label: "Enter a room address",
        href: launcherUrl("legacy-footer-theatre", "/theatre"),
      },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Guides", href: launcherUrl("legacy-footer-docs", "/setup") },
      { label: "Agent guide", href: AGENT_GUIDE_PATH },
      { label: "CLI", href: "https://cli.living-memory.app" },
      {
        label: "Engine on npm",
        href: "https://www.npmjs.com/package/@nature-labs/living-memory-engine",
      },
      { label: "Local MCP on npm", href: NPM_URL },
      {
        label: "JavaScript SDK on npm",
        href: "https://www.npmjs.com/package/@nature-labs/living-memory-js",
      },
      { label: "Engine source", href: GITHUB_URL },
      { label: "llms.txt", href: `${BASE_PATH}/llms.txt` },
    ],
  },
  {
    title: "Trust & company",
    links: [
      {
        label: "What's new",
        href: launcherUrl("legacy-footer-whats-new", "/whats-new"),
      },
      {
        label: "Known issues",
        href: launcherUrl("legacy-footer-known-issues", "/reading#known-issues"),
      },
      { label: "Status", href: "https://status.viibe.to/living-memory" },
      { label: "Privacy", href: PRIVACY_PATH },
      { label: "Terms", href: TERMS_PATH },
      { label: "Support", href: SUPPORT_PATH },
      { label: "Security", href: "https://viibe.to/.well-known/security.txt" },
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
          {/* The footer renders on EVERY page, including /keep and /oauth/*,
              which deliberately carry no banner — they are in the middle of a
              purchase or a sign-in and a sideways exit does not belong there.
              This line is what makes "no banner" different from "no way out":
              quiet, below the fold, and still says which is the current one. */}
          <a className="site-footer__bridge" href={launcherUrl("legacy-footer")}>
            Newer experience: open the Launcher<span aria-hidden="true"> →</span>
          </a>
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
              rel="noreferrer"
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
              rel="noreferrer"
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
              rel="noreferrer"
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
