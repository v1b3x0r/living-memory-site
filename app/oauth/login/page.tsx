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
import { useEffect, useRef, useState } from "react";
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
import { initTelemetry, track } from "../../../lib/telemetry";
import { agentIdLoginConfig, startAgentIdLogin, completeAgentIdLogin, cleanAgentIdCallback, agentIdFailureDiagnostic } from "../../../lib/agentid-login";
import {
  OAUTH_RETURN_KEY,
  OAUTH_RETURN_PARAM,
  oauthLoginPath,
  safeAuthorizeReturn,
  mayResumeOAuthSession,
} from "../../../lib/oauth-return";
// The project's max session duration (Stytch SDK default). Raising it is a
// dashboard setting (SDK configuration), not a code decision.
const SESSION_MINUTES = 60;
const PASSWORD_SETUP_PARAM = "setup_password";

// A discovery token is single-use: guard against double effect invocation
// burning it (and against a second tab racing the first).
let authenticateStarted = false;

type Phase = "form" | "sending" | "redirecting" | "sent" | "authenticating" | "signed-in" | "error";

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
  if (returnTo) return oauthLoginPath(returnTo);
  const setup = new URLSearchParams(window.location.search).get(PASSWORD_SETUP_PARAM) === "1";
  return setup ? `${BASE_PATH}/oauth/login?${PASSWORD_SETUP_PARAM}=1` : `${BASE_PATH}/oauth/login`;
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
  const [password, setPassword] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [setupStatus, setSetupStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [setupError, setSetupError] = useState("");
  const [error, setError] = useState("");
  const oauthStartPending = useRef(false);
  const agentCallbackPending = useRef(false);
  const agentIdConfig = agentIdLoginConfig(import.meta.env.VITE_AGENTID_ENABLED,
    import.meta.env.VITE_AGENTID_CONNECTION_ID, import.meta.env.VITE_STYTCH_PUBLIC_TOKEN);

  useEffect(() => {
    initTelemetry(); // Pause any recording started before SPA navigation into OAuth.
    const params = new URLSearchParams(window.location.search);
    if (params.get("agentid") !== "1" || agentCallbackPending.current) return;
    // Explicit retries retain the marker but no callback token; show the login form.
    if (!params.has("token") && !params.has("error")) return;
    agentCallbackPending.current = true;
    if (!agentIdConfig || params.has("error")) {
      window.history.replaceState(null, "", cleanAgentIdCallback(new URL(window.location.href)));
      setError("AgentID sign-in was cancelled or is unavailable. Start again from your MCP client.");
      setPhase("error");
      return;
    }
    setPhase("authenticating");
    // Capture the single-use token in memory, then remove it before any analytics.
    window.history.replaceState(null, "", cleanAgentIdCallback(new URL(window.location.href)));
    // Development-only real-provider harness. Never sends a token off this machine.
    const proveSession = import.meta.env.DEV && import.meta.env.VITE_AGENTID_TEST_MODE === '1' &&
      window.location.origin === 'http://localhost:3000' && import.meta.env.VITE_AGENTID_SMOKE_ORIGIN === 'http://localhost:3110'
      ? async (jwt: string, returnTo: string) => {
        const res = await fetch('http://localhost:3110/session-proof', { method: 'POST',
          headers: { 'content-type': 'application/json' }, body: JSON.stringify({ session_jwt: jwt, return_to: returnTo }) });
        if (!res.ok) throw new Error('TEST session proof failed.');
      } : undefined;
    completeAgentIdLogin(stytch.sso, agentIdConfig, params, window.location.origin, stytch.session, proveSession).then(returnTo => {
      try { localStorage.removeItem(OAUTH_RETURN_KEY); } catch { /* optional fallback */ }
      window.location.replace(returnTo);
    }).catch((failure: unknown) => {
      if (proveSession) void fetch('http://localhost:3110/diagnostic', { method: 'POST',
        headers: { 'content-type': 'application/json' }, body: JSON.stringify(agentIdFailureDiagnostic(failure)) }).catch(() => {});
      setError("AgentID sign-in could not be completed. Please try again from your MCP client.");
      setPhase("error");
    });
  }, [stytch, agentIdConfig?.connectionId]);

  useEffect(() => {
    setShowPasswordSetup(new URLSearchParams(window.location.search).get(PASSWORD_SETUP_PARAM) === "1");
  }, []);

  // Already signed in (or just finished) → straight back to the authorize
  // request; with nothing stashed, say so instead of hanging forever.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!mayResumeOAuthSession(params)) return; // process fresh callback before resuming an old identity
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

  async function signInWithPassword(ev: { preventDefault(): void }) {
    ev.preventDefault();
    setPhase("authenticating");
    track("signup_started", { surface: "oauth", method: "password" });
    try {
      const auth = await stytch.passwords.discovery.authenticate({
        email_address: email,
        password,
      });
      // Password login is for an existing account. Never create a new World
      // merely because a reviewer entered an address with no organization.
      const first = auth.discovered_organizations[0];
      if (!first) throw new Error("No existing Living Memory account was found for this email.");
      await stytch.discovery.intermediateSessions.exchange({
        organization_id: first.organization.organization_id,
        session_duration_minutes: SESSION_MINUTES,
      });
      setPassword("");
      if (!returnToAuthorize()) setPhase("signed-in");
    } catch (e) {
      setPassword("");
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  async function setPasswordForCurrentSession(ev: { preventDefault(): void }) {
    ev.preventDefault();
    if (!session) return;
    setSetupStatus("saving");
    try {
      await stytch.passwords.resetBySession({ password: setupPassword });
      setSetupPassword("");
      setSetupStatus("saved");
    } catch (e) {
      setSetupPassword("");
      setSetupError(e instanceof Error ? e.message : String(e));
      setSetupStatus("error");
    }
  }

  // Redirects to the provider; on success Stytch sends the browser back to
  // this page with a discovery_oauth token (same redirect as magic links).
  async function startOAuth(provider: OAuthProvider) {
    // A second start in this tab can replace the provider state while the
    // browser is still following the first redirect.
    if (oauthStartPending.current) return;
    oauthStartPending.current = true;
    setPhase("redirecting");
    track("signup_started", { surface: "oauth", method: provider });
    try {
      await stytch.oauth[provider].discovery.start({
        discovery_redirect_url: `${window.location.origin}${loginPathForPendingReturn()}`,
      });
    } catch (e) {
      oauthStartPending.current = false;
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    }
  }

  async function startAgentId() {
    if (!agentIdConfig || oauthStartPending.current) return;
    oauthStartPending.current = true;
    setPhase("redirecting");
    try {
      // Do not silently turn an existing human session into the Agent's identity.
      if (session) await stytch.session.revoke();
      await startAgentIdLogin(stytch.sso, agentIdConfig, window.location.origin, pendingAuthorizeReturn());
    } catch {
      oauthStartPending.current = false;
      setError("AgentID sign-in could not start. Please try again from your MCP client.");
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
              {agentIdConfig && (
                <button className="button button--secondary" disabled={phase !== "form"} onClick={startAgentId}>
                  <img src={`${BASE_PATH}/agentid.svg`} width="20" height="20" alt="" aria-hidden="true" />
                  Continue with AgentID
                </button>
              )}
              <button className="button button--secondary" disabled={phase !== "form"} onClick={() => startOAuth("google")}>
                <GoogleMark />
                Continue with Google
              </button>
              <button className="button button--secondary" disabled={phase !== "form"} onClick={() => startOAuth("github")}>
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
            <details className="auth-password">
              <summary>Sign in with a password</summary>
              <form className="auth-form" onSubmit={signInWithPassword}>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Password account email"
                />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                />
                <button type="submit" className="button button--secondary">
                  Sign in
                </button>
              </form>
            </details>
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

        {phase === "redirecting" && (
          <p className="auth-status" aria-live="polite">Opening your sign-in provider…</p>
        )}

        {phase === "signed-in" && (
          showPasswordSetup ? (
            <div className="auth-password-setup">
              <p className="auth-status">Signed in. Set a password for this account.</p>
              {setupStatus === "saved" ? (
                <p className="auth-status auth-status--done" role="status">Password set. Sign out before testing password login.</p>
              ) : (
                <form className="auth-form" onSubmit={setPasswordForCurrentSession}>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={setupPassword}
                    onChange={(e) => setSetupPassword(e.target.value)}
                    aria-label="New password"
                  />
                  <button type="submit" className="button button--primary" disabled={setupStatus === "saving"}>
                    {setupStatus === "saving" ? "Saving…" : "Set password"}
                  </button>
                </form>
              )}
              {setupStatus === "error" && <p className="auth-error" role="alert">Could not set password: {setupError}</p>}
            </div>
          ) : (
            <p className="auth-status auth-status--done" aria-live="polite">
              Signed in — now return to your AI client&apos;s tab and press{" "}
              <strong>Approve</strong> to finish connecting. You can close this tab.
            </p>
          )
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
