#!/usr/bin/env node
// Geocode + boundary resolver for src/data/places.md.
//
// For each city listed in places.md this script asks Nominatim for:
//   - coordinates (lon, lat)
//   - administrative boundary polygon (simplified via Douglas-Peucker)
// and writes both into src/data/places.cache.json. The cache is committed
// to the repo so visitors don't pay a runtime geocode cost.
//
// Runs automatically before `npm run dev` and `npm run build`. Idempotent —
// already-cached cities are skipped. If the network is unreachable, the
// script warns and exits 0 so dev still boots with whatever is cached.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MD_PATH = path.join(ROOT, 'src/data/places.md');
const CACHE_PATH = path.join(ROOT, 'src/data/places.cache.json');

// Nominatim usage policy: <= 1 req/sec, descriptive UA.
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'persona-site-geocoder/1.0 (personal site build script)';
const REQUEST_DELAY_MS = 1100;

// Douglas-Peucker threshold in degrees. 0.01° ≈ 1.1 km at the equator —
// plenty of detail for a city outline on a small-scale map, and keeps the
// average boundary under ~10 KB.
const POLYGON_THRESHOLD = 0.01;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Pull city names from the first column of every table row under a
 * `## Lived` or `## Traveled` heading.
 */
function extractCityNames(md) {
  const names = [];
  let inSection = false;

  for (const rawLine of md.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    if (/^##\s+(Lived|Traveled)\s*$/i.test(line)) {
      inSection = true;
      continue;
    }
    if (line.startsWith('## ')) {
      inSection = false;
      continue;
    }
    if (!inSection || !line.startsWith('|')) continue;

    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length === 0) continue;

    const first = cells[0];
    if (!first) continue;
    if (first.toLowerCase() === 'city') continue;
    if (/^:?-+:?$/.test(first)) continue;

    names.push(first);
  }

  return names;
}

async function geocode(name) {
  const params = new URLSearchParams({
    q: name,
    format: 'json',
    limit: '1',
    polygon_geojson: '1',
    polygon_threshold: String(POLYGON_THRESHOLD),
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const hit = data[0];
  const coords = [Number(hit.lon), Number(hit.lat)];
  const geo = hit.geojson;
  // Only keep polygonal boundaries; many cities geocode to a Point, which
  // we already represent with the marker.
  const boundary =
    geo && (geo.type === 'Polygon' || geo.type === 'MultiPolygon') ? geo : null;

  return { coords, boundary };
}

async function main() {
  if (!fs.existsSync(MD_PATH)) {
    console.warn(`[geocode] ${MD_PATH} not found, skipping.`);
    return;
  }

  const md = fs.readFileSync(MD_PATH, 'utf-8');
  const cache = fs.existsSync(CACHE_PATH)
    ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))
    : {};

  const names = extractCityNames(md);

  // Entries are "missing" either because they don't exist or because they
  // pre-date the boundary-fetch feature (no `boundary` key on the record).
  const missing = names.filter((n) => !cache[n] || !('boundary' in cache[n]));

  // Drop cache entries that are no longer referenced.
  const known = new Set(names);
  let removed = 0;
  for (const cached of Object.keys(cache)) {
    if (!known.has(cached)) {
      delete cache[cached];
      removed++;
    }
  }
  if (removed > 0) console.log(`[geocode] Pruned ${removed} stale cache entries.`);

  if (missing.length === 0) {
    if (removed > 0) writeCache(cache);
    console.log('[geocode] All cities cached.');
    return;
  }

  console.log(`[geocode] Resolving ${missing.length} cit${missing.length === 1 ? 'y' : 'ies'} (coords + boundary)…`);

  let failures = 0;
  let withBoundary = 0;
  for (let i = 0; i < missing.length; i++) {
    const name = missing[i];
    if (i > 0) await sleep(REQUEST_DELAY_MS);
    try {
      const result = await geocode(name);
      if (!result) {
        console.warn(`[geocode] No result for "${name}". Try a more specific name (e.g. "City, Country").`);
        failures++;
        continue;
      }
      cache[name] = result;
      const { coords, boundary } = result;
      const tag = boundary ? '(with boundary)' : '(point only)';
      if (boundary) withBoundary++;
      console.log(`[geocode]   ${name} → [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}] ${tag}`);
    } catch (err) {
      console.warn(`[geocode] Failed for "${name}": ${err.message}`);
      failures++;
    }
  }

  writeCache(cache);
  console.log(`[geocode] Done. ${missing.length - failures} resolved (${withBoundary} with boundary), ${failures} failed.`);
}

function writeCache(cache) {
  // Sort keys so diffs stay reviewable.
  const sorted = Object.fromEntries(
    Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

main().catch((err) => {
  console.warn(`[geocode] Unrecoverable error, continuing with existing cache: ${err.message}`);
});
