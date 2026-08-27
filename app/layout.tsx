import type { Metadata } from "next";
import { headers } from "next/headers";
import { BASE_PATH } from "../lib/base-path";
import {
  OG_IMAGE_ALT,
  SITE_DESCRIPTION,
  SITE_ORIGIN,
  SITE_TITLE,
  canonicalUrl,
} from "../lib/page-meta";
import { NewsTicker } from "../components/NewsTicker";
import { SiteFooter } from "../components/SiteFooter";
import { Telemetry } from "../components/Telemetry";
import "./globals.css";

// Title and description are assembled only from approved landing copy — the
// hero line and the hero support. Nothing new is claimed in metadata that is
// not claimed on the page. These same strings go into every registry listing,
// so the card and the listing cannot disagree.
const title = SITE_TITLE;
const description = SITE_DESCRIPTION;
const canonicalHref = canonicalUrl();

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Living Memory Engine",
  alternateName: "LME",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  description,
  url: canonicalHref,
  slogan: "Remember. Understand. Grow.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description:
        "Free open-source local MCP server (@nature-labs/lme-mcp on npm) and a free hosted trial memory world.",
    },
    {
      "@type": "Offer",
      price: "9",
      priceCurrency: "USD",
      description:
        "Living Memory — persistent hosted memory world, billed monthly.",
      url: `${canonicalHref}keep/`,
    },
  ],
  sameAs: [
    "https://github.com/v1b3x0r/living-memory-engine",
    "https://www.npmjs.com/package/@nature-labs/lme-mcp",
  ],
};

function metadataOrigin(requestHeaders: Headers): string | undefined {
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host || !/^https?$/i.test(protocol)) return undefined;
  if (!/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) return undefined;

  try {
    return new URL(`${protocol.toLowerCase()}://${host}`).origin;
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const origin = metadataOrigin(requestHeaders);
  // A share card without a picture is the same as no card. When the request
  // carries no trustworthy host (constructed requests, odd proxies), fall back
  // to the frozen canonical origin rather than dropping the image.
  const image = `${origin ?? SITE_ORIGIN}${BASE_PATH}/og.jpg`;

  return {
    title,
    description,
    alternates: { canonical: canonicalHref },
    manifest: `${BASE_PATH}/site.webmanifest`,
    icons: {
      icon: [
        { url: `${BASE_PATH}/favicon.svg`, type: "image/svg+xml" },
        { url: `${BASE_PATH}/favicon-32x32.png`, type: "image/png", sizes: "32x32" },
        { url: `${BASE_PATH}/favicon-96x96.png`, type: "image/png", sizes: "96x96" },
      ],
      shortcut: `${BASE_PATH}/favicon.webp`,
      apple: `${BASE_PATH}/apple-touch-icon.png`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_US",
      url: canonicalHref,
      siteName: "Living Memory",
      images: [{ url: image, width: 1200, height: 630, alt: OG_IMAGE_ALT }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: OG_IMAGE_ALT }],
    },
  };
}

// theme-color lives in viewport, not metadata — Next splits them since 14.
export const viewport = {
  themeColor: "#0a2540",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Telemetry />
        <NewsTicker />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
