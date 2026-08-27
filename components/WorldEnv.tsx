import { BASE_PATH } from "../lib/base-path";

/**
 * The world, as the surface of the page (reskin round 2, 2026-08-24 —
 * founder-approved STRUCTURAL). One fixed, full-viewport environment layer:
 * the hero is a transparent window onto it, and the opaque content panels
 * scroll over it, so the gaps between sections keep revealing the same world
 * instead of every section paying for its own illustration.
 *
 * A fixed element, deliberately not `background-attachment: fixed` — iOS
 * Safari does not honor that, this it honors. One <picture>, two crops:
 * the browser downloads ONLY the crop its viewport needs (hiding an <img>
 * with display:none never stopped the other download — Codex, PR #18).
 * The 900px switch matches the layout breakpoint in globals.css.
 */
export function WorldEnv() {
  return (
    <div className="world-env" aria-hidden="true">
      <picture>
        <source
          media="(max-width: 900px)"
          srcSet={`${BASE_PATH}/brand/lme-world-table-tall.webp`}
          width={853}
          height={1844}
        />
        <img
          className="world-env__scene"
          src={`${BASE_PATH}/brand/lme-world-table.webp`}
          alt=""
          width={1819}
          height={1024}
          fetchPriority="high"
          decoding="async"
        />
      </picture>
      <div className="world-env__tint" />
    </div>
  );
}
