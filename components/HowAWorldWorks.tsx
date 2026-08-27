import Image from "next/image";
import { landing } from "../content/landing-copy";
import { BASE_PATH } from "../lib/base-path";

/**
 * The mental-model bridge between the proof (WhatHappened) and the practice
 * (Installer). Three watercolor plates — official art direction, design
 * ruling 2026-08-24 — cropped from ONE master artwork; the same table in
 * every plate carries the continuity. Purely explanatory and static.
 *
 * The meaning lives in the visible beat sentences (an <ol> — the order IS
 * the content); the plates are decorative and aria-hidden. The one
 * hand-to-hand moment drawn anywhere on the page is in plate 2: the owner
 * passing a KEY (access) to an agent — never work, and never to a person.
 */
export function HowAWorldWorks() {
  return (
    <section
      className="how-world"
      id="how-a-world-works"
      aria-labelledby="how-world-title"
    >
      <h2 id="how-world-title">{landing.howAWorldWorks.heading}</h2>
      <ol className="how-world__beats">
        {landing.howAWorldWorks.beats.map((beat, index) => (
          <li className="how-world__beat" key={beat}>
            <Image
              className="how-world__plate"
              src={`${BASE_PATH}/brand/lme-how-${index + 1}.webp`}
              alt=""
              width={900}
              height={1125}
              unoptimized
            />
            <p>{beat}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
