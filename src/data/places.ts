import type { Place } from '../components/InteractiveMap';
import type { MultiPolygon, Polygon } from 'geojson';
// Vite's `?raw` suffix imports the markdown contents as a string at build time.
import placesMarkdown from './places.md?raw';
// Coord + boundary cache populated by `scripts/geocode.mjs` from Nominatim.
import placeCache from './places.cache.json';

type PlaceType = Place['type'];

interface CacheEntry {
  coords: [number, number];
  boundary: Polygon | MultiPolygon | null;
}

// JSON imports widen to looser types; narrow at the boundary.
const CACHE = placeCache as unknown as Record<string, CacheEntry>;

/**
 * Parse `places.md` into a typed `Place[]`, joining each row against the
 * geocoded cache. Coordinates and city boundaries are deliberately *not* in
 * the markdown — they're looked up by city name so the user only types names.
 */
function parsePlacesMarkdown(md: string): Place[] {
  const places: Place[] = [];
  const seen = new Set<string>();
  const lines = md.split(/\r?\n/);

  let currentType: PlaceType | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Section heading: `## Lived` / `## Traveled` opens a section; any other
    // `## ` heading (e.g. `## Format`) closes it.
    if (line.startsWith('## ')) {
      const m = /^##\s+(Lived|Traveled)\s*$/i.exec(line);
      currentType = m ? (m[1].toLowerCase() as PlaceType) : null;
      continue;
    }

    if (!currentType) continue;
    if (!line.startsWith('|')) continue;

    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length === 0) continue;

    // Skip header (`| City | ... |`) and separator (`|---|---|`).
    const first = cells[0].toLowerCase();
    if (first === 'city') continue;
    if (/^:?-+:?$/.test(first)) continue;

    const [name, yearsRaw, noteRaw] = cells;
    if (!name) continue;

    // Dedupe — a city listed twice (or in both sections) becomes one marker.
    // The first occurrence wins, matching reading order.
    if (seen.has(name)) {
      console.warn(`[places] Duplicate entry for "${name}" ignored.`);
      continue;
    }
    seen.add(name);

    const entry = CACHE[name];
    if (!entry) {
      console.warn(`[places] No cached data for "${name}". Run \`npm run geocode\` to resolve.`);
      continue;
    }

    const place: Place = {
      name,
      coordinates: entry.coords,
      type: currentType,
    };
    if (entry.boundary) place.boundary = entry.boundary;
    if (yearsRaw) place.visited = yearsRaw;
    if (noteRaw) place.note = noteRaw;

    places.push(place);
  }

  return places;
}

/**
 * Pull the latest year out of a `Years` cell so places can be sorted
 * chronologically. Handles:
 *   - "2024"           → 2024
 *   - "2018–2020"      → 2020 (en/em/hyphen all accepted)
 *   - "2020–present"   → current calendar year
 *   - "" / undefined   → -Infinity (sorts to the bottom)
 */
function latestYear(visited: string | undefined): number {
  if (!visited) return -Infinity;
  const years = (visited.match(/\d{4}/g) ?? []).map(Number);
  const presentYear = /present/i.test(visited) ? new Date().getFullYear() : -Infinity;
  const max = Math.max(presentYear, ...(years.length ? years : [-Infinity]));
  return Number.isFinite(max) ? max : -Infinity;
}

const parsed = parsePlacesMarkdown(placesMarkdown);

// Group by type (lived before traveled), then within each group sort by most
// recent year first. Array.prototype.sort is stable, so cities sharing both
// type and year retain their markdown order.
const TYPE_ORDER: Record<Place['type'], number> = { lived: 0, traveled: 1 };
parsed.sort((a, b) => {
  const typeDelta = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
  if (typeDelta !== 0) return typeDelta;
  return latestYear(b.visited) - latestYear(a.visited);
});

export const places: Place[] = parsed;
