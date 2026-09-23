import { BASE_PATH } from "../lib/base-path";

/**
 * The world, as the surface of the Hero. The environment is absolute inside
 * this section and clipped to its bounds, so its tint cannot leak through the
 * notice above the Hero or the paper sections below it.
 *
 * One <picture>, two crops: the browser downloads ONLY the crop its viewport
 * needs (hiding an <img> with display:none never stopped the other download —
 * Codex, PR #18). The 900px switch matches the layout breakpoint in
 * globals.css.
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
