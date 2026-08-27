/**
 * `scope` is OPTIONAL on an OAuth authorization request (RFC 6749 §3.3), and a
 * client that omits it is asking the server to choose. Stytch will not choose:
 * an empty scope array comes back as oauth_invalid_scope_requested, "empty set
 * of scopes requested". So the omission has to be answered here, before the
 * request leaves the page — otherwise every spec-conformant client that sends
 * no scope (Cursor, among others) is refused for following the spec.
 *
 * The default is the set claude.ai already sends and Stytch already accepts.
 * A client that names its own scopes is never widened.
 */
export const DEFAULT_SCOPES = ["openid", "profile", "email"] as const;

export function requestedScopes(raw: string | null): string[] {
  const asked = (raw ?? "").split(/\s+/).filter(Boolean);
  return asked.length ? asked : [...DEFAULT_SCOPES];
}
