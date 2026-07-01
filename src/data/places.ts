import type { MultiPolygon, Polygon } from 'geojson';
// Vite's `?raw` suffix imports the markdown contents as a string at build time.
import placesMarkdown from './places.md?raw';
// Coord + boundary cache populated by `scripts/geocode.mjs` from Nominatim.
import placeCache from './places.cache.json';

export interface Place {
  /** Full display name as written in `places.md`, e.g. `"Paris, France"`. */
  name: string;
  /** City half of `name` — everything before the last `, `. Falls back to
   *  `name` when there's no comma (e.g. `"Monaco"`). */
  city: string;
  /** Country half of `name` — everything after the last `, `. Falls back
   *  to `name` for city-state entries without a comma. Used to group the
   *  place list by country. */
  country: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'lived' | 'traveled';
  visited?: string;
  note?: string;
  // Optional admin boundary polygon (city/district) used to shade the area
  // on the map. Populated by `scripts/geocode.mjs` from Nominatim.
  boundary?: Polygon | MultiPolygon;
}

export interface PlaceGroup {
  country: string;
  places: Place[];
}

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

    // Split on the *last* comma so `Washington, D.C., USA` still works.
    // City-state entries without a comma (e.g. `Monaco`) fall through as
    // both city and country.
    const commaIdx = name.lastIndexOf(', ');
    const city = commaIdx >= 0 ? name.slice(0, commaIdx).trim() : name;
    const country = commaIdx >= 0 ? name.slice(commaIdx + 2).trim() : name;

    const place: Place = {
      name,
      city,
      country,
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

/**
 * Countries with their places, in first-appearance order (so countries
 * containing any lived place naturally lead — the Lived section is parsed
 * first). Within each country, `lived` places come before `traveled`, and
 * then by most recent year.
 *
 * The place list in the Traces UI is rendered from this instead of the flat
 * `places` array so the same city always sits under its country header.
 */
const groupMap = new Map<string, Place[]>();
for (const p of parsed) {
  const bucket = groupMap.get(p.country);
  if (bucket) bucket.push(p);
  else groupMap.set(p.country, [p]);
}
export const placeGroups: PlaceGroup[] = Array.from(groupMap, ([country, places]) => ({
  country,
  places,
}));
