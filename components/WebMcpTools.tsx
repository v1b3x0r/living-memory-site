"use client";

import { useEffect } from "react";
import { mintRoom } from "../lib/mint-room";
import { createFreeRoomTool, type WebMcpTool } from "../lib/webmcp-tools";
import { track } from "../lib/telemetry";
import {
  GRANT_EVENT,
  GRANT_FAILED_EVENT,
  GRANT_PENDING_EVENT,
} from "./HeroMint";

/** The slice of WebMCP this page uses (Chrome 149+ origin trial). */
interface ModelContext {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
}

/**
 * The software-guest entrance: a visiting agent (Chrome with WebMCP, or the
 * ChatGPT in-app browser) finds the same room creator the hero button offers
 * a human. Renders nothing; on browsers without WebMCP it does nothing.
 */
export function WebMcpTools() {
  useEffect(() => {
    const modelContext = (
      document as Document & { modelContext?: ModelContext }
    ).modelContext;
    if (typeof modelContext?.registerTool !== "function") return;
    const controller = new AbortController();
    modelContext.registerTool(
      createFreeRoomTool({
        mint: async () => {
          // The same events the hero fires: both surfaces lock during the
          // request, and a room minted BY THE AGENT appears in the page UI —
          // hero and installer pick it up like any other grant.
          window.dispatchEvent(new CustomEvent(GRANT_PENDING_EVENT));
          try {
            const grant = await mintRoom();
            track("ons_minted", { surface: "webmcp" });
            window.dispatchEvent(
              new CustomEvent(GRANT_EVENT, { detail: grant }),
            );
            return grant;
          } catch (e) {
            window.dispatchEvent(new CustomEvent(GRANT_FAILED_EVENT));
            throw e;
          }
        },
      }),
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, []);
  return null;
}
