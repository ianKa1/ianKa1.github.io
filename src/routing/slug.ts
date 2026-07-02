/**
 * Produce a URL-safe slug from a free-form title. The result is lowercase
 * ASCII/CJK letters + digits, with runs of everything else collapsed into
 * single hyphens. Handles English, punctuation, and CJK gracefully:
 *
 *   "On the geometry of cities"     → "on-the-geometry-of-cities"
 *   "典型做题家"                     → "典型做题家"
 *   "Reading & writing (2026)"      → "reading-writing-2026"
 *
 * Falls back to `"untitled"` when the input collapses to an empty string
 * so `formatHash` never emits a trailing slash with nothing after it.
 */
export function titleToSlug(title: string): string {
  const normalized = title
    .normalize('NFKD')
    // Drop combining diacritics so `café` → `cafe`.
    .replace(/\p{M}+/gu, '')
    .toLowerCase();

  const slug = normalized
    // Keep ASCII alphanumerics and any letter script (covers CJK); replace
    // everything else with a hyphen.
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'untitled';
}

/**
 * Slug for a place, using the city half of the display name (so
 * `"Paris, France"` and `"Paris, USA"` still collide — the site has one
 * `Paris` for now, and a collision would surface in dev as a
 * `[places] Duplicate entry` warning).
 */
export function placeToSlug(cityOrName: string): string {
  return titleToSlug(cityOrName);
}
