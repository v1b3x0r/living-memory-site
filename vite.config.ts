import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
  // worker/index.ts calls env.IMAGES for next/image optimization
  images: { binding: "IMAGES" },
  // worker/index.ts serves base-path-prefixed public assets via env.ASSETS
  assets: { binding: "ASSETS" },
  // Public URL: https://viibe.to/living-memory (basePath in next.config.ts)
  routes: [
    { pattern: "viibe.to/living-memory*", zone_name: "viibe.to" },
    // Browsers probe /favicon.ico at the domain root regardless of <link rel>;
    // without this route it falls to the 100:: placeholder and 522s.
    { pattern: "viibe.to/favicon.ico", zone_name: "viibe.to" },
    // Crawler/agent-search surface — these live at the domain root by protocol.
    { pattern: "viibe.to/robots.txt", zone_name: "viibe.to" },
    { pattern: "viibe.to/sitemap.xml", zone_name: "viibe.to" },
    { pattern: "viibe.to/llms.txt", zone_name: "viibe.to" },
    { pattern: "viibe.to/.well-known/security.txt", zone_name: "viibe.to" },
    { pattern: "viibe.to/auth.md", zone_name: "viibe.to" },
    { pattern: "viibe.to/.well-known/api-catalog", zone_name: "viibe.to" },
  ],
  // Keep the *.workers.dev URL alive as a test surface alongside the route
  workers_dev: true,
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: localBindingConfig,
      }),
    ],
  };
});
