# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

IFES X is a web-based management system for German public-transit (ÖPNV) timetable data following the **VDV 451/452** standard. It provides CRUD for all VDV data entities plus GTFS and VDV `.x10` import/export. The domain language is German: entity names, fields (`ORT_NR`, `LI_NR`, `FRT_FID`, …), UI labels, and commit messages are all in German. Match this when writing new code or commits.

Stack: Angular 19 + PrimeNG + Tailwind frontend; Express + TypeScript + Sequelize (sequelize-typescript) + SQLite backend, run directly via `tsx` (no build step in dev).

## Commands

### Backend (`cd backend`)
- `npm run dev` — dev server with watch (runs `tsx watch src/app.ts`), serves on port 3000
- `npm start` — run once via `tsx` (no watch)
- `npm run build` — `tsc` compile to `dist/` (used only for production Docker image)
- No test runner is configured (`npm test` is a stub that exits 1).

### Frontend (`cd frontend`)
- `npm start` — `ng serve` dev server on port 4200; `proxy.conf.json` proxies `/api` → `http://localhost:3000`
- `npm run build` — production build (output goes to `dist/ifesx-frontend`, which is served as the backend's `public/` folder)
- `npm run watch` — build in watch mode (used inside Docker to write into the shared `public/` volume)
- `npm test` — Karma + Jasmine. Run a single spec by temporarily setting `fdescribe`/`fit`, or scope via the Karma config; specs live next to sources as `*.spec.ts`.

### Docker
- `docker-compose up` — dev: backend + frontend with hot reload; frontend build output is shared into backend via the `./public` volume.
- `Dockerfile.prod` / `docker-compose.prod.yml` — multi-stage prod build: builds frontend, builds backend (`tsc`), then a single Node image runs `dist/app.js` and serves the built frontend from `public/`.

## Architecture

### Backend request flow
- **Single entry point `backend/src/app.ts`** wires *all* routes inline — there is no separate `routes/` directory. Controllers are instantiated at the top of `app.ts` and their methods bound to `express.Router()` instances, then mounted under `/api`. To add an endpoint, register it in `app.ts` and add the handler to the relevant controller in `backend/src/controllers/`.
- Route prefixes: `/api/vdv/*` (the bulk of entities), `/api/lines`, `/api/destinations`, `/api/calendar`, `/api/basis` (BasisVersionen), `/api/gtfs`, `/api/kursblatt`, `/api/vdv/api-docs` (Swagger UI).
- The Express app also serves the built SPA from `../public` with a catch-all `*` route returning `index.html`.

### Database / models
- **`backend/src/config/database.ts`** constructs the Sequelize instance and registers every model. **Any new model MUST be added to the `models: [...]` array here** or it won't be synced or usable.
- Schema is managed by `sequelize.sync({ alter: { drop: false } })` at startup — there are no formal migrations in the normal flow (one-off scripts exist in `backend/src/scripts/`). Adding a column to a model and restarting will alter the table; it will not drop columns.
- DB file path comes from `process.env.DB_FILE` (default `data/timetable.sqlite3`). Note `.env` sets `timetable.sqlite3`; there are several stray `*.sqlite3` files in the repo — confirm which DB is active before assuming data location.
- Models live in `backend/src/models/VDV/` and map directly to VDV 452 tables (`RecOrt`=REC_ORT, `RecHp`=REC_HP, `RecLid`=REC_LID, `LidVerlauf`=LID_VERLAUF, `RecFrt`=REC_FRT, `RecUms`=REC_UMS, `RecSel`=REC_SEL, etc.). See `README.md` for a full field-level reference of the VDV data model.

### Composite keys & cascading updates (important)
- Most VDV entities use **composite primary keys**, almost always including `BASIS_VERSION` plus the entity key(s) — e.g. trips are keyed by `(basisVersion, frtFid)`, route stops by `(LI_NR, STR_LI_VAR, LI_LFD_NR)`, sections by `(ortNr, selZiel)`. Routes reflect this with multi-param paths like `/rec-frt/:basisVersion/:frtFid` and `/rec-sel/:ortNr/:selZiel`.
- `BASIS_VERSION` is the versioning dimension — multiple dataset versions coexist; queries are normally scoped by it.
- Changing a primary key (e.g. `LI_NR`) requires **transactional cascading updates** across dependent tables (`LID_VERLAUF`, `REC_FRT`, `REC_UMS`). This is handled by dedicated endpoints such as `PUT /api/lines/:oldId/change-id` (`LineController.updateLineIdCascade`). Don't naively update a PK column.

### GTFS import (worker threads)
- `GTFSController` spawns the import as a **Node worker thread** so the HTTP request returns immediately and progress is streamed.
- Worker path resolution is environment-dependent: in production it loads the compiled `../workers/gtfs-import.worker.js`; in dev it loads `import-wrapper.js`, which registers `tsx/cjs` and then requires the `.ts` worker. If you edit `gtfs-import.worker.ts`, the dev wrapper picks it up via tsx — no separate build needed.
- The GTFS importer enriches inter-stop distances by calling the external **EFA API** (`westfalenfahrplan.de`), with a Haversine fallback. This makes imports hit the network.

### VDV `.x10` import/export
- `backend/src/utils/vdv-parser.ts` parses the VDV 451/452 ASCII exchange format (semicolon-delimited, with `mod`/`tbl`/`atr`/`frm`/`rec` command lines). Files are **ISO-8859-1 encoded** — preserve this encoding on both import and export.
- `VdvImportController` exposes `/api/vdv/import-x10`, `/analyze-x10`, `/export-x10/:tableName`, and `/tables`.

### Frontend
- Angular **standalone components** (no NgModules). Routes are in `frontend/src/app/app.routes.ts`; larger/detail views use lazy `loadComponent`. Everything renders inside `MainLayoutComponent` (sidebar + main).
- Components follow a consistent `*-list` / `*-detail` pairing per entity under `frontend/src/app/components/`.
- HTTP access is via per-entity services in `frontend/src/app/services/`, each holding a relative `apiUrl = '/api/...'` (relative so the dev proxy and prod static-serving both work). Add a new service alongside these rather than hardcoding URLs in components.
- UI uses PrimeNG components, Tailwind utility classes, FontAwesome icons, and Leaflet (`@asymmetrik/ngx-leaflet`) for the network map editor.

## Conventions & gotchas
- The repo root contains ad-hoc helper/migration scripts (`frontend/*.js` like `fix_icons.js`, `backend/debug_*.ts`, `backend/src/scripts/migrate-*.ts`) and committed build artifacts in `public/`. These are not part of the app runtime — don't treat them as architecture.
- New entities require touching three places: the model file, the `models: []` array in `database.ts`, and route wiring in `app.ts` (plus a frontend service + components if it needs UI).
- Swagger docs are generated from JSDoc on routes (`swagger-jsdoc`); served at `/api/vdv/api-docs`.
</content>
</invoke>
