import { safeAuthorizeReturn, oauthLoginPath } from './oauth-return.ts';

export interface AgentIdLoginConfig { connectionId: string }
export function agentIdFailureDiagnostic(error: unknown): Record<string, string | number> {
  const value = error && typeof error === 'object' ? error as Record<string, unknown> : {};
  return { category: 'SDK_AUTHENTICATION_FAILED',
    ...(typeof value.error_type === 'string' && /^[a-z_]+$/.test(value.error_type) ? { provider_error_type: value.error_type } : {}),
    ...(typeof value.request_id === 'string' && /^request-id-test-[a-zA-Z0-9-]+$/.test(value.request_id) ? { request_id: value.request_id } : {}),
    ...(typeof value.status_code === 'number' && Number.isInteger(value.status_code) && value.status_code >= 400 && value.status_code <= 599 ? { http_status: value.status_code } : {}),
  };
}
export function agentIdLoginConfig(enabled?: string, connectionId?: string, publicToken?: string): AgentIdLoginConfig | null {
  if (enabled !== '1') return null;
  const connection = /^oidc-connection-(test|live)-[a-zA-Z0-9-]+$/.exec(connectionId ?? '');
  const token = /^public-token-(test|live)-[a-zA-Z0-9-]+$/.exec(publicToken ?? '');
  if (!connection || !token || connection[1] !== token[1]) throw new Error('AgentID connection and Stytch public token must use the same environment');
  return { connectionId: connectionId! };
}

interface SsoClient {
  start(options: { connection_id: string; login_redirect_url: string; signup_redirect_url: string }): Promise<void>;
  authenticate(options: { sso_token: string; session_duration_minutes: number }): Promise<{ session_jwt?: string; member_session?: unknown; member?: { sso_registrations: { connection_id: string }[] } }>;
}

export async function startAgentIdLogin(sso: SsoClient, config: AgentIdLoginConfig, origin: string, returnTo: string | null): Promise<void> {
  const safeReturn = safeAuthorizeReturn(returnTo, origin);
  if (!safeReturn) throw new Error('Open AgentID sign-in from your MCP client to continue.');
  const redirect = new URL(oauthLoginPath(safeReturn), origin);
  // Reserved marker distinguishes this flow without carrying identity or tokens.
  redirect.searchParams.set('agentid', '1');
  await sso.start({ connection_id: config.connectionId, login_redirect_url: redirect.toString(), signup_redirect_url: redirect.toString() });
}

export async function completeAgentIdLogin(sso: SsoClient, config: AgentIdLoginConfig, params: URLSearchParams, origin: string,
  session: { revoke(options: { forceClear: boolean }): Promise<unknown> },
  proveSession?: (jwt: string, returnTo: string) => Promise<void>): Promise<string> {
  const token = params.get('token');
  const returnTo = safeAuthorizeReturn(params.get('return_to'), origin);
  if (params.get('agentid') !== '1' || params.get('stytch_token_type') !== 'sso' || !token || !returnTo) {
    throw new Error('This sign-in expired or is incomplete. Start again from your MCP client.');
  }
  const result = await sso.authenticate({ sso_token: token, session_duration_minutes: 60 });
  try {
    if (!result.member_session) throw new Error('Additional authentication is required. Contact the app administrator.');
    if (!result.member?.sso_registrations.some(registration => registration.connection_id === config.connectionId)) {
      throw new Error('The session does not belong to the configured AgentID connection.');
    }
    if (proveSession) {
      if (!result.session_jwt) throw new Error('TEST session proof is missing.');
      await proveSession(result.session_jwt, returnTo);
    }
  } catch (failure) {
    // authenticate installs the SDK session before these checks. Withdraw it
    // before rendering an error, so a retry cannot resume a rejected identity.
    await session.revoke({ forceClear: true });
    throw failure;
  }
  return returnTo;
}

/** Once SDK authentication consumes the token, keep it out of browser history. */
export function cleanAgentIdCallback(url: URL): string {
  for (const key of ['token', 'stytch_token_type', 'error', 'error_description']) url.searchParams.delete(key);
  return `${url.pathname}${url.search}`;
}
