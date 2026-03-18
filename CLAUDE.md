# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gakumas Tools is a web application for the Gakuen Idolmaster game, providing calculators, simulators, and management tools for producers. It's a Yarn 4 monorepo with a Next.js 16 web app and shared packages.

## Commands

```bash
# Development
yarn install          # Install dependencies
yarn dev              # Start Next.js dev server (localhost:3000)
yarn build            # Production build (standalone output)

# Linting
yarn workspace gakumas-tools lint   # ESLint (next/core-web-vitals)

# Data generation (requires Python)
yarn generate         # Pull game data, generate JSON from CSV, generate images

# Run a specific workspace script
yarn workspace <name> <script>
# e.g. yarn workspace gakumas-data generate
```

There are no test suites in this project.

## Monorepo Structure

- **`gakumas-tools/`** — Main Next.js 16 web app (React 19, App Router)
- **`packages/gakumas-data/`** — Game data as JS classes + generated JSON from CSV. Contains the effects DSL (see `Effects.md`)
- **`packages/gakumas-engine/`** — Contest simulation engine (depends on gakumas-data)
- **`packages/gakumas-images/`** — Auto-generated image imports organized by entity type

## Architecture

### State Management
The app uses React Context extensively. The root layout (`gakumas-tools/app/[locale]/layout.js`) nests ~11 context providers (DataContext, LoadoutContext, SearchContext, MemoryContext, etc.). State flows through these contexts rather than a centralized store.

### Key Architectural Patterns
- **Web Workers**: Contest simulation runs in a Web Worker (`gakumas-tools/simulator/worker.js`) to avoid blocking the UI
- **Custom Webpack image loader**: Replaces Next.js default image handling (`gakumas-tools/loaders/imageLoader.js`); images served from `gkimg.unoeins.org`
- **URL state serialization**: `LoadoutUrlContext` encodes complex loadout state into shareable URL parameters
- **ONNX inference**: Parameter estimation uses ML models via `onnxruntime-web`
- **OCR**: Screenshot analysis via `tesseract.js` for importing game data from images

### Engine Architecture (packages/gakumas-engine)
The contest simulation engine uses a component-based design:
- `StageEngine` orchestrates the simulation
- `TurnManager`, `CardManager`, `BuffManager`, `EffectManager` handle specific domains
- `Executor` processes effect actions
- `strategies/` contains card selection AI strategies

### Effects DSL (packages/gakumas-data)
Game effects use a custom string format: `phase,condition,action;phase,action`. See `packages/gakumas-data/Effects.md` for full documentation.

### Internationalization
- 4 locales: `ja` (default), `en`, `zh-Hans`, `ko`
- Uses `next-intl` with locale-prefixed routes (`localePrefix: "as-needed"`)
- Translation files in `gakumas-tools/messages/`
- Navigation helpers exported from `gakumas-tools/i18n/routing.js`

### Data Pipeline
CSV source files → Python scripts (`packages/gakumas-data/scripts/csv_to_json`) → JSON data files → JS data classes. The JSON files in `packages/gakumas-data/json/` are large single-line files — do not attempt to read them fully.

### Path Aliases
`@/*` maps to the `gakumas-tools/` directory root (configured in `jsconfig.json`).

### API Routes
Located in `gakumas-tools/app/api/`:
- `auth/` — NextAuth with MongoDB sessions
- `memory/` — User memory CRUD
- `loadout/` — Loadout management
- `preview/` — Preview image generation

### Database
MongoDB for user data persistence (memories, loadouts, sessions).

## Deployment
Docker multi-stage build → Docker Hub → Render.com webhook. CI via GitHub Actions on push to `master`.
