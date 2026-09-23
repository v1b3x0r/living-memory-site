"use client";

import { useEffect, useRef } from "react";
import { landing } from "../content/landing-copy";
import { KEEP_PATH } from "../lib/install-copy";
import { launcherUrl } from "../lib/launcher";
import { LmeMark } from "./LmeMark";

/**
 * One link list, rendered twice: inline on a wide screen, inside a disclosure
 * on a phone. `/keep` is in both because a paying visitor could not find the
 * way back in — that page is where they sign in, see the subscription, and
 * sign out.
 *
 * The menu remains native <details>/<summary>, so it opens without JavaScript;
 * a tiny effect adds Escape-to-close and returns focus to the summary. It also
 * keeps this header clear of the auth SDK, which the project boundary
 * (scripts/verify-project-boundary.mjs) does not allow the presentation site
 * to import — so the header links to sign-in rather than reflecting whether
 * you are signed in.
 */
const LINKS = [
  { label: "How it works", href: launcherUrl("legacy-nav-how", "/reading") },
  { label: "Explore", href: launcherUrl("legacy-nav-explore", "/lobby/explore") },
  { label: "Docs", href: launcherUrl("legacy-nav-docs", "/setup") },
] as const;

const MENU_ONLY = [
  { label: "Pricing", href: launcherUrl("legacy-mobile-pricing", "/reading#access") },
  {
    label: "Known issues",
    href: launcherUrl("legacy-mobile-known-issues", "/reading#known-issues"),
  },
] as const;

export function SiteHeader() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    if (menu === null) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menu.open) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    };

    menu.addEventListener("keydown", closeOnEscape);
    return () => menu.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className="site-header">
      <LmeMark href="#main-content" />

      <nav className="site-nav" aria-label="Site">
        {LINKS.map((link) => (
          <a className="text-link" href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
        {/* Not bare "Sign in": this link is also the account page, and it is the
            only way back for someone who already pays. The mobile menu has said
            so since it was written; the desktop nav was the one left behind. */}
        <a className="text-link" href={KEEP_PATH}>
          Sign in — your world
        </a>
        {/* The nav's primary control now LEAVES this site. It used to scroll to
            the installer on this page, which the hero's own button already
            does better and still does — so this slot was the strongest place
            on the most-landed-on URL of the product to put the crossing, and
            spending it on a second route to the same section was waste.
            Founder's call, 2026-09-04: this button only, not the hero's, and
            nothing about the WebMCP room creator changes. */}
        <a
          className="button button--primary button--compact"
          href={launcherUrl("legacy-nav")}
        >
          {landing.nav.cta}
        </a>
      </nav>

      <details className="nav-menu" ref={menuRef}>
        <summary aria-label="Menu">
          <span className="nav-menu__bars" aria-hidden="true" />
        </summary>
        <div className="nav-menu__panel">
          {[...LINKS, ...MENU_ONLY].map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
          <a className="nav-menu__account" href={KEEP_PATH}>
            Sign in — your world
          </a>
          {/* Same control at the phone breakpoint, so it makes the same
              crossing — on a phone this IS the top-right button. */}
          <a className="button button--primary" href={launcherUrl("legacy-nav")}>
            {landing.nav.cta}
          </a>
        </div>
      </details>
    </header>
  );
}
