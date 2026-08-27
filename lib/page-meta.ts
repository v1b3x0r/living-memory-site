import { BASE_PATH } from "./base-path.ts";

/**
 * The canonical origin. Frozen: every registry submission, every share card and
 * every crawler record hardcodes the URL built from it, and correcting one of
 * those after it has been mirrored is expensive. Change this only with the same
 * care as a domain move.
 */
export const SITE_ORIGIN = "https://viibe.to";

/**
 * Canonical URL for a page.
 *
 * Always ends in a slash. `/living-memory` and `/living-memory/` are the same
 * page, and a share card, a canonical tag and a registry listing that disagree
 * about which one is real will eventually be counted as two pages that each
 * look half-abandoned.
 */
export function canonicalUrl(path = ""): string {
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  return trimmed.length === 0
    ? `${SITE_ORIGIN}${BASE_PATH}/`
    : `${SITE_ORIGIN}${BASE_PATH}/${trimmed}/`;
}

/** The share card, and the words that go with it. One image for the whole site. */
export const OG_IMAGE_PATH = `${BASE_PATH}/og.jpg`;

/** Describes only what is drawn on og.jpg — same rule as every other meta string. */
export const OG_IMAGE_ALT =
  "Living Memory — a watercolor world where agents come and go: a person works at a laptop beside a floating globe holding a lighthouse. \"A world that remembers so your work can continue.\"";

export const SITE_TITLE = "Living Memory — One world. You and your agents come and go.";
export const SITE_DESCRIPTION =
  "One world you and your AI agents come and go from — across models, devices and apps. Tell one agent something today; ask a different one about it tomorrow.";

export interface PageMetaInput {
  /** Path under the base path, e.g. "known-issues". Empty for the landing page. */
  path?: string;
  title: string;
  description: string;
}

/**
 * Open Graph and canonical metadata for one page. Sub-pages carry their own
 * heading and first sentence — inheriting the landing page's card meant every
 * share of /known-issues advertised the landing page instead.
 */
export function pageMeta({ path, title, description }: PageMetaInput) {
  const url = canonicalUrl(path);
  // Next replaces `openGraph` wholesale rather than merging it, so the image
  // has to be repeated here or a sub-page ships a card with no picture.
  const image = `${SITE_ORIGIN}${OG_IMAGE_PATH}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website" as const,
      locale: "en_US",
      url,
      siteName: "Living Memory",
      images: [{ url: image, width: 1200, height: 630, alt: OG_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [{ url: image, alt: OG_IMAGE_ALT }],
    },
  };
}
