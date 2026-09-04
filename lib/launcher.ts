/**
 * The one link in this repository that leaves it.
 *
 * There are two generations of the Living Memory web experience. This site is
 * the first one, and it is still publicly reachable: search results, shared
 * links, directory listings, bookmarks and social posts all point at these
 * URLs and cannot be recalled. The second one — the Launcher — is the current
 * entrance, and until now nothing here said so. A visitor who landed on
 * /whats-new from a search engine read the page, learned the product exists,
 * and had no way to discover that a newer front door had opened next to the
 * one they came through.
 *
 * So this constant is deliberately NOT in `site-links.ts`, whose contract is
 * "routes this site actually serves". This is the opposite: the address of the
 * building next door.
 *
 * WHY A `from` PARAMETER RATHER THAN A CLICK EVENT. Both sites report into the
 * same PostHog project, so a crossing is already measurable as a pageview —
 * the parameter only has to say WHICH bridge carried it. A tracked click would
 * mean turning the footer and the policy shell into client components to load
 * the telemetry module, which is a large change to measure a small thing.
 * Nothing identifying is in it, and the Launcher builds its canonical URL from
 * the pathname alone, so the parameter cannot split a page in search results.
 */
export const LAUNCHER_ORIGIN = "https://living-memory.app";

/** @param source which bridge this link is — see the call sites. */
export const launcherUrl = (source: string) =>
  `${LAUNCHER_ORIGIN}/?from=${source}`;
