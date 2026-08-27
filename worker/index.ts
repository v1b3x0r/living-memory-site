/** Cloudflare Worker entry point for the LME launch presentation. */
import {
  handleImageOptimization,
  DEFAULT_DEVICE_SIZES,
  DEFAULT_IMAGE_SIZES,
  isImageOptimizationPath,
} from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { BASE_PATH } from "../lib/base-path";
import { LLMS_TXT, ROBOTS_TXT, SITEMAP_XML } from "../lib/llms-txt";
import { SECURITY_TXT } from "../lib/security-txt";
import { AUTH_MD, API_CATALOG } from "../lib/agent-auth-md";

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (isImageOptimizationPath(url.pathname)) {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    // One canonical spelling of the home page. `/living-memory` is the URL a
    // human types and pastes into chat; `/living-memory/` is what the page
    // links to and what every registry listing hardcodes. Collapsing them
    // permanently means a crawler, a share card and a listing cannot end up
    // describing two half-populated copies of the same page.
    if (url.pathname === BASE_PATH) {
      const target = new URL(request.url);
      target.pathname = `${BASE_PATH}/`;
      return Response.redirect(target.toString(), 301);
    }

    // Browsers request /favicon.ico at the domain root; serve the brand icon
    // (content-type wins over the .ico extension).
    if (url.pathname === "/favicon.ico") {
      return env.ASSETS.fetch(new Request(new URL("/favicon.webp", request.url)));
    }

    // Crawler / agent-search surface. robots+sitemap live at the domain root
    // by protocol; llms.txt answers at both the root and under the base path.
    const text = (body: string, type: string) =>
      new Response(body, { headers: { "content-type": type } });
    if (url.pathname === "/robots.txt") return text(ROBOTS_TXT, "text/plain; charset=utf-8");
    if (url.pathname === "/sitemap.xml") return text(SITEMAP_XML, "application/xml");
    if (url.pathname === "/llms.txt" || url.pathname === `${BASE_PATH}/llms.txt`)
      return text(LLMS_TXT, "text/plain; charset=utf-8");
    if (url.pathname === "/.well-known/security.txt")
      return text(SECURITY_TXT, "text/plain; charset=utf-8");
    if (url.pathname === "/auth.md" || url.pathname === `${BASE_PATH}/auth.md`)
      return text(AUTH_MD, "text/markdown; charset=utf-8");
    if (url.pathname === "/.well-known/api-catalog")
      return text(API_CATALOG, 'application/linkset+json');

    // Public assets (brand/, favicon, og.png) live at the root of the asset
    // bundle, but the page references them under BASE_PATH. vinext's own
    // static-file fallthrough returns an empty 200 on Workers, so serve them
    // from ASSETS with the prefix stripped before handing off to the app.
    if (url.pathname.startsWith(`${BASE_PATH}/`)) {
      const stripped = url.pathname.slice(BASE_PATH.length);
      const asset = await env.ASSETS.fetch(
        new Request(new URL(stripped, request.url)),
      );
      if (asset.status === 200) return asset;
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
