import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

test('checkout retry re-runs the actual status effect without falling back to a raw member billing ID', async () => {
  const source = readFileSync(new URL('../app/keep/page.tsx', import.meta.url), 'utf8');
  const start = source.indexOf('  useEffect(() => {\n    if (!session) return;');
  const end = source.indexOf('  }, [session, stytch, purchased, statusRefresh]);', start);
  assert.ok(start >= 0 && end > start);
  // Evaluate the real effect body, stripping only its TypeScript timer annotation.
  const effect = source.slice(start + '  useEffect('.length, end + 3)
    .replace('let timer: ReturnType<typeof setTimeout> | undefined;', 'let timer;');
  const observed: { status: { rcUserId?: string } | null } = { status: null };
  let subject: string | null = null;
  let loading = false, reads = 0;
  let finished: () => void = () => {};
  const context = {
    session: { member_id: 'member-agent' }, stytch: { session: { getTokens: () => ({ session_jwt: 'fixture' }) } },
    purchased: false, ACTIVATION_ATTEMPTS: 10, ACTIVATION_POLL_MS: 2000,
    setTimeout, clearTimeout,
    fetchWorldStatus: async () => ++reads === 1 ? null : { rcUserId: 'oauth_agentid_canonical' },
    setStatus: (value: typeof observed.status) => { observed.status = value; },
    setStatusSubject: (value: string) => { subject = value; finished(); },
    setStatusLoading: (value: boolean) => { loading = value; },
  };
  const run = runInNewContext(`(${effect})`, context);
  for (let attempt = 0; attempt < 2; attempt++) {
    const done = new Promise<void>(resolve => { finished = resolve; });
    const cleanup = run();
    assert.equal(loading, true);
    await done;
    assert.equal(loading, false);
    assert.equal(subject, 'member-agent');
    assert.equal(observed.status?.rcUserId ?? null, attempt === 0 ? null : 'oauth_agentid_canonical');
    cleanup();
  }
  assert.equal(reads, 2);
  assert.match(source, /\[session, stytch, purchased, statusRefresh\]/);
  assert.match(source, /setStatusRefresh\(value => value \+ 1\)/);
  assert.match(source, /Retry account check/);
});
