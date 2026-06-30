# Persona - Personal Website

## Tech Stack

- **Framework**: Vite + React + TypeScript
- **Animation**: Motion (formerly Framer Motion)
- **3D/WebGL**: Three.js (installed, ready for future use)
- **Styling**: CSS Modules with CSS variables
- **Deployment target**: GitHub Pages (static build)

## Design Direction

**Aesthetic**: Editorial Atelier — gallery catalog sophistication meets warm bookshelf intimacy.

**Color Philosophy**:
- Neutral foundation: warm paper tones (`#F7F6F3`)
- Pastel accents (pigment-rich but soft, not candy-bright):
  - Entry: warm cream `#F5F0E8` / `#EDE5D8`
  - Systems (tech): muted blue `#A8C5E2` / `#7BA3CC`
  - Words (literature): soft coral `#E2A8A8` / `#CC7B7B`
  - Visuals (art): dusty pink `#E2C5D8` / `#CC9FBA`

**Typography**:
- Display: Cormorant Garamond (elegant serif)
- Body: DM Sans (clean sans-serif)

**Interaction**: Category hover shifts entire page atmosphere via gradient background and floating accent shape.

## Project Structure

```
src/
├── components/       # React components with CSS modules
├── styles/           # Global CSS and variables
├── hooks/            # Custom React hooks (future)
├── types.ts          # TypeScript types and category config
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build to dist/
npm run preview  # Preview production build
```
