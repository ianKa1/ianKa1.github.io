# Persona - Personal Website

## Tech Stack

- **Framework**: Vite + React 19 + TypeScript
- **Animation**: Motion (formerly Framer Motion)
- **Maps**: MapLibre GL + react-map-gl (Traces section)
- **Markdown**: react-markdown + remark-math + rehype-katex (LaTeX support)
- **3D/WebGL**: Three.js (installed, currently unused)
- **Styling**: CSS Modules with CSS variables (`src/styles/variables.css`)
- **Linting**: oxlint
- **Deployment target**: GitHub Pages (static build, base `/`)

## Commands

```bash
npm run dev      # Start dev server (runs geocode script first via predev)
npm run build    # tsc -b && vite build → dist/ (runs geocode first via prebuild)
npm run preview  # Preview production build
npm run lint     # oxlint
npm run geocode  # Manually re-geocode places (scripts/geocode.mjs → Nominatim)
```

## Design Direction

**Aesthetic**: Editorial Atelier — gallery catalog sophistication meets warm bookshelf intimacy.

**Color Philosophy** (defined in `src/styles/variables.css`):
- Neutral foundation: warm paper tones (`#F7F6F3`), dark text `#2C2C2C`
- Pastel accents (pigment-rich but soft, not candy-bright):
  - Entry: warm cream `#F5F0E8` / `#EDE5D8`
  - Tech: muted blue `#A8C5E2` / `#7BA3CC`
  - Words: soft coral `#E2B0B0` / `#C45C5C`
  - Visuals: dusty pink `#E2C5D8` / `#CC9FBA`
  - Traces: neutral gray `#A3A3A3` / `#4A4A4A`

**Typography**:
- Display: Cormorant Garamond (`--font-display`)
- Body: DM Sans (`--font-body`)

**Interaction**: Category hover shifts entire page atmosphere via gradient background (`AmbientBackground`).

## Project Structure

```
src/
├── App.tsx               # Mounts Navigation, AmbientBackground, SectionRouter; stale-slug cleanup
├── main.tsx              # Entry point
├── types.ts              # Category type + CATEGORIES config (label, number, colors)
├── components/           # Shared UI: Navigation (sidebar), AmbientBackground
├── content/              # SectionRouter (switches on category), SectionShell (layout wrapper)
├── routing/              # Hash routing: useHashRoute hook, parseHash/formatHash, slug utils
├── sections/
│   ├── entry/            # Landing page
│   ├── tech/             # Project grid → ProjectCard → ProjectDetail
│   ├── words/            # Article cards + reader view
│   ├── visuals/          # Image/video gallery
│   └── traces/           # MapLibre map + places list
├── data/                 # Content loaders + content itself (see below)
└── styles/               # global.css, variables.css
scripts/geocode.mjs       # Pre-dev/build: geocodes places.md via Nominatim → places.cache.json
```

## Routing

Hash-based routing: `#/<category>[/<slug>]` (e.g., `#/tech/project-4`, `#/words/my-article`, `#/traces/tokyo`).
- `useHashRoute()` (`src/routing/useHashRoute.ts`) uses `useSyncExternalStore` on `window.location.hash`
- `SectionRouter` mounts the section for `route.category`; empty hash normalized to `#/` via replaceState
- App.tsx rewrites URLs with stale slugs (deleted project/article/place) back to the section root

## Content Data Model

All content lives in `src/data/` and is loaded at build time via `import.meta.glob()`.

### Projects (`src/data/projects.ts` + `src/data/projects/<dir>/`)

One directory per project containing `project.md` plus colocated media (relative image paths in markdown are rewritten to Vite URLs). `project.md` format:

```
Title: <required>
Subtitle: <optional>
Year: <optional YYYY>
Tags: <optional, comma-separated>
Thumbnail: <required filename>
ThumbnailType: image | video   (auto-detected if omitted)
Cover: <optional still image shown at rest; video plays on card hover>

## Section Heading
Markdown body...
```

- Metadata is `Key: value` lines until the first blank line; body split into sections on `## ` headings
- HTML comments are stripped (use to hide drafts)
- Sort order: Year descending, then directory name ascending

### Articles (`src/data/articles.ts` + `src/data/articles/*.md`)

- Metadata: `Title`, `Date` (YYYY-MM-DD), `Reading` (e.g. "8 min"), `Link` (optional external URL)
- Body split on a lone `---` into excerpt (card preview) + full body (reader view)
- Files starting with `_` are excluded; slug auto-generated from title

### Places (`src/data/places.md` + `places.cache.json`)

- Markdown tables under `## Lived` and `## Traveled` (columns: City | Years | Note)
- `scripts/geocode.mjs` resolves coordinates/boundaries via Nominatim; cache is committed so there is no runtime geocoding

### Visuals (`src/data/visuals.ts`)

Static array of `{ src, alt, caption?, type? }`; media hosted in `public/images/visuals/`.

## Conventions

- Every component has a colocated `.module.css`; shared design tokens only in `variables.css`
- Categories are configured in one place: `CATEGORIES` in `src/types.ts` (id, label, number, color, colorDeep)
- Section naming: the tech section was formerly called "Systems" — use "Tech" everywhere
