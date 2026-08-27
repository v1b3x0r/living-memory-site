"use client";

import qrcode from "qrcode-generator";

/**
 * A room URL rendered as a QR, in the browser, from the value the mint
 * endpoint actually returned. Nothing about a room is ever baked into the
 * markup, so this component only exists once a real URL is in hand.
 *
 * Drawn as SVG rather than a canvas or an image service: it stays crisp on a
 * phone camera at any size, needs no network round-trip, and the room URL
 * never leaves the visitor's browser to reach a third-party renderer.
 */
export function QrCode({ value, size = 168 }: { value: string; size?: number }) {
  // Type 0 = pick the smallest version that fits. Level M survives the amount
  // of glare a phone camera meets on a laptop screen.
  const qr = qrcode(0, "M");
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();
  const quiet = 2; // modules of quiet zone — below 2 and some scanners refuse
  const extent = count + quiet * 2;

  // One path for every dark module. Kept as rects inside a single <path> so the
  // DOM stays small (a 37×37 code is ~700 modules).
  const segments: string[] = [];
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) {
        segments.push(`M${col + quiet} ${row + quiet}h1v1h-1z`);
      }
    }
  }

  return (
    <svg
      className="qr"
      width={size}
      height={size}
      viewBox={`0 0 ${extent} ${extent}`}
      role="img"
      aria-label="QR code for the room URL"
      shapeRendering="crispEdges"
    >
      <rect width={extent} height={extent} fill="#ffffff" />
      <path d={segments.join("")} fill="#0a2540" />
    </svg>
  );
}
