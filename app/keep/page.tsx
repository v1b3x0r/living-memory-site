"use client";
// /keep — the Living Memory checkout page.
//
// Headless Stytch flow (same pattern as app/oauth/login/page.tsx — the prebuilt
// <StytchB2B> UI crashes under this React runtime, so no Stytch component
// renders anything here). Storefront contract (audit 2026-08-13):
//   - plan, price, and recurrence are visible BEFORE email/purchase;
//   - the signed-in state shows the human's email, never the internal
//     RevenueCat customer id (kept behind ?debug=1 for parity checks);
//   - ?purchased=1 renders a truthful activation-pending state — the query
//     string is never treated as proof of entitlement (the server gate stays
//     the only authority).
import { useEffect, useState } from "react";
import {
  useStytchB2BClient,
  useStytchMember,
  useStytchMemberSession,
} from "@stytch/react/b2b";
import { BASE_PATH } from "../../lib/base-path";
import { rcUserIdFromSub } from "../../lib/rc-user-id";
import { keepCheckoutUrl } from "../../lib/billing";
import {
  AGENT_GUIDE_PATH,
  HOSTED_MCP_URL,
  SERVER_NAMES,
} from "../../lib/install-copy";
import { CopyButton } from "../../components/CopyButton";
import { LmeMark } from "../../components/LmeMark";
import { AuthAvatar } from "../../components/AuthAvatar";
import { DeleteWorld } from "../../components/DeleteWorld";
import { fetchWorldStatus, type Billing, type WorldStatus } from "../../lib/world-status";
import {
  GitHubMark,
  GoogleMark,
  type OAuthProvider,
} from "../../components/ProviderMarks";
import { identify, track } from "../../lib/telemetry";

const SESSION_MINUTES = 60;

// Waiting out RevenueCat activation after checkout: about 75 seconds of looking,
// which covers the "up to a minute" the page promises with room to spare, then
// we stop rather than poll a customer's browser indefinitely.
const ACTIVATION_POLL_MS = 5_000;
const ACTIVATION_ATTEMPTS = 15;

// A discovery token is single-use: guard against double effect invocation.
let authenticateStarted = false;

type Phase = "form" | "sending" | "sent" | "authenticating" | "error";

function PlanSummary() {
  return (
    <aside className="keep-plan" aria-labelledby="keep-plan-title">
      <p className="eyebrow" id="keep-plan-title">
        LIVING MEMORY · $9/MONTH
      </p>
      <ul>
        <li>A persistent memory world tied to your email</li>
        <li>Six memory tools + a private handoff bus between your agents</li>
        <li>Recurring monthly billing · cancel anytime — access runs to the end
          of the paid period</li>
      </ul>
      <p className="keep-plan__trust">
        Payment is handled by RevenueCat and Stripe — your card details never
        reach LME. <a href={`${BASE_PATH}/terms#billing`}>Billing terms</a> ·{" "}
        <a href={`${BASE_PATH}/support#billing`}>Cancellation &amp; support</a>
      </p>
    </aside>
  );
}

/**
 * The billing panel — the answer to six questions a paying human should never
 * have to email anyone to ask: am I paying, how much, when again, where are my
 * receipts, how do I change payment, and how do I stop.
 *
 * Only the last three need a destination, and RevenueCat already hosts one, so
 * this renders facts plus a link rather than a billing system of our own.
 *
 * THE FALLBACK IS THE OLD WORDING, NOT AN EMPTY BOX. `billing` is null for a
 * comped world and for an unreachable RevenueCat alike, and in both cases the
 * receipt-email sentence that shipped before this panel is still true. Degrade
 * to yesterday's behaviour; never to a blank panel or a dead button.
 */
function BillingPanel({ billing }: { billing: Billing | null }) {
  // A world that was granted rather than bought has no renewal, no next
  // payment, and nothing to cancel — and RevenueCat still reports it with the
  // vocabulary of a paid plan (the founder's own grant carries will_not_renew).
  // Rendered as-is, the page tells someone who never paid that they are
  // "cancelled", which is the most alarming sentence it is capable of.
  const purchased = billing?.store === "rc_billing";
  const renews = purchased && billing?.autoRenews === true;
  // The third state. RevenueCat's renewal vocabulary is open-ended, so the
  // server reports an unrecognised value as null rather than as "will not
  // renew" — and the page has to stay quiet about renewal instead of picking
  // one of the two confident sentences. Saying nothing is the correct answer
  // when we do not know; the portal below always knows.
  const renewalUnknown = purchased && billing?.autoRenews == null;
  // Rendered in the reader's own locale and timezone: this date is the day
  // money moves, and an ISO string in UTC is not a date most people can act on.
  const until = billing?.currentPeriodEndsAt
    ? new Date(billing.currentPeriodEndsAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section className="keep-billing" aria-labelledby="keep-billing-title">
      <h2 id="keep-billing-title">Billing</h2>
      {billing ? (
        <>
          <dl className="keep-billing__facts">
            <div>
              <dt>Plan</dt>
              <dd>
                {purchased
                  ? "Living Memory — a world of your own, $9 / month"
                  : "Living Memory — a world of your own, granted"}
              </dd>
            </div>
            <div>
              <dt>Status</dt>
              {/* "Cancelled" has to say what the customer still HAS, or the
                  word reads as "your world is gone" — which it is not. */}
              <dd>
                {!purchased
                  ? "Granted — not a paid subscription"
                  : renewalUnknown
                    ? "Active — open your payment page below for what happens next"
                    : renews
                      ? "Active — renews automatically"
                      : "Cancelled — your access runs to the end of the paid period"}
              </dd>
            </div>
            {until && (
              <div>
                <dt>
                  {renews
                    ? "Next payment"
                    : renewalUnknown
                      ? "Current period ends"
                      : "Access until"}
                </dt>
                <dd>{until}</dd>
              </div>
            )}
          </dl>
          {billing.managementUrl ? (
            <>
              <a
                className="button button--secondary"
                href={billing.managementUrl}
                onClick={() => track("billing_portal_opened")}
              >
                Manage or cancel subscription →
              </a>
              <p className="keep-billing__fine">
                Opens RevenueCat, our payment provider. It emails you a sign-in
                link first to check it is you; after that you can see past
                payments, download receipts, change your card, or cancel.
                Cancelling stops the billing. It does not delete your world.
              </p>
              {/* The statement line, next to the card question rather than buried
                  in the terms: an unrecognised name on a bank statement is how a
                  chargeback starts, and the customer is the one who has to
                  recognise it months later. */}
              <p className="keep-billing__fine">
                Charges appear on your statement as <strong>LIVING-MEMORY</strong>.
              </p>
            </>
          ) : (
            // A world granted rather than bought has no Stripe subscription and
            // so no portal. Saying so beats a button that goes nowhere.
            <p className="keep-billing__fine">
              There is no payment page for this world — nothing was charged, so
              there is no card, no receipt, and nothing to cancel. Questions:{" "}
              <a href="mailto:support@viibe.to">support@viibe.to</a>.
            </p>
          )}
        </>
      ) : (
        // `null` is one value covering two situations — a world granted rather
        // than sold, and a billing lookup we could not complete — so this text
        // has to be true in both. The old wording asserted an outage and sent a
        // comped user hunting for a receipt email that was never sent.
        <p className="keep-billing__fine">
          We have no payment details to show for this world right now — either
          nothing was charged for it, or we could not reach billing a
          moment ago. Your world is unaffected either way. If you do have a
          subscription, the link in your receipt email manages it; otherwise
          write to <a href="mailto:support@viibe.to">support@viibe.to</a>.
        </p>
      )}
    </section>
  );
}

export default function KeepPage() {
  const stytch = useStytchB2BClient();
  const { session, isInitialized } = useStytchMemberSession();
  const { member } = useStytchMember();
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [purchased, setPurchased] = useState(false);
  const [debug, setDebug] = useState(false);
  const [status, setStatus] = useState<WorldStatus | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("purchased") === "1") {
      setPurchased(true);
      // Weak signal only — the entitlement gate stays the authority; the
      // strong signal is payment_succeeded from the RevenueCat webhook.
      track("checkout_returned");
    }
    if (params.get("debug") === "1") setDebug(true);
  }, []);

  // Sign-in redirect back to /keep: magic link (?stytch_token_type=discovery)
  // or Google/GitHub (?stytch_token_type=discovery_oauth) — one shared path
  // after authenticate, same as /oauth/login.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const tokenType = params.get("stytch_token_type");
    if (!token || (tokenType !== "discovery" && tokenType !== "discovery_oauth")) return;
    if (authenticateStarted) return;
    authenticateStarted = true;
    setPhase("authenticating");
    track("signup_completed", { surface: "keep", method: tokenType });
    (async () => {
      try {
        const auth =
          tokenType === "discovery_oauth"
            ? await stytch.oauth.discovery.authenticate({ discovery_oauth_token: token })
            : await stytch.magicLinks.discovery.authenticate({
                discovery_magic_links_token: token,
              });
        const first = auth.discovered_organizations[0];
        if (first) {
          await stytch.discovery.intermediateSessions.exchange({
            organization_id: first.organization.organization_id,
            session_duration_minutes: SESSION_MINUTES,
          });
        } else {
          await stytch.discovery.organizations.create({
            organization_name: "Living Memory",
            session_duration_minutes: SESSION_MINUTES,
          });
        }
        // Session hook updates on its own; drop the token from the URL.
        window.history.replaceState(null, "", `${BASE_PATH}/keep`);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    })();
  }, [stytch]);

  // Redirects to the provider; Stytch sends the browser back here with a
  // discovery_oauth token (same redirect target as the magic link).
  async function startOAuth(provider: OAuthProvider) {
    track("signup_started", { surface: "keep", method: provider });
    try {
      await stytch.oauth[provider].discovery.start({
        discovery_redirect_url: `${window.location.origin}${BASE_PATH}/keep`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  async function sendLink(ev?: { preventDefault(): void }) {
    ev?.preventDefault();
    setPhase("sending");
    track("signup_started", { surface: "keep", method: "magic_link" });
    try {
      await stytch.magicLinks.email.discovery.send({
        email_address: email,
        discovery_redirect_url: `${window.location.origin}${BASE_PATH}/keep`,
      });
      setPhase("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  const rcUserId = session ? rcUserIdFromSub(session.member_id) : null;
  const checkoutUrl = rcUserId ? keepCheckoutUrl(rcUserId) : "";
  const accountEmail = member?.email_address ?? null;

  // Stitch the browser to the server-side funnel id (MCP connect and
  // payment_succeeded key on the same opaque rcUserId).
  useEffect(() => {
    if (rcUserId) identify(rcUserId);
  }, [rcUserId]);

  // One read once signed in. Until it answers, the page shows no billing claim at
  // all — an unknown state renders as silence, never as "you have not paid".
  //
  // ONE READ IS NOT ENOUGH IMMEDIATELY AFTER CHECKOUT. RevenueCat activation can
  // take up to a minute — the page says so a few lines below — so a customer who
  // lands here from payment gets `entitled: false` on the first read and, with a
  // single fetch, nothing ever changes it. Everything gated on entitlement then
  // stays hidden through exactly the minute it is most wanted, including the
  // billing controls this page just gained. So while `?purchased=1` is on the URL
  // and entitlement has not landed, re-read on a fixed interval, and stop: at the
  // answer we are waiting for, or after ATTEMPTS, because a page that polls
  // forever is a page that never admits something went wrong. The activation
  // notice below is what a customer sees if the budget runs out.
  useEffect(() => {
    if (!session) return;
    const jwt = stytch.session.getTokens()?.session_jwt;
    if (!jwt) return;
    let live = true;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const read = async () => {
      const s = await fetchWorldStatus(jwt);
      if (!live) return;
      setStatus(s);
      const waiting = purchased && s?.entitled !== true && ++tries < ACTIVATION_ATTEMPTS;
      if (waiting) timer = setTimeout(read, ACTIVATION_POLL_MS);
    };
    void read();

    return () => { live = false; if (timer) clearTimeout(timer); };
  }, [session, stytch, purchased]);

  return (
    <main id="main-content" className="policy-shell keep-shell">
      <header className="policy-header">
        <LmeMark href={BASE_PATH} />
        <div className="policy-header__side">
          <a className="text-link" href={BASE_PATH}>
            Back to LME
          </a>
          <AuthAvatar />
        </div>
      </header>

      <article className="keep-card">
        {/* Storefront framing is for someone deciding. After checkout it is
            noise above the only line that matters — the address. */}
        {!purchased && (
          <>
            <p className="eyebrow">A WORLD THAT STAYS</p>
            <h1>Living Memory</h1>
          </>
        )}

        {purchased ? (
          // The highest-intent page on the site: nobody here needs convincing,
          // and there is exactly one question — I paid, how do I connect? So the
          // address IS the page. Two things this copy must never do again:
          // say "reconnect" (the paid world is a DIFFERENT URL with a different
          // auth), and offer a check that passes from the trial room. Recall
          // working proves the room works, not that the subscription landed —
          // the same false positive as a same-session readback.
          <div aria-live="polite" className="keep-return">
            {/* h1, not h2: with the storefront heading suppressed this is the
                page's only top-level heading. */}
            <h1 className="keep-return__title">Your permanent world is ready.</h1>
            <p className="keep-return__url">
              <code>{HOSTED_MCP_URL}</code>
              <CopyButton text={HOSTED_MCP_URL} label="Copy URL" />
            </p>
            <p>
              Use this URL from now on. Name it{" "}
              <strong>{SERVER_NAMES.cloud}</strong> so you can tell it apart from
              any other world you have added.
            </p>
            <p>
              Your trial room is separate. Its memories stay there and expire
              with it.
            </p>
            <ol className="keep-steps">
              <li>Replace the trial-room URL with this one.</li>
              <li>Sign in when your AI asks.</li>
              <li>
                Ask it to leave a handoff. If handoff is there, you are home.
              </li>
            </ol>
            <p>
              Agents that cannot sign in — an editor, a CLI, a coding agent — get
              a key each. Ask any agent already signed in to mint one, or see the{" "}
              <a href={AGENT_GUIDE_PATH}>setup guide</a>.
            </p>
            <p>
              Activation can take up to a minute. Still locked out after a few
              minutes? <a href={`${BASE_PATH}/support#billing`}>Billing support</a>.
            </p>
            {/* Someone who just paid is the likeliest person to want out again,
                and this branch used to end here — the self-service control was
                a sign-out and a sign-in away. Rendered only once entitlement
                has actually landed: a billing panel shown during the
                activation minute would report nothing and read as a failure. */}
            {status?.entitled === true && <BillingPanel billing={status.billing} />}
          </div>
        ) : !isInitialized ? (
          <p aria-live="polite">Loading…</p>
        ) : session ? (
          <>
            {/* An active subscriber is shown NO price and NO checkout — the whole
                point of the status read. Someone who already pays and is offered
                payment concludes their payment failed, and the delete control is
                sitting on the same page while they think that. */}
            {status?.entitled === true ? (
              <section className="keep-active" aria-live="polite">
                <h1 className="keep-active__title">
                  Your Living Memory world is active
                </h1>
                <p>Your subscription is running. Nothing to do here.</p>
                <p className="keep-return__url">
                  <strong>Your endpoint</strong> <code>{HOSTED_MCP_URL}</code>
                  <CopyButton text={HOSTED_MCP_URL} label="Copy URL" />
                </p>
                <p>
                  Sign in with this same account from any client that supports it.
                </p>
                {/* Which world is this? It was answerable only before paying: the
                    signed-in line lived in the checkout branch, so the moment
                    someone subscribed the page stopped telling them whose world
                    they were looking at — with a delete button further down. */}
                {accountEmail && (
                  <p className="keep-account" aria-label="Signed-in account">
                    This world belongs to <strong>{accountEmail}</strong>. Signing
                    in with a different address opens a different world.
                  </p>
                )}
                <BillingPanel billing={status?.billing ?? null} />
              </section>
            ) : (
              <>
                <PlanSummary />
                {accountEmail && (
                  <p className="keep-account" aria-label="Signed-in account">
                    Signed in as <strong>{accountEmail}</strong>
                  </p>
                )}
                {/* "on this sign-in", never "you have not subscribed": until
                    identities are reconciled, a paying customer can land here, and
                    this line has to stay true for them too. Shown only once the
                    read actually returned false — an unreachable billing API must
                    never render as "not subscribed". */}
                {status?.entitled === false && (
                  <p className="keep-nosub">No active subscription on this sign-in.</p>
                )}
                {checkoutUrl ? (
                  <a
                    className="button button--primary keep-cta"
                    href={checkoutUrl}
                    onClick={() => track("checkout_started")}
                  >
                    Continue to checkout — $9/month
                  </a>
                ) : (
                  <p aria-live="polite">
                    <strong>Checkout opens soon.</strong> We&apos;re finalizing live
                    payment activation — email{" "}
                    <a href="mailto:support@viibe.to">support@viibe.to</a> and
                    we&apos;ll tell you the moment it&apos;s open.
                  </p>
                )}
              </>
            )}
            {debug && rcUserId && (
              <p className="keep-debug">account: {rcUserId}</p>
            )}
            {/* Its own section, visually separated from anything priced: the delete
                control must never read as the remedy for a billing problem. */}
            <hr className="keep-divider" />
            <DeleteWorld
              memories={status?.world?.memories ?? null}
              hasBilling={status?.entitled === true}
            />
          </>
        ) : (
          <>
            <PlanSummary />
            <p className="keep-lede">
              Sign in with the same email you used to connect your AI client, so
              the subscription lands on the memory you already have.
            </p>

            {(phase === "form" || phase === "sending") && (
              <>
                <div className="auth-providers">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => startOAuth("google")}
                  >
                    <GoogleMark />
                    Continue with Google
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => startOAuth("github")}
                  >
                    <GitHubMark />
                    Continue with GitHub
                  </button>
                </div>
                <p className="auth-divider">or</p>
              </>
            )}
            {(phase === "form" || phase === "sending") && (
              <form onSubmit={sendLink} className="keep-form">
                <label htmlFor="keep-email">Email</label>
                <input
                  id="keep-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                <p className="keep-hint">
                  We&apos;ll email you a one-time sign-in link — no password.
                </p>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={phase === "sending"}
                >
                  {phase === "sending" ? "Sending…" : "Email me a sign-in link"}
                </button>
              </form>
            )}

            {phase === "sent" && (
              <div aria-live="polite">
                <p>
                  Check <strong>{email}</strong> for a sign-in link. Open it on
                  this device — it brings you back here to finish.
                </p>
                <div className="keep-recovery">
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => sendLink()}
                  >
                    Resend link
                  </button>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => setPhase("form")}
                  >
                    Change email
                  </button>
                </div>
                <p className="keep-hint">
                  Nothing arriving? Check spam, or make sure the address is the
                  one your AI client signed in with.
                </p>
              </div>
            )}

            {phase === "authenticating" && <p aria-live="polite">Signing you in…</p>}

            {phase === "error" && (
              <p className="keep-error" role="alert">
                Sign-in failed: {error} —{" "}
                <a href={`${BASE_PATH}/keep`}>try again</a>
              </p>
            )}
          </>
        )}

        <p className="keep-legal">
          <a href={`${BASE_PATH}/privacy`}>Privacy</a> ·{" "}
          <a href={`${BASE_PATH}/terms`}>Terms</a> ·{" "}
          <a href={`${BASE_PATH}/support`}>Support</a>
        </p>
      </article>
    </main>
  );
}
