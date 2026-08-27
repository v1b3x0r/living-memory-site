/**
 * Single source of truth for the site's base path.
 * The canonical deployment serves the site at https://viibe.to/living-memory
 * via a Workers route, so every public asset URL must carry this prefix —
 * root-relative URLs fall outside the route and are not served by this Worker.
 */
export const BASE_PATH = "/living-memory";
