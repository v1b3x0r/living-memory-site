import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { BASE_PATH } from "../lib/base-path.ts";

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

async function render(headers = {}, pathname = `${BASE_PATH}/`) {
  const worker = await loadWorker();

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", ...headers },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

/** Every internal href the shipped pages point at. */
function internalLinks(html) {
  const found = new Set();
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (href.startsWith(BASE_PATH)) found.add(href.split("#")[0]);
  }
  return [...found];
}

test("renders public privacy, terms, and support routes", async () => {
  const home = await (await render()).text();
  for (const route of ["privacy", "terms", "support"])
    assert.match(home, new RegExp(`href="${BASE_PATH}/${route}/"`));

  const privacy = await (await render({}, `${BASE_PATH}/privacy/`)).text();
  assert.match(privacy, /Privacy policy/);
  assert.match(privacy, /Google Gemini API/);
  assert.match(privacy, /operated by Natthawut Phurahong/);
  assert.match(privacy, /left inactive for an extended period \(currently about 21 days\)/);
  assert.match(privacy, /Handoff notes are not embedded or sent to Google/);
  assert.match(privacy, /Stytch processes sign-in and session data/);
  assert.match(privacy, /RevenueCat processes a derived customer identifier/);
  assert.match(privacy, /24 hours by default/);

  const terms = await (await render({}, `${BASE_PATH}/terms/`)).text();
  assert.match(terms, /Terms of use/);
  assert.match(terms, /short-lived handoff notes/);

  const support = await (await render({}, `${BASE_PATH}/support/`)).text();
  assert.match(support, /Human support/i);
  assert.match(support, /support@viibe\.to/);
});

test("ships the world scene as a direct compressed hero asset", async () => {
  const pageHtml = await (await render()).text();
  const art = await readFile(
    new URL("../public/brand/lme-world-table.webp", import.meta.url),
  );

  assert.match(
    pageHtml,
    new RegExp(`src="${BASE_PATH}/brand/lme-world-table\\.webp"`),
  );
  assert.doesNotMatch(pageHtml, /_next\/image[^"]*lme-world/);
  // 250 KB, not the old 150: the table scene is dense watercolor edge to edge
  // (the old asset was ~40% flat paper and compressed accordingly). Phones
  // still load the 97 KB tall crop, not this.
  assert.ok(art.byteLength < 250_000, "hero art should stay below 250 KB");
});

test("keeps the worker image optimizer compatible with Next image URLs", async () => {
  const observed = { assetPath: null, width: null, format: null };
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/_next/image?url=%2Fbrand%2Flme-whale.png&w=640&q=75", {
      headers: { accept: "image/webp" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          observed.assetPath = new URL(request.url).pathname;
          return new Response(new Uint8Array([137, 80, 78, 71]), {
            headers: { "content-type": "image/png" },
          });
        },
      },
      IMAGES: {
        input: () => ({
          transform: ({ width }) => {
            observed.width = width;
            return {
              output: async ({ format }) => {
                observed.format = format;
                return {
                  response: () =>
                    new Response("optimized", {
                      headers: { "content-type": format },
                    }),
                };
              },
            };
          },
        }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.equal(observed.assetPath, "/brand/lme-whale.png");
  assert.equal(typeof observed.width, "number");
  assert.equal(observed.format, "image/webp");
});

test("derives absolute social image URLs from the request host", async () => {
  const response = await render({
    "x-forwarded-proto": "https",
    "x-forwarded-host": "preview.example.test",
  });
  const html = await response.text();
  assert.match(
    html,
    new RegExp(
      `property="og:image"[^>]+https://preview\\.example\\.test${BASE_PATH}/og\\.jpg`,
    ),
  );
  assert.match(
    html,
    new RegExp(
      `name="twitter:image"[^>]+https://preview\\.example\\.test${BASE_PATH}/og\\.jpg`,
    ),
  );
});

test("rejects untrusted forwarded origins in social metadata", async () => {
  const response = await render({
    "x-forwarded-proto": "javascript",
    "x-forwarded-host": "preview.example.test/@attacker",
  });
  const html = await response.text();
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /@attacker/i);
});

test("opens with one memory the agents share", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(
    html,
    /<title>Living Memory — One world\. You and your agents come and go\.<\/title>/i,
  );
  assert.match(html, /One world\. You and your agents come and go\./);
  assert.match(html, /Across models, devices, and apps\./);
  assert.match(html, /Tell one agent something today\./);
  assert.match(html, /Ask a different one about it tomorrow\./);
  assert.match(html, /Open a room — free/);
  assert.match(html, /No signup\. No credit card\./);

  // The mental-model bridge: present, its three locked beats verbatim. The
  // ORDER argument changed with WS2 (2026-08-26): the room creator leads —
  // nothing stands between a visitor and a room — and the proof and bridge
  // follow as reasons to stay, not gates to entry.
  assert.match(html, /How a world works/);
  assert.match(html, /You create a world and start working\./);
  assert.match(html, /Let an agent into the same world\./);
  assert.match(html, /Agents come and go\. The work stays\./);
  const proofAt = html.indexOf("What happened on 15 August");
  const bridgeAt = html.indexOf("How a world works");
  const installerAt = html.indexOf("1 · The installer");
  assert.ok(
    installerAt !== -1 && installerAt < proofAt && proofAt < bridgeAt,
    "the room creator must lead; proof then bridge follow it",
  );
  assert.match(
    html,
    /One world, many agents · Private by default · Open source engine/,
  );
});

test("gives a phone a menu, and both sizes a way to sign in", async () => {
  const html = await (await render()).text();

  // A paying visitor could not find the way back in on a phone: the inline nav
  // wrapped and there was no account entry anywhere.
  assert.match(html, /<details class="nav-menu">/);
  assert.match(html, /Sign in — your world/);
  assert.match(html, new RegExp(`href="${BASE_PATH}/keep/">Sign in<`));
  // The menu opens without JavaScript, so it works before hydration.
  assert.match(html, /<summary aria-label="Menu">/);
});

test("shows what happened on 15 August without printing a room id", async () => {
  const html = await (await render()).text();

  assert.match(html, /What happened on 15 August/);
  // Every row is one event with a real clock time, and each actor is marked as
  // its own application — that they are different vendors is the whole claim.
  for (const [time, actor] of [
    ["00:07", "Cursor"],
    ["07:01", "Cursor"],
    ["08:46", "ChatGPT"],
    ["09:31", "Claude Code"],
  ]) {
    assert.match(
      html,
      new RegExp(`${time}</time><span class="pill">${actor}</span>`),
      `${actor} should be a pill on the ${time} row`,
    );
  }
  assert.match(html, /wrote a memory into a room\./);
  assert.match(html, /read it back, word for word\./);
  assert.match(html, /nine seconds after a five-word question\./);
  assert.match(html, /Different vendor, different machine\./);
  // Nothing on this list that we have not actually run.
  for (const untested of ["Codex", "Hermes", "OpenClaw"])
    assert.doesNotMatch(html, new RegExp(`pill">${untested}`), untested);
  assert.match(html, /You didn&#x27;t copy anything\.|You didn't copy anything\./);
  assert.match(html, /A session is just a window into it\./);
  assert.match(html, new RegExp(`href="${BASE_PATH}/whats-new/agents-hand-work/"`));
});

test("never bakes a room into the markup", async () => {
  const html = await (await render()).text();

  // A real room id is minted client-side after the click. The only room-shaped
  // string allowed in the document is the <token> placeholder.
  assert.doesNotMatch(html, /\/t\/ons_[0-9a-f]+\/mcp/);
  assert.match(html, /Room URL appears here after you click\./);
});

test("keeps steps 1 and 3 identical for every client, and warns about the two rails", async () => {
  const html = await (await render()).text();

  assert.match(html, /1 · The installer|>1<\/span>/);
  assert.match(html, /Open a room/);
  assert.match(html, /No signup\. Free, and it stays while you use it\./);
  assert.match(html, /Now do it again — in a second app/);
  assert.match(html, /That is the whole product\./);
  assert.match(
    html,
    /First app remembers\. Second app recalls\. Same world\./,
  );
  assert.match(html, /Cloud and Local are different worlds\. They do not sync\./);
  assert.match(
    html,
    /Free rooms stay while they&#x27;re used\.|Free rooms stay while they're used\./,
  );
  assert.match(
    html,
    /Inactive rooms are eventually forgotten, and cannot be migrated to a paid world\./,
  );
  // Every client tab is reachable, and each server is named distinctly.
  for (const tab of ["ChatGPT", "Cursor", "Claude Code", "Any MCP client"])
    assert.match(html, new RegExp(tab));
  assert.match(html, /lm-room/);
});

test("gives the page its most air to the reason not to buy", async () => {
  const html = await (await render()).text();

  assert.match(html, /You probably don&#x27;t need this yet\.|You probably don't need this yet\./);
  assert.match(
    html,
    /If you only use one AI assistant in one app on one machine, you already have enough memory\./,
  );
  assert.match(html, /Buy this when 2\+ agents and 2\+ apps start to collide\./);
  assert.match(
    html,
    /If you&#x27;re not tired of re-briefing, don&#x27;t buy this\.|If you're not tired of re-briefing, don't buy this\./,
  );
});

test("prices a room and a world as different kinds of thing", async () => {
  const html = await (await render()).text();

  assert.match(html, /Room \(free\)/);
  assert.match(html, /\$0/);
  assert.match(html, /Lasts while you use it\./);
  assert.match(html, /World \(paid\)/);
  assert.match(html, /\$9 \/ month/);
  assert.match(html, /A place to put things down\./);
  assert.match(html, /Handoff notes last up to 72 hours\./);
  assert.match(html, /Create your world — \$9 \/ month/);
  assert.match(html, new RegExp(`href="${BASE_PATH}/keep/"`));
  assert.match(html, /A key opens the world; it cannot burn it down\./);

  // There is no multi-world plan, and the paid tier is never called a room.
  assert.doesNotMatch(html, /per world/i);
  assert.doesNotMatch(html, /your own room/i);

  // What you buy is lifetime, not capability (2026-08-23: free rooms got the
  // handoff mailbox). The paid tier selling handoff as its own is the exact
  // regression this pins, and it shipped as copy once already.
  //
  // Scoped to the pricing section on purpose. The ticker in the layout prints
  // changelog titles onto every page, so asserting this against the whole
  // document would also ban the phrase from any future entry title — including
  // a correct one like "Handoff across agents, now in a free room". That red
  // would point at pricing while the cause sat in the changelog.
  const pricingSection = html.slice(
    html.indexOf('id="pricing"'),
    html.indexOf("</section>", html.indexOf('id="pricing"')),
  );
  assert.doesNotMatch(pricingSection, /Handoff across agents/i);
});

test("compares the tiers row by row, in a real table", async () => {
  const html = await (await render()).text();

  // A real table, not a grid of divs: developers scan these with a screen
  // reader, a find-in-page and a mouse, and only one of those works on divs.
  assert.match(html, /<table/);
  assert.match(html, /<th scope="col"/);
  assert.match(html, /<th scope="row"/);

  // Lifetime leads, because after free rooms got handoff it is the whole
  // distinction. Everything the two tiers share comes after it.
  const rowOrder = [
    "How long it lasts",
    "A handoff note can live",
    "Memory — add, search, state, forget",
    "Handoff between agents",
    "Keys for agents that can't sign in",
    "Who can get in",
    "Use it for",
  ];
  // React escapes an apostrophe in markup but leaves it raw inside the flight
  // payload further down the document, so a label like "…that can't sign in"
  // first matches the payload and reads as out of order. Decode before
  // scanning, or this test reports a row-order bug that is really an entity.
  const text = html.replace(/&#x27;|&#39;/g, "'");
  let cursor = -1;
  for (const label of rowOrder) {
    const at = text.indexOf(label);
    assert.ok(at > cursor, `row out of order or missing: ${label}`);
    cursor = at;
  }

  // Access is stated as who reaches the place, not as a sign-in step. Both
  // halves are facts; this half does not read as a cost the paid tier adds.
  assert.match(html, /Anyone with the link/);
  assert.match(html, /You, plus the keys you mint/);
  assert.doesNotMatch(html, /Sign-in required/i);

  // The live-note caps (8 per room, 32 per world) are deliberately absent:
  // the 32 has never been observed in production, and a comparison row with
  // one proven half is worse than no row.
  assert.doesNotMatch(html, /32 notes/i);
});

test("says on the landing page what does not work", async () => {
  const html = await (await render()).text();

  assert.match(html, /Known issues/);
  // Nothing is broken right now, and the strip must not claim otherwise —
  // the last entry (Claude web + rooms) resolved 2026-08-23.
  assert.match(html, /Nothing open right now\./);
  assert.match(html, /resolved on 2026-08-23/);
  assert.doesNotMatch(html, /cannot open a room/i);
  assert.match(html, /support@viibe\.to/);
  assert.match(html, new RegExp(`href="${BASE_PATH}/known-issues/"`));
  // The mockup's placeholder address is not a decision.
  assert.doesNotMatch(html, /example\.com/);
  // support@viibe.to works because Cloudflare Email Routing forwards it and the
  // catch-all is OFF: any other @viibe.to address on this page would bounce.
  assert.doesNotMatch(html, /getsquish\.app/);
});

test("ships no unshipped promises and no live room id anywhere", async () => {
  const routes = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/known-issues/`,
    `${BASE_PATH}/whats-new/agents-hand-work/`,
  ];

  for (const route of routes) {
    const html = await (await render({}, route)).text();
    // "COMING SOON" is the sin, not the word "coming" — the write-up says
    // clients were "coming and going", which is a report, not a promise.
    assert.doesNotMatch(html, /coming soon|COMING NEXT/i, route);
    assert.doesNotMatch(html, /example\.com/, route);
    assert.doesNotMatch(html, /room 67c/i, route);
  }
});

test("every internal link in the shipped pages resolves", async () => {
  const routes = [
    `${BASE_PATH}/`,
    `${BASE_PATH}/known-issues/`,
    `${BASE_PATH}/whats-new/agents-hand-work/`,
    `${BASE_PATH}/keep/`,
  ];
  const targets = new Set();

  for (const route of routes)
    for (const href of internalLinks(await (await render({}, route)).text()))
      targets.add(href);

  // Only page routes go through the router; files (a stylesheet, SKILL.md,
  // llms.txt) come from ASSETS, which this harness stubs out as 404.
  const served = [...targets].filter(
    (href) => !href.startsWith(`${BASE_PATH}/_next/`) && !/\.[a-z0-9]+$/i.test(href.replace(/\/$/, "")),
  );
  assert.ok(served.length >= 7, `expected internal links, got ${served.length}`);

  for (const href of served) {
    const response = await render({}, href);
    assert.equal(response.status, 200, `${href} did not resolve`);
  }
});

test("known issues admits when nothing is broken, with dates", async () => {
  const html = await (await render({}, `${BASE_PATH}/known-issues/`)).text();

  assert.match(html, /Known issues/);
  assert.match(html, /Nothing is on this page right now/);
  assert.match(html, /Posted 2026-08-15 · Resolved 2026-08-23/);
  // The resolved note must not read as a live limitation.
  assert.doesNotMatch(html, /cannot open a One Night room/);
  assert.match(html, /maintained by hand, not generated/);
});

test("the write-up keeps the failure in", async () => {
  const html = await (await render({}, `${BASE_PATH}/whats-new/agents-hand-work/`)).text();

  assert.match(html, /Agents can now hand work to each other/);
  assert.match(html, /EACCES: permission denied/);
  assert.match(html, /LANTERN-OTTER-9/);
  assert.match(html, /AMBER-FINCH-7/);
  assert.match(html, /This is a lab note, not a launch\./);
  assert.match(html, /Living Memory has zero\s+external users\./);
  assert.match(html, new RegExp(`href="${BASE_PATH}/known-issues/"`));
});

test("gives agents the same operating guide through llms.txt", async () => {
  const response = await render({}, "/llms.txt");
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(
    body,
    /https:\/\/viibe\.to\/living-memory\/skills\/living-memory\/SKILL\.md/,
  );
  assert.match(body, /fresh session or client/i);
  assert.match(body, /same-session readback/i);
  // Payment truth: self-serve at /keep, agents must not push purchase or
  // promise ONS→paid migration.
  assert.match(body, /\$9\/month/);
  assert.match(body, /living-memory\/keep/);
  assert.match(body, /do not push purchase/i);
  assert.match(body, /do NOT migrate/);
});

test("a one-tap feedback box sits where people get stuck, and stays quiet on the landing", async () => {
  // Full card on /support — the destination every "tell us" link points at.
  const support = await (await render({}, `${BASE_PATH}/support/`)).text();
  assert.match(support, /data-c="FeedbackBox"/);
  assert.match(support, /Something failed/);
  assert.match(support, /One tap is enough/);

  // Unobtrusive opener on the landing: a passer-by sees one quiet line,
  // never the full card.
  const landing = await (await render({}, `${BASE_PATH}/`)).text();
  assert.match(landing, /Something broke\? Tell us/);
  assert.doesNotMatch(landing, /One tap is enough/);
});

test("tells agents plainly that the only sign-in is Living Memory (/auth.md + api-catalog)", async () => {
  const auth = await render({}, "/auth.md");
  const authBody = await auth.text();
  assert.equal(auth.status, 200);
  assert.match(auth.headers.get("content-type"), /text\/markdown/);
  assert.match(authBody, /no\s+site-wide account and no\s+umbrella login/i);
  assert.match(authBody, /dynamic client registration/);
  assert.match(authBody, /401 with a\s+WWW-Authenticate/);
  assert.match(authBody, /lme\.viibe\.to\/ons\/new/);
  // The purchase boundary llms.txt holds also holds here.
  assert.match(authBody, /must not push\s+the purchase/i);

  const cat = await render({}, "/.well-known/api-catalog");
  assert.equal(cat.status, 200);
  assert.match(cat.headers.get("content-type"), /linkset\+json/);
  const linkset = JSON.parse(await cat.text());
  assert.equal(linkset.linkset[0].anchor, "https://lme.viibe.to/mcp");
});

test("publishes a security contact through /.well-known/security.txt", async () => {
  const response = await render({}, "/.well-known/security.txt");
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /text\/plain/);
  assert.match(body, /Contact: mailto:support@viibe\.to/);
  // RFC 9116 requires Expires, and it must still be in the future — a stale
  // date reads as an unmaintained security contact.
  const expires = body.match(/Expires: (.+)/)?.[1];
  assert.ok(expires, "security.txt is missing its Expires line");
  assert.ok(new Date(expires).getTime() > Date.now(), "security.txt Expires is in the past");
  assert.match(body, /Canonical: https:\/\/viibe\.to\/\.well-known\/security\.txt/);
});

test("every shipped page carries its own share card and a canonical that does not redirect", async () => {
  const pages = [
    { path: `${BASE_PATH}/`, title: "Living Memory — One world. You and your agents come and go." },
    { path: `${BASE_PATH}/known-issues/`, title: "Known issues — Living Memory" },
    {
      path: `${BASE_PATH}/whats-new/agents-hand-work/`,
      title: "Agents can now hand work to each other — Living Memory",
    },
  ];

  for (const page of pages) {
    const response = await render({}, page.path);
    assert.equal(response.status, 200, `${page.path} should be the final URL`);
    const html = await response.text();

    const meta = (property) =>
      html.match(
        new RegExp(`<meta property="${property}" content="([^"]*)"`),
      )?.[1];
    const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];

    // A share of any page must describe THAT page — sub-pages used to inherit
    // the landing card, so /known-issues advertised the landing page instead.
    assert.equal(meta("og:title"), page.title, `og:title on ${page.path}`);
    assert.ok((meta("og:description") ?? "").length > 40, `og:description on ${page.path}`);
    assert.match(meta("og:image") ?? "", /\/og\.jpg$/, `og:image on ${page.path}`);
    assert.match(html, /name="twitter:card" content="summary_large_image"/);

    // Canonical and og:url are the frozen URL every registry hardcodes: one
    // origin, and a trailing slash, so nothing points at a redirect.
    for (const [label, value] of [["og:url", meta("og:url")], ["canonical", canonical]]) {
      assert.equal(value, `https://viibe.to${page.path}`, `${label} on ${page.path}`);
      assert.ok(value?.endsWith("/"), `${label} must end in a slash`);
    }
  }
});

test("the bare landing path redirects to the canonical one, permanently", async () => {
  const response = await render({}, BASE_PATH);
  assert.equal(response.status, 301);
  assert.match(response.headers.get("location") ?? "", new RegExp(`${BASE_PATH}/$`));
});

test("llms.txt states the tool surface that actually ships", async () => {
  const body = await (await render({}, "/llms.txt")).text();

  assert.match(body, /eleven tools/);
  for (const tool of ["client_mint", "client_list", "client_revoke", "world_list", "handoff_list"])
    assert.match(body, new RegExp(tool), tool);
  assert.doesNotMatch(body, /six tools/);
  // The vocabulary, the limitation, and the adoption fact all have to be here:
  // a crawler often reads this file and nothing else.
  assert.match(body, /A \*\*room\*\* is the free instance/);
  assert.match(body, /A \*\*world\*\* is the same place that does not end/);
  // The 2026-08-22 rule, pinned in BOTH directions. The positive alone would have
  // passed while three separate sentences elsewhere in this same file still said
  // handoff is what makes a world — which is how an agent ends up with contradictory
  // guidance from one document. The negative is the half that catches a stale copy.
  assert.match(body, /The difference is lifetime, not\ncapability/);
  assert.match(body, /Handoff is NOT a paid feature/);
  assert.doesNotMatch(body, /handoff is what\nmakes that true/);
  assert.doesNotMatch(body, /where handoff and minted client keys exist/);
  assert.doesNotMatch(body, /no handoff/);
  // Flipped 2026-08-27 (A159 shipped): the limitation came down, and the
  // negative guard keeps the stale sentence from riding back in.
  assert.doesNotMatch(body, /cannot currently add a trial room/);
  assert.match(body, /came down on 2026-08-23/);
  assert.match(body, /no external users as of 2026-08-15/);
});
