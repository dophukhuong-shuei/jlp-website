# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vietnamese-market Japanese-cosmetics catalog site. Two independent apps in one repo:

```
backend/     Medusa v2 (2.19.0) commerce backend — Turborepo, npm workspaces
storefront/  Astro 7 site — static output, fetches everything from Medusa at BUILD time
docker-compose.yml   Postgres + Redis for local backend dev
docs/                Design/assessment docs (not code)
```

There is **no online checkout**. The storefront links out to Zalo/phone for orders — this is intentional, not a missing feature. Medusa is used purely as a headless product catalog + admin dashboard.

**The storefront cannot build without a reachable Medusa backend.** Product/category data is fetched in `getStaticPaths()`/frontmatter at build time (see `storefront/src/lib/medusa.ts`), not at runtime. There is no mock/fallback data path. Deploy or run the backend first.

## Commands

### Local infra
```bash
docker compose up -d          # Postgres + Redis, from repo root
```

### Backend (`backend/apps/backend`, Medusa)
```bash
cd backend/apps/backend
npm run dev                   # medusa develop — http://localhost:9000, admin at /app
npm run build                 # medusa build
npm run start                 # medusa start (run build first)
npm run lint                  # medusa lint — must pass @medusajs/eslint-plugin recommended
npx medusa db:migrate
npx medusa user -e admin@example.com -p <password>
```
Tests (Jest, needs a live Postgres):
```bash
npm run test:unit                       # **/src/**/__tests__/**/*.unit.spec.ts
npm run test:integration:modules        # **/src/modules/*/__tests__/**
npm run test:integration:http           # **/integration-tests/http/*.spec.ts
npm run test:unit -- path/to.spec.ts    # single file
npm run test:unit -- -t "test name"     # single test by name
```
Package manager is **npm** here (root `backend/package.json` pins `npm@11.7.0`), even though `backend/AGENTS.md` shows generic pnpm examples — don't introduce a second lockfile.

### Storefront (`storefront/`, Astro)
```bash
cd storefront
npm run dev      # astro dev — http://localhost:4321 (background mode: astro dev --background / stop / status / logs)
npm run build    # astro build -> dist/
npm run preview
```
No test suite exists for the storefront.

Required env (`storefront/.env`, see `.env.example`):
```
MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=pk_...   # Medusa Admin → Settings → Publishable API Keys
```

**After importing/editing products in Medusa Admin while `astro dev` is already running, restart the storefront dev server** (`astro dev stop && astro dev --background`) — `getStaticPaths()` snapshots the product list once at server start and does not pick up new products from a live backend automatically.

## Architecture

### Data flow
`Medusa (Postgres) → storefront/src/lib/medusa.ts (fetch + toCatalogItem() normalization) → Astro pages (build-time) → static HTML`

All product-facing fields the UI reads — brand, JAN code, volume, origin, lot, cosmetic license number (`cbmp`), skin type, extra attributes, on-sale flag, gift note — come from a product's **Medusa `metadata`**, not dedicated schema fields. `toCatalogItem()` in `medusa.ts` is the single place that reads this metadata; a missing field is hidden in the UI, never guessed or defaulted.

### Storefront layout
```
storefront/src/
├── lib/
│   ├── medusa.ts   Medusa SDK client, getAllProducts/getCategories, toCatalogItem() (CatalogItem shape)
│   └── site.ts     Shop info (name, phone, Zalo, address) — placeholder values, replace before launch
├── components/
│   ├── Layout.astro       header/nav/footer, dark/light toggle, Google-Translate-based i18n widget
│   ├── ProductCard.astro
│   └── LabelStrip.astro   JAN barcode + metadata strip shown on cards and detail pages
└── pages/
    ├── index.astro
    ├── about.astro
    ├── promotions.astro
    ├── categories/[handle].astro
    ├── products/[handle].astro
    └── search-index.json.ts   build-time JSON product index consumed by client-side search in Layout.astro
```
Route/anchor naming is deliberately English (`/promotions/`, `/categories/`, `#featured`, `#new-arrivals`, etc.), not unaccented Vietnamese — keep new routes/anchors consistent with that.

### Backend: supplier product import
`backend/apps/backend/src/api/admin/import-supplier/route.ts` is a **custom Medusa admin API route** (registered via `src/api/middlewares.ts` with multer for file upload) that lets non-technical users import a supplier's raw Excel export directly from a custom Admin UI page (`src/admin/routes/import-hang/page.tsx`) — no need to match Medusa's own CSV import template. It:
- reads the `Product Information` + `Product attributes` sheets (SPU-keyed),
- tries multiple column-name fallbacks for title/price (different suppliers use different export schemas — e.g. Sisley has an English name column and `Selling price(shein-jp_JPY)`, Melvita has neither and uses `price`),
- maps English category names to the 6 fixed Vietnamese categories via `CATEGORY_MAP`,
- converts JPY → VND at a configurable rate,
- dedupes by `metadata.source_spu` so re-running the same file is a no-op,
- calls `createProductsWorkflow` directly (not an HTTP round-trip).

`backend/import-sisley.js` is the original one-off Node script this route was generalized from; kept for reference.

### Backend conventions (from `backend/AGENTS.md`)
- Routing is file-based under `src/api/`; don't hand-register routes.
- Business logic belongs in **workflows**, not route handlers.
- No semicolons, double quotes, 2-space indent; kebab-case files, PascalCase types, camelCase functions/vars, snake_case DB columns.
- Editing a custom module's model requires `npx medusa db:generate <module>` or the migration is silently missing.
- `apps/backend/.medusa/`, `dist/`, `.turbo/` are regenerated build output — don't hand-edit.
- `.env` — never print/commit; document new vars in `.env.template` instead.
