import type { Metadata } from "next";
import { PolicyPage } from "../../components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy | Living Memory Engine",
  description: "How Living Memory Engine handles hosted memory data.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage eyebrow="DATA PRACTICES" title="Privacy policy" updated="August 16, 2026">
      <p>
        Living Memory Engine (LME) stores information only when you ask it to remember something
        or use a feature that clearly requires stored memory. Do not submit passwords, one-time
        codes, payment-card data, government identifiers, health records, or other highly sensitive data.
      </p>
      <h2>Data we process</h2>
      <ul>
        <li>Memory text, optional tags and importance, and vector embeddings used for retrieval.</li>
        <li>Search queries used to find relevant memories.</li>
        <li>Exact handoff-note text, an optional label and declared sender, and expiry metadata.</li>
        <li>Authentication identifiers and email-address data needed to sign in and isolate accounts.</li>
        <li>A random access token that routes a hosted request to the correct isolated memory file.</li>
        <li>Network and service metadata needed for security, rate limiting, and troubleshooting.</li>
      </ul>
      <h2>Why we process it</h2>
      <p>
        We use this data to store, retrieve, show, and delete your memory; enforce access and abuse
        controls; operate the service; and investigate failures. We do not sell memory content or use
        it for advertising.
      </p>
      <h2>Service providers</h2>
      <p>
        Hosted memory text and search queries are sent to the Google Gemini API to create embeddings.
        Handoff notes are not embedded or sent to Google. Stytch processes sign-in and session data;
        RevenueCat processes a derived customer identifier and entitlement status; DigitalOcean hosts
        the service; and Cloudflare routes and protects traffic. These providers process only the data
        needed for their role. We will update this policy before changing these material processors.
      </p>
      <h2>Payments</h2>
      <p>
        Subscription checkout is operated by RevenueCat Web Billing with Stripe as the payment
        processor. Card details are entered on their checkout and go to Stripe — LME never receives
        or stores card numbers. RevenueCat and Stripe receive the derived customer identifier, your
        email address for receipts, and the transaction data needed to bill, renew, and refund the
        subscription.
      </p>
      <h2>Retention and deletion</h2>
      <p>
        A One Night Memory trial room stays available while it is used; a room left inactive for an
        extended period (currently about 21 days) is forgotten. When that happens, its access token is
        revoked and its memory file is deleted by the expiry cleanup process. Persistent hosted memory,
        where separately offered, remains until the user deletes matching memory through the forget tool
        or asks support to close the hosted memory. Handoff notes expire after the selected 1–72 hour
        period (24 hours by default) and are then deleted.
      </p>
      <h2 id="deleting">Deleting your world</h2>
      <p>
        If you are signed in, you can delete your world yourself, from the website, and it happens
        immediately. It removes your memories, your handoff mailbox, the record that connects your
        account to that world, and every key you have issued to an agent. We do not need to be asked,
        and there is no queue.
      </p>
      <p>
        Two things outlive that click, and we would rather name them than let you assume they
        don’t exist.
      </p>
      <p>
        <strong>Server backups — 7 days.</strong> Our host takes a daily backup of the whole machine.
        Your deleted world may sit inside one of those images until it expires, within 7 days. Those
        backups exist to recover the service from failure. Nobody can restore your world from them on
        request — not you, and not us.
      </p>
      <p>
        <strong>Embedding provider logs — 55 days.</strong> To make memories searchable we send their
        text to Google’s embedding API. Google retains what is sent for abuse monitoring for up to 55
        days under its paid API terms. That copy is outside our control, and deleting your world here
        does not reach into it.
      </p>
      <p>After those windows pass, nothing of your world remains anywhere we can reach.</p>
      <h2 id="what-we-can-see">What we can see</h2>
      <p>
        Your memories are stored as plain text on our server. They are not encrypted at rest, which
        means the operator of this service can read them. File permissions keep other users of the
        machine out; they do not keep out the person who administers it, and that person is Natthawut
        Phurahong.
      </p>
      <p>
        We are telling you this because you would find out eventually, and finding out later is worse
        than being told now. What we do with that ability: nothing routine. Memories are not read for
        analytics, not used for training, and not reviewed for quality. They are looked at only if you
        ask us to help with something specific, or if we are legally compelled.
      </p>
      <p>
        Your memory text does leave our server, once. To make a memory searchable it is sent — in
        full, unchanged — to Google’s embedding API (gemini-embedding-001), which returns a numeric
        representation we store alongside it. Your search queries are sent the same way, for the same
        reason. Handoff notes are not; they are stored and returned exactly as written, and never
        embedded.
      </p>
      <p>
        We use Google’s paid API tier, so its paid-service terms apply. We are not claiming your text
        is never retained there — Google keeps what is sent for abuse monitoring for up to 55 days.
        Nothing is ever sent to a chat or generative model; the only Google endpoint we call is the
        one that turns text into vectors.
      </p>
      <p>
        This is the same for the free rooms and for a paid world. There is no separate, more
        private path for paying customers, and we are not going to imply there is one.
      </p>
      <p>Memory text is never written to our application logs.</p>
      <p>
        If none of this is acceptable for what you want to store — and for some material it should
        not be — run the open-source server on your own machine instead. Nothing leaves it, and it is
        free.
      </p>
      <h2>Your controls</h2>
      <p>
        You can inspect stored memory with the state tool, delete matching episodic memory with the
        forget tool, or email <a href="mailto:support@viibe.to">support@viibe.to</a> to request
        access or deletion. The forget tool performs permanent substring-matched deletion and has no undo.
      </p>
      <h2>Questions</h2>
      <p>
        Living Memory Engine is operated by Natthawut Phurahong, its verified individual publisher.
        Contact <a href="mailto:support@viibe.to">support@viibe.to</a>. This policy applies to
        the hosted service; the local open-source server stores data on the machine where you run it.
      </p>
    </PolicyPage>
  );
}
