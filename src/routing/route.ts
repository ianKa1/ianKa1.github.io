import type { Category } from '../types';

/**
 * Flat description of the current view. `category` is always defined;
 * the section-specific slots are populated only when a subview is open
 * (e.g. `projectId` for `#/tech/project-4`).
 *
 * The URL is the single source of truth — every sub-view (project detail,
 * article reader, active place) sets exactly one of these optional fields.
 */
export interface RouteState {
  category: Category;
  projectId?: string;
  articleSlug?: string;
  placeSlug?: string;
}

const CATEGORIES: readonly Category[] = [
  'entry',
  'tech',
  'words',
  'visuals',
  'traces',
];

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/**
 * Parse `window.location.hash` into a `RouteState`. Accepts either an
 * empty hash, `#/`, `#/<category>`, or `#/<category>/<slug>`. Unknown
 * categories collapse to `entry`.
 */
export function parseHash(hash: string): RouteState {
  // Drop leading `#` and any leading slashes so `#/tech` and `#tech`
  // both parse.
  const raw = hash.replace(/^#/, '').replace(/^\/+/, '');
  if (!raw) return { category: 'entry' };

  const [rawCategory, rawSlug] = raw.split('/');
  const category = isCategory(rawCategory) ? rawCategory : 'entry';
  const slug = rawSlug ? decodeURIComponent(rawSlug) : undefined;

  if (!slug) return { category };

  switch (category) {
    case 'tech':
      return { category, projectId: slug };
    case 'words':
      return { category, articleSlug: slug };
    case 'traces':
      return { category, placeSlug: slug };
    default:
      // `entry` and `visuals` have no sub-views — ignore the slug.
      return { category };
  }
}

/**
 * Format a `RouteState` back into a hash string like `#/tech/project-4`.
 * The `entry` root collapses to `#/` so the URL stays clean on the
 * landing page.
 */
export function formatHash(state: RouteState): string {
  const slug =
    state.projectId ?? state.articleSlug ?? state.placeSlug ?? undefined;
  if (state.category === 'entry' && !slug) return '#/';
  if (!slug) return `#/${state.category}`;
  return `#/${state.category}/${encodeURIComponent(slug)}`;
}
