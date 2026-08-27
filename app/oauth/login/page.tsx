"use client";
// Headless login for the OAuth flow: our own form + direct SDK calls.
// (The prebuilt <StytchB2B> UI crashes under this React runtime — its email-sent
// screen took the whole page down, so no Stytch component renders anything here.)
//
// Two jobs on one URL:
//   1. plain state: ask for an email, send a DISCOVERY magic link that redirects
//      back to this same page;
//   2. redirect state (?token=...): authenticate the token, exchange the
//      intermediate session into the member's org (creating "Living Memory"
//      on first sign-in), then bounce back to the authorize request that
//      started all this. The validated relative authorize URL travels in the
//      Stytch redirect query so this also works across browser profiles and
//      devices; localStorage remains a same-browser fallback.
import { useEffect, useState } from "react";
import { useStytchB2BClient, useStytchMemberSession } from "@stytch/react/b2b";
import { BASE_PATH } from "../../../lib/base-path";
import { AuthAvatar } from "../../../components/AuthAvatar";
import { FeedbackBox } from "../../../components/FeedbackBox";
import { LmeMark } from "../../../components/LmeMark";
import {
  GitHubMark,
  GoogleMark,
  type OAuthProvider,
} from "../../../components/ProviderMarks";
import { track } from "../../../lib/telemetry";
import {
  OAUTH_RETURN_KEY,
  OAUTH_RETURN_PARAM,
  oauthLoginPath,
  safeAuthorizeReturn,
} from "../../../lib/oauth-return";
// The project's max session duration (Stytch SDK default). Raising it is a
// dashboard setting (SDK configuration), not a code decision.
const SESSION_MINUTES = 60;

// A discovery token is single-use: guard against double effect invocation
// burning it (and against a second tab racing the first).
let authenticateStarted = false;

type Phase = "form" | "sending" | "sent" | "authenticating" | "signed-in" | "error";

function pendingAuthorizeReturn(): string | null {
  const queryValue = new URLSearchParams(window.location.search).get(OAUTH_RETURN_PARAM);
  const carried = safeAuthorizeReturn(queryValue, window.location.origin);
  if (carried) return carried;
  try {
    return safeAuthorizeReturn(localStorage.getItem(OAUTH_RETURN_KEY), window.location.origin);
  } catch {
    return null;
  }
}

function loginPathForPendingReturn(): string {
  const returnTo = pendingAuthorizeReturn();
  return returnTo ? oauthLoginPath(returnTo) : `${BASE_PATH}/oauth/login`;
}

/** Resume the pending authorize request if one is carried or stashed. */
function returnToAuthorize(): boolean {
  const returnTo = pendingAuthorizeReturn();
  if (returnTo) {
    try {
      localStorage.removeItem(OAUTH_RETURN_KEY);
    } catch {
      // A blocked fallback store must not block the validated URL redirect.
    }
    window.location.replace(returnTo);
    return true;
  }
  return false;
}

export default function OAuthLoginPage() {
  const stytch = useStytchB2BClient();
  const { session, isInitialized } = useStytchMemberSession();
  const [phase, setPhase] = useState<Phase>("form");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Already signed in (or just finished) → straight back to the authorize
  // request; with nothing stashed, say so instead of hanging forever.
  useEffect(() => {
    if (isInitialized && session && !returnToAuthorize()) setPhase("signed-in");
  }, [isInitialized, session]);

  // Discovery redirect: ?stytch_token_type=discovery&token=... (magic link)
  // or ?stytch_token_type=discovery_oauth&token=... (Google/GitHub). Both land
  // on the same discovered-organizations shape, so everything after the
  // authenticate call is shared.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const tokenType = params.get("stytch_token_type");
    if (!token || (tokenType !== "discovery" && tokenType !== "discovery_oauth")) return;
    if (authenticateStarted) return;
    authenticateStarted = true;
    setPhase("authenticating");
    track("signup_completed", { surface: "oauth", method: tokenType });
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
        if (!returnToAuthorize()) setPhase("signed-in");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    })();
  }, [stytch]);

  async function sendLink(ev: { preventDefault(): void }) {
    ev.preventDefault();
    setPhase("sending");
    track("signup_started", { surface: "oauth", method: "magic_link" });
    try {
      await stytch.magicLinks.email.discovery.send({
        email_address: email,
        discovery_redirect_url: `${window.location.origin}${loginPathForPendingReturn()}`,
      });
      setPhase("sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  // Redirects to the provider; on success Stytch sends the browser back to
  // this page with a discovery_oauth token (same redirect as magic links).
  async function startOAuth(provider: OAuthProvider) {
    track("signup_started", { surface: "oauth", method: provider });
    try {
      await stytch.oauth[provider].discovery.start({
        discovery_redirect_url: `${window.location.origin}${loginPathForPendingReturn()}`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  return (
    <main className="auth-shell">
      <div className="auth-shell__inner">
        <header className="auth-header">
          <LmeMark href={BASE_PATH} />
          <AuthAvatar />
        </header>
        <div className="auth-card">
        <p className="eyebrow">LIVING MEMORY · SIGN IN</p>
        <h1>Sign in to Living Memory</h1>
        <p className="auth-lede">
          You are signing in to authorize an AI client to use your hosted memory.
        </p>

        {(phase === "form" || phase === "sending") && (
          <>
            <div className="auth-providers">
              <button className="button button--secondary" onClick={() => startOAuth("google")}>
                <GoogleMark />
                Continue with Google
              </button>
              <button className="button button--secondary" onClick={() => startOAuth("github")}>
                <GitHubMark />
                Continue with GitHub
              </button>
            </div>
            <p className="auth-divider">or</p>
            <form className="auth-form" onSubmit={sendLink}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
              />
              <button type="submit" className="button button--primary" disabled={phase === "sending"}>
                {phase === "sending" ? "Sending…" : "Email me a sign-in link"}
              </button>
            </form>
          </>
        )}

        {phase === "sent" && (
          <p className="auth-status auth-status--done">
            Check <strong>{email}</strong> for a sign-in link. Opening it brings you back
            here to finish authorizing — you can close this tab.
          </p>
        )}

        {phase === "authenticating" && (
          <p className="auth-status" aria-live="polite">Signing you in…</p>
        )}

        {phase === "signed-in" && (
          <p className="auth-status auth-status--done" aria-live="polite">
            Signed in — now return to your AI client&apos;s tab and press{" "}
            <strong>Approve</strong> to finish connecting. You can close this tab.
          </p>
        )}

        {phase === "error" && (
          <p className="auth-error">
            Sign-in failed: {error} — <a href={loginPathForPendingReturn()}>try again</a>
          </p>
        )}

          <p className="auth-footnote">
            <a href={`${BASE_PATH}/privacy`}>Privacy</a> · <a href={`${BASE_PATH}/terms`}>Terms</a>
          </p>
        </div>
        <FeedbackBox variant="link" />
      </div>
    </main>
  );
}
