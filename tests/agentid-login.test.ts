import test from 'node:test';
import assert from 'node:assert/strict';
import { agentIdLoginConfig, startAgentIdLogin, completeAgentIdLogin, cleanAgentIdCallback, agentIdFailureDiagnostic } from '../lib/agentid-login.ts';

const origin = 'http://localhost:3000';
const returnTo = '/living-memory/oauth/authorize?client_id=mcp&state=mcp-state&code_challenge=pkce';
const config = { connectionId: 'oidc-connection-test-example' };
test('disabled by default; cannot mix test and live environments', () => {
  assert.equal(agentIdLoginConfig(), null);
  assert.throws(() => agentIdLoginConfig('1', config.connectionId, 'public-token-live-example'));
  assert.deepEqual(agentIdLoginConfig('1', config.connectionId, 'public-token-test-example'), config);
});
test('SSO starts with the same allowlisted return URL for both new and existing Agents', async () => {
  let options: any;
  const sso = { start: async (o: any) => { options = o; }, authenticate: async () => ({ member_session: {}, member: { sso_registrations: [{ connection_id: config.connectionId }] } }) };
  await startAgentIdLogin(sso, config, origin, returnTo);
  assert.equal(options.connection_id, config.connectionId);
  assert.equal(options.login_redirect_url, options.signup_redirect_url);
  const callback = new URL(options.login_redirect_url);
  assert.equal(callback.searchParams.get('return_to'), returnTo);
  assert.equal(callback.searchParams.get('agentid'), '1');
  callback.searchParams.set('token', 'sso-single-use');
  callback.searchParams.set('stytch_token_type', 'sso');
  let calls = 0;
  sso.authenticate = async (...args: any[]) => {
    calls++;
    assert.deepEqual(args[0], { sso_token: 'sso-single-use', session_duration_minutes: 60 });
    return { member_session: {}, member: { sso_registrations: [{ connection_id: config.connectionId }] } };
  };
  assert.equal(await completeAgentIdLogin(sso, config, callback.searchParams, origin), returnTo);
  assert.equal(calls, 1);
});
test('rejects missing/foreign pending requests before consuming a single-use token', async () => {
  const sso = { start: async () => assert.fail('must not start'), authenticate: async () => { assert.fail('must not authenticate'); return {}; } };
  for (const target of [null, 'https://evil.example/living-memory/oauth/authorize', '/living-memory/keep']) {
    await assert.rejects(startAgentIdLogin(sso, config, origin, target));
  }
  for (const type of ['discovery', 'discovery_oauth', 'sso']) {
    const params = new URLSearchParams({ agentid: '1', token: 'token', stytch_token_type: type, return_to: 'https://evil.example/living-memory/oauth/authorize' });
    await assert.rejects(completeAgentIdLogin(sso, config, params, origin));
  }
});
test('MFA without a complete session cannot continue to MCP consent', async () => {
  const params = new URLSearchParams({ agentid: '1', token: 'token', stytch_token_type: 'sso', return_to: returnTo });
  await assert.rejects(completeAgentIdLogin({ start: async () => {}, authenticate: async () => ({}) }, config, params, origin), /Additional authentication/);
});
test('callback history keeps pending MCP request but removes token and provider error text', () => {
  const url = new URL('/living-memory/oauth/login?agentid=1&token=secret&stytch_token_type=sso&error=denied&error_description=private', origin);
  url.searchParams.set('return_to', returnTo);
  const clean = new URL(cleanAgentIdCallback(url), origin);
  for (const key of ['token', 'stytch_token_type', 'error', 'error_description']) assert.equal(clean.searchParams.has(key), false);
  assert.equal(clean.searchParams.get('return_to'), returnTo);
});

test('rejects a session from a different SSO connection', async () => {
  const params = new URLSearchParams({ agentid: '1', token: 'token', stytch_token_type: 'sso', return_to: returnTo });
  const sso = { start: async () => {}, authenticate: async () => ({ member_session: {}, member: { sso_registrations: [{ connection_id: 'oidc-connection-test-other' }] } }) };
  await assert.rejects(completeAgentIdLogin(sso, config, params, origin), /configured AgentID connection/);
});

test('TEST proof receives the exact original MCP request before consent and blocks continuation on failure', async () => {
  const pending = '/living-memory/oauth/authorize/?client_id=original-client&redirect_uri=http%3A%2F%2Flocalhost%3A3110%2Foauth%2Fcallback&response_type=code&scope=openid%20email%20profile&state=original-state&nonce=original-nonce&code_challenge=original-pkce&code_challenge_method=S256';
  const params = new URLSearchParams({ agentid: '1', token: 'fixture', stytch_token_type: 'sso', return_to: pending });
  const sso = { start: async () => {}, authenticate: async () => ({ member_session: {}, session_jwt: 'fixture-jwt', member: { sso_registrations: [{ connection_id: config.connectionId }] } }) };
  let proved = false;
  assert.equal(await completeAgentIdLogin(sso, config, params, origin, async (jwt, request) => {
    assert.equal(jwt, 'fixture-jwt'); assert.equal(request, pending); proved = true;
  }), pending);
  assert.equal(proved, true);
  await assert.rejects(completeAgentIdLogin(sso, config, params, origin, async () => { throw new Error('proof denied'); }), /proof denied/);
});
test('browser diagnostics retain safe error identifiers and drop tokens, email, URLs and descriptions', () => {
  const result = agentIdFailureDiagnostic({ error_type: 'invalid_client', request_id: 'request-id-test-example', status_code: 400,
    error_message: 'private email and token', url: '?token=private', access_token: 'private' });
  assert.deepEqual(result, { category: 'SDK_AUTHENTICATION_FAILED', provider_error_type: 'invalid_client', request_id: 'request-id-test-example', http_status: 400 });
  assert.doesNotMatch(JSON.stringify(result), /private|token=|email/);
});
