import { BASE_PATH } from "./base-path.ts";

export const OAUTH_RETURN_KEY = "lme_oauth_authorize_url";
export const OAUTH_RETURN_PARAM = "return_to";

const AUTHORIZE_PATH = `${BASE_PATH}/oauth/authorize`;
// next.config.ts sets trailingSlash:true, so the canonical URL a client is sent to
// is 308-redirected to the slashed form before this ever runs. Both spellings are
// the same route; accepting only one made the authorize page reject its own URL.
const AUTHORIZE_PATHS = new Set([AUTHORIZE_PATH, `${AUTHORIZE_PATH}/`]);
const LOGIN_PATH = `${BASE_PATH}/oauth/login`;

/**
 * Accept only this site's OAuth authorize route and return a relative URL.
 * Returning a relative value keeps the eventual navigation same-origin even
 * when the value came from a magic-link query parameter or localStorage.
 */
export function safeAuthorizeReturn(raw: string | null, origin: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw, origin);
    if (url.origin !== origin || !AUTHORIZE_PATHS.has(url.pathname)) return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

/** Carry the pending OAuth request through Stytch's cross-browser redirect. */
export function oauthLoginPath(returnTo: string): string {
  const query = new URLSearchParams({ [OAUTH_RETURN_PARAM]: returnTo });
  return `${LOGIN_PATH}?${query.toString()}`;
}
