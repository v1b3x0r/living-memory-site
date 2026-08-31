import { TICKER_LIMIT, WHATS_NEW } from "../content/whats-new";
import { WHATS_NEW_INDEX_PATH } from "../lib/site-links";

/**
 * The strip across the top of every page. It is a 2000s marquee on purpose —
 * the founder asked for one and the job it does is a 2000s job: prove, before
 * anybody reads a word of the argument, that something is behind this page and
 * it moved recently.
 *
 * Three things keep it from being decoration:
 *
 * 1. It reads the real changelog. There is no separate string to update, so
 *    the crawl cannot drift into advertising something that never shipped.
 * 2. Nothing inside the moving track is focusable. The track is rendered twice
 *    to loop seamlessly, and the second copy is aria-hidden — a link in there
 *    would still take tab focus while being hidden from a screen reader, which
 *    is the classic marquee accessibility bug. So the links are the two ends,
 *    which do not move.
 * 3. It stops. Hover or focus anywhere in the strip pauses it (a headline you
 *    cannot finish reading is worse than no headline), and
 *    prefers-reduced-motion turns the crawl into a plain scrollable line.
 */

/**
 * 2026-08-21 → "Fri 21 Aug".
 *
 * The first version of this printed "08.21", and the founder read it as
 * twenty past eight — which it looks exactly like, sliding past in a mono
 * band next to a headline. A weekday and a month name cannot be misread as a
 * clock, which is the entire job here.
 *
 * There is no time of day in it because there is no time of day in the data.
 * An entry knows the day it was verified, not the hour, and inventing an hour
 * to make the ribbon look richer is the same class of lie this whole feed is
 * built to avoid.
 *
 * The date shown is `verified` — the day someone opened the running product
 * and watched this work — and it is labelled "Seen" rather than left bare.
 * Codex caught the bare version back when this printed `merged`: an unlabelled
 * date on a strip headed "New" reads as an availability date, and a merge date
 * is not one. `verified` genuinely is, which is why the label can now say what
 * the date means instead of warning the reader off it.
 *
 * Pinned to UTC and to en-GB so the server and the browser cannot render two
 * different weekdays for one string.
 */
function tickerDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

const ENTRIES = WHATS_NEW.slice(0, TICKER_LIMIT);

function TickerRun() {
  return (
    <span className="ticker__run">
      {ENTRIES.map((entry) => (
        <span className="ticker__item" key={`${entry.verified}-${entry.title}`}>
          <span className="ticker__star" aria-hidden="true">
            ✦
          </span>
          {/* One ribbon per change. Each is a closed shape with its own date
              tab, so a reader catching the strip mid-slide can tell where one
              item ends and the next begins — an unbroken stream of words was
              the other half of why the old date was misread. */}
          <span className="ticker__chip">
            <span className="ticker__date">
              <span className="ticker__date-label">Seen</span>
              {tickerDate(entry.verified)}
            </span>
            <span className="ticker__title">{entry.title}</span>
          </span>
        </span>
      ))}
    </span>
  );
}

export function NewsTicker() {
  return (
    <aside className="ticker" aria-label="What's new">
      <a className="ticker__badge" href={WHATS_NEW_INDEX_PATH}>
        <span className="ticker__blink" aria-hidden="true">
          ★
        </span>
        New
      </a>

      <div className="ticker__viewport">
        <div className="ticker__track">
          <TickerRun />
          {/* The seam. Hidden from assistive tech so the list is announced once. */}
          <span aria-hidden="true">
            <TickerRun />
          </span>
        </div>
      </div>

      <a className="ticker__all" href={WHATS_NEW_INDEX_PATH}>
        All<span aria-hidden="true"> →</span>
      </a>
    </aside>
  );
}
