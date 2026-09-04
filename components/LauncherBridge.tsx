import { launcherUrl } from "../lib/launcher";

/**
 * The crossing between the two generations of this product.
 *
 * It states the situation before it offers the link, and that ordering is the
 * whole point: a bare "Launcher" in a nav bar is reachable without being
 * discoverable — it reads as one more section of the site you are already on,
 * not as news that a different, current experience exists. Somebody who does
 * not know there are two buildings will not click a door they think is a
 * cupboard.
 *
 * It does not claim this site stopped working. It has not: the landing page
 * still mints rooms and /keep still holds a subscription. The true statement
 * is narrower and is the one made here — this is the original site, and the
 * current entrance is elsewhere.
 *
 * WHERE IT IS NOT: /keep and /oauth/*. Those are the two surfaces in the
 * middle of a flow that involves somebody's money or somebody's credentials,
 * and a banner offering an exit is worse than useless there. They are reached
 * by the quieter footer line instead, so nobody is left with no way across.
 */
export function LauncherBridge({ source }: { source: string }) {
  return (
    <aside className="bridge" aria-label="Newer experience">
      <p className="bridge__text">
        <span className="bridge__tag">Original site</span>
        You are on the first version of Living Memory. There is a newer one —
        the Launcher is the current way in.
      </p>
      <a className="bridge__link" href={launcherUrl(source)}>
        Open the Launcher<span aria-hidden="true"> →</span>
      </a>
    </aside>
  );
}
