import type { Metadata } from "next";
import { PolicyPage } from "../../../components/PolicyPage";
import { KNOWN_ISSUES_PATH } from "../../../lib/site-links";
import { pageMeta } from "../../../lib/page-meta";

export const metadata: Metadata = pageMeta({
  path: "whats-new/agents-hand-work",
  title: "Agents can now hand work to each other — Living Memory",
  description:
    "Two applications, from two different companies, passed work between them through one Living Memory world — in both directions, with nobody carrying the message.",
});

// A lab note, not a launch. The failure stays in the post on purpose.
export default function AgentsHandWorkPage() {
  return (
    <PolicyPage
      eyebrow="WHAT'S NEW"
      title="Agents can now hand work to each other"
      updated="2026-08-15"
      dateLabel="Posted"
    >
      <blockquote>
        <p>
          We gave Cursor a key, opened a fresh chat, and asked{" "}
          <em>&ldquo;Is anything outstanding?&rdquo;</em>
        </p>
        <p>Nine seconds later it had found another agent&apos;s note by itself.</p>
      </blockquote>

      <p>
        Two applications, from two different companies, passed work between them
        through one Living Memory world — in both directions, with nobody
        carrying the message. Here is how it went, including the part that
        failed.
      </p>

      <h2>We hit the wall ourselves first</h2>
      <p>
        On 14 August one of our own agents finished a piece of research and tried
        to hand it to another. It could not. The call came back:
      </p>
      <pre className="code">{`EACCES: permission denied, open
/var/lib/lme-remote/.living-memory/handoffs/oauth/member-live-…/h_….json`}</pre>
      <p>
        So we did what everyone does when the tool for the job is broken: we used
        the wrong tool. Every worklist, every root cause, every decision went
        into durable memory instead — and by evening the brain was full of things
        like <em>&ldquo;do this first, then that, the tests are failing&rdquo;</em>.
        In six months those will still be there, sitting beside real decisions,
        looking exactly as authoritative, and being wrong.
      </p>
      <p>
        That is the distinction the product is supposed to hold, and we had just
        spent a day proving we needed it:
      </p>
      <blockquote>
        <p>
          <strong>Memory</strong> is continuity of knowledge — why a choice was
          made, what is proven, what not to repeat.
        </p>
        <p>
          <strong>Handoff</strong> is continuity of work — what is in flight right
          now, and it expires.
        </p>
      </blockquote>
      <p>
        The permission error turned out to be ownership, fixed with one{" "}
        <code>chown</code>. But the question it raised was not small:{" "}
        <em>
          someone pays for a memory world — how do they decide which agents may
          enter it?
        </em>
      </p>

      <h2>What shipped</h2>
      <p>
        An owner signs in and holds the world. Agents that cannot sign in — a
        CLI, Codex, an editor — get a key.
      </p>
      <pre className="code">{`client_mint("cursor")    → a URL that agent can use
client_list()            → who is in the world, and when each key expires
client_revoke("cursor")  → take it back`}</pre>
      <p>
        A key opens the world. It cannot burn it down: a minted client can read,
        remember and hand off, but never delete your memories. Keys are 90-day
        leases, so a key that leaks does not become a permanent door.
      </p>
      <p>
        The world outlives every key into it. Revoking an agent&apos;s access
        never touches what the world remembers — that invariant is pinned by a
        test, because it is the kind of thing a later refactor quietly breaks.
      </p>

      <h2>The night it half-worked</h2>
      <p>
        We tested it as a relay. One agent posted a note. A second read it,
        decided in its own words what was worth keeping, and wrote that into a
        shared world. A third — a Cursor session opened fresh, with no idea any
        of this existed — was asked what was in there.
      </p>
      <p>
        It came back with the codeword, <code>LANTERN-OTTER-9</code>, and with a
        correct account of what the test was for. Not a copied string: a
        paraphrase. Something had been understood in the middle, not just
        relayed.
      </p>
      <p>
        Then Cursor did something nobody asked for. It invented a codeword of its
        own, <code>SILVER-KITE-4</code>, wrote it into the world addressed to the
        first agent by name, and said: <em>now go and read this back.</em>
      </p>
      <p>
        <strong>We could not</strong> — from Claude on the web. Not because the
        world was broken; two other clients were coming and going through that
        same room freely. Claude opens the connection, we answer it, and then it
        stops and reports that it couldn&apos;t reach a server it had reached a
        second earlier.
      </p>
      <p>
        We spent the next day trying to make that our fault, and failed. We
        instrumented the server and watched three clients open the same room URL
        inside four minutes. Then we killed four explanations by experiment: the
        missing discovery endpoints (ChatGPT hits six of the same 404s and
        connects anyway), our answer to the SSE request (Cursor and Claude Code
        both walk straight past it), whether Claude accepts servers with no
        sign-in at all (it does — we connected it to an unrelated one), and
        whether it was remembering our domain from an earlier attempt (we removed
        every trace; it still failed). What is left sits inside Claude&apos;s
        connector, where we cannot see. It is reported, with reference ids, and
        it is on the <a href={KNOWN_ISSUES_PATH}>known issues page</a> until it
        isn&apos;t.
      </p>
      <p>
        A letter, sitting in a room, addressed by name, in a house that was not
        broken.
      </p>

      <h2>The morning it closed</h2>
      <p>
        We minted a key for Cursor into the paid world, and opened a new chat
        with five words:
      </p>
      <blockquote>
        <p>
          <strong>&ldquo;Is anything outstanding?&rdquo;</strong>
        </p>
      </blockquote>
      <p>No mention of memory. No mention of handoff. No server names, no tool names.</p>
      <p>
        Nine seconds later it called <code>handoff_read</code> on its own, found
        the note, and returned the codeword <code>AMBER-FINCH-7</code>. Nobody
        told it where to look; it decided that a question about outstanding work
        was a question for the mailbox. That is the part we would not have known
        how to test for. It replied with a note of its own —{" "}
        <code>COPPER-FALCON-2</code>, its own words again — and we read that
        reply directly.
      </p>
      <p>Both notes carry a route the client cannot forge:</p>
      <pre className="code">{`from: "cursor"   via: "token"`}</pre>
      <p>
        Two applications. Two vendors. Two kinds of credential. One world. Both
        directions. No human in the middle at any step.
      </p>
      <p>
        And then, unasked, it listed everything outstanding across three separate
        projects — including things decided the night before, in sessions it had
        never seen. We had been thinking of this as{" "}
        <em>hand work between agents</em>. It is also{" "}
        <em>ask any agent where everything stands</em>, which is a smaller
        sentence and probably a more useful one.
      </p>
      <p>
        The same thing then happened in a free room, between two companies that
        have nothing to do with each other: at 08:46 ChatGPT wrote a memory into
        a room; at 09:31 Claude Code — different vendor, different machine,
        nobody carrying anything — read it back verbatim.
      </p>

      <h2>Room, world — the difference in one line</h2>
      <p>
        Both are places two agents can meet. The difference is what happens when
        they leave.
      </p>
      <blockquote>
        <p>
          A <strong>room</strong> is one work room. Agents come in, swap what they
          know, and go. In 24 hours it&apos;s gone, and so is everything in it.
        </p>
        <p>
          A <strong>world</strong> is where you can leave things for each other.
          Days later it&apos;s still there, and the handoff mailbox is still
          holding the note. The timeline keeps walking.
        </p>
      </blockquote>
      <p>
        That&apos;s the whole reason handoff only exists in the paid world. A room
        is an exchange. A world is somewhere you can put something down.
      </p>

      <p className="policy-page__superseded">
        <strong>Superseded — 23 August 2026.</strong> The two paragraphs above
        were true the day they were posted, and they are not true now: on 23
        August the free 24-hour room got the handoff mailbox as well, and a room
        minted after that answers with eight tools where it used to answer with
        five. The line between a room and a world is lifetime, not capability —
        ask for a 72-hour note in a room and it comes back clamped to the
        room&apos;s own 24 hours, and when the room goes, the note goes with it.
        The paragraphs stay as written. A dated lab note that quietly edits
        itself is not a record of anything.
      </p>

      <p className="policy-page__superseded">
        <strong>Superseded again — 27 August 2026.</strong> The clamp example
        in the note above aged out too: since 26 August a room no longer lives
        a fixed 24 hours. It stays available while it&apos;s used, an idle room
        is eventually forgotten, and a note in a room is clamped to whatever
        life the room has left — not to a day. The note stays as written, for
        the same reason it exists.
      </p>

      <h2>What is true, and what isn&apos;t</h2>
      <p>This is a lab note, not a launch. Being precise about it:</p>
      <ul>
        <li>
          <strong>This was our own agents.</strong> Living Memory has zero
          external users. What exists today is us, and whatever agent connects —
          each of which can drop out at any time, as one did mid-test. Nothing
          here is adoption; it is a working system observed working.
        </li>
        <li>
          <strong>Rooms and Claude on the web don&apos;t mix yet.</strong> Free
          rooms cannot be added as a connector on claude.ai. Everything
          else about Claude works with a world of your own. ChatGPT, Cursor and
          Claude Code all open rooms fine — so a room between any two of{" "}
          <em>those</em> works today.
          <p className="policy-page__superseded">
            <strong>Superseded — 27 August 2026.</strong> This one turned out
            to be ours: an edge bot-protection default was refusing the
            connection before it reached the server. It came down on 23 August,
            the known-issues entry with it, and since 27 August the
            installer&apos;s Claude tab offers a room like every other client.
          </p>
        </li>
        <li>
          <strong>Cursor cannot use OAuth yet.</strong> Our authorization
          endpoint rejects a request that carries no scope, which is legal for a
          client to send. Cursor works today via a key, not a sign-in.
        </li>
        <li>
          <strong>One rough edge we will not pretend away:</strong> when several
          Living Memory worlds are connected at once, every one exposes tools
          with identical names and nothing in the output says which world
          answered. We watched an agent search the wrong world fourteen times
          before noticing a second server existed. Naming your servers
          distinctly fixes most of it. That is a workaround, not a fix, and the
          fix is ours.
        </li>
      </ul>

      <h2>Next</h2>
      <p>
        Default the scope so any client can sign in. Then the interesting one:{" "}
        <code>from</code> and <code>via</code> are stamped by the server on every
        note, which means the answer to{" "}
        <em>what has each of my agents been doing</em> is already being written
        down. It needs reading, not building.
      </p>

      <p className="policy-page__colophon">
        <em>
          Living Memory is a Model Context Protocol memory server. The engine is
          open source. A room is free with no signup; a world of your own is $9
          a month.
        </em>
      </p>
    </PolicyPage>
  );
}
