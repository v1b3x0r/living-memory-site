import type { NextConfig } from "next";
import { BASE_PATH } from "./lib/base-path";

const nextConfig: NextConfig = {
  // Served at https://viibe.to/living-memory via a Workers route on the apex.
  basePath: BASE_PATH,
  // One canonical spelling for every URL on the site. Without this, the router
  // sends `/known-issues/` back to `/known-issues`, which would make every
  // canonical tag and sitemap entry point at a redirect instead of at the page.
  trailingSlash: true,
};

export default nextConfig;
