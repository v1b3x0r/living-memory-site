"use client";
// The OAuth authorization URL — headless consent screen.
// An MCP client arrives with OAuth params; with a member session we run
// oauthAuthorizeStart (validates params, names the client, lists scopes),
// render our own Approve/Deny, and oauthAuthorizeSubmit redirects back to
// the client with a code (or an OAuth error on deny). No Stytch UI renders
// here — the prebuilt components crash under this React runtime.
import { useEffect, useState } from "react";
import { useStytchB2BClient, useStytchMemberSession } from "@stytch/react/b2b";
import {
  OAUTH_RETURN_KEY,
  oauthLoginPath,
  safeAuthorizeReturn,
} from "../../../lib/oauth-return";
import { requestedScopes } from "../../../lib/oauth-scope";
import { BASE_PATH } from "../../../lib/base-path";
import { AuthAvatar } from "../../../components/AuthAvatar";
import { FeedbackBox } from "../../../components/FeedbackBox";
import { LmeMark } from "../../../components/LmeMark";

interface AuthRequest {
  client_id: string;
  redirect_uri: string;
  response_type: string;
  scopes: string[];
  state?: string;
  nonce?: string;
  code_challenge?: string;
}

function parseRequest(): AuthRequest | null {
  const q = new URLSearchParams(window.location.search);
  const client_id = q.get("client_id");
  const redirect_uri = q.get("redirect_uri");
  if (!client_id || !redirect_uri) return null;
  return {
    client_id,
    redirect_uri,
    response_type: q.get("response_type") ?? "code",
    scopes: requestedScopes(q.get("scope")),
    state: q.get("state") ?? undefined,
    nonce: q.get("nonce") ?? undefined,
    code_challenge: q.get("code_challenge") ?? undefined,
  };
}

export default function OAuthAuthorizePage() {
  const stytch = useStytchB2BClient();
  const { session, isInitialized } = useStytchMemberSession();
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [clientName, setClientName] = useState<string | null>(null);
  const [scopeDescriptions, setScopeDescriptions] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "consent" | "submitting" | "invalid" | "error">("loading");
  const [error, setError] = useState("");

  // No session → carry the authorize request into the login URL. Stytch
  // preserves this query parameter in the emailed redirect, so another
  // browser/profile/device can resume the same OAuth request. localStorage is
  // retained only as a same-browser fallback.
  useEffect(() => {
    if (!isInitialized || session) return;
    const returnTo = safeAuthorizeReturn(window.location.href, window.location.origin);
    // Never bail silently: with nothing to return to there is no session to wait
    // for, and leaving the status on "loading" hangs the page forever — the exact
    // cold-entry failure reported from ChatGPT's in-app browser, where the user
    // cannot even escape to another tab.
    if (!returnTo) { setStatus("invalid"); return; }
    try {
      localStorage.setItem(OAUTH_RETURN_KEY, returnTo);
    } catch {
      // The URL-carried value is authoritative; storage is only a fallback.
    }
    window.location.replace(oauthLoginPath(returnTo));
  }, [isInitialized, session]);

  // Session present → validate the OAuth request and load the consent data.
  useEffect(() => {
    if (!isInitialized || !session) return;
    const req = parseRequest();
    if (!req) { setStatus("invalid"); return; }
    setRequest(req);
    (async () => {
      try {
        const res = await stytch.idp.oauthAuthorizeStart({
          client_id: req.client_id,
          redirect_uri: req.redirect_uri,
          response_type: req.response_type,
          scopes: req.scopes,
        });
        setClientName(res.client.client_name ?? req.client_id);
        setScopeDescriptions(res.scope_results.map((s) => s.description || s.scope));
        setStatus("consent");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setStatus("error");
      }
    })();
  }, [isInitialized, session, stytch]);

  async function decide(consent_granted: boolean) {
    if (!request) return;
    setStatus("submitting");
    try {
      const res = await stytch.idp.oauthAuthorizeSubmit({ ...request, consent_granted });
      window.location.href = res.redirect_uri;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
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
        <p className="eyebrow">LIVING MEMORY · CONNECT</p>

        {status === "loading" && (
          <p className="auth-status" aria-live="polite">Checking your session…</p>
        )}

        {status === "invalid" && (
          <p className="auth-lede" style={{ margin: 0 }}>
            This page completes authorization requests from AI clients — it isn&apos;t meant to be opened directly.
          </p>
        )}

        {status === "consent" && (
          <>
            <h1>Authorize {clientName}</h1>
            <p className="auth-lede">
              <strong>{clientName}</strong> is asking to access your Living Memory:
            </p>
            <ul className="auth-scopes">
              {scopeDescriptions.map((d) => <li key={d}>{d}</li>)}
            </ul>
            <div className="auth-actions">
              <button className="button button--primary" onClick={() => decide(true)}>
                Approve
              </button>
              <button className="button button--secondary" onClick={() => decide(false)}>
                Deny
              </button>
            </div>
          </>
        )}

        {status === "submitting" && (
          <p className="auth-status" aria-live="polite">Finishing authorization…</p>
        )}

          {status === "error" && <p className="auth-error">Authorization failed: {error}</p>}
        </div>
        <FeedbackBox variant="link" />
      </div>
    </main>
  );
}
