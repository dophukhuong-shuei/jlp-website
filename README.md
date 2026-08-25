# JLB/JLP — Japanese Cosmetics Catalog

Product showcase site, no online checkout. Orders are closed via Zalo or phone.

The storefront is a static Astro site whose pages — home, category, product, promotions — are generated at **build time** from a Medusa backend. Medusa is the single source of truth for products, categories, and pricing; there is no markdown/CMS content layer.

## How it fits together

```
backend/     Medusa v2 commerce backend (product/category data, admin dashboard)
storefront/  Astro site — fetches everything from Medusa at build time, deploys as static HTML
```

Because product data is fetched at build time (see `storefront/src/lib/medusa.ts`), **the storefront cannot build without a reachable Medusa backend**. There is no fallback or mock data path — if Medusa is down or empty, `astro build` fails or produces an empty catalog.

## Running locally

**1. Start the backend** (see [backend/README.md](backend/README.md) for full setup — needs PostgreSQL):

```bash
cd backend/apps/backend
pnpm dev
```

Backend runs at `http://localhost:9000`. Log into the admin at `http://localhost:9000/app`, add at least one region, category, and product, and grab a publishable API key under Settings.

**2. Start the storefront**, pointing it at the backend:

```bash
cd storefront
npm install
```

Create `storefront/.env` from `.env.example` and set:

```
MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=pk_...
```

```bash
npm run dev
```

Site: http://localhost:4321. Requires Node `>=22.12.0`.

## Architecture

```
storefront/src/
├── lib/
│   ├── medusa.ts            All Medusa fetching + mapping to CatalogItem. Single source of truth.
│   └── site.ts              Shop info (name, phone, Zalo, address). Placeholder values — replace before launch.
├── components/
│   ├── ProductCard.astro
│   └── Layout.astro
└── pages/
    ├── index.astro
    ├── about.astro
    ├── promotions.astro
    ├── categories/[handle].astro
    ├── products/[handle].astro
    └── search-index.json.ts
```

Product fields the UI reads (brand, JAN, volume, origin, lot, license number, skin type, attributes) come from each product's **metadata** in Medusa Admin — see `toCatalogItem()` in `medusa.ts`. A missing field is simply hidden, never guessed.

`storefront/src/lib/site.ts` still has placeholder phone/address/email — replace before launch.

## Deploying

**Backend (Medusa)** needs a long-running Node process + PostgreSQL — it can't be hosted as static files. See [backend/README.md](backend/README.md).

**Storefront** builds to static HTML and deploys to Cloudflare Pages:

```
Framework preset:  Astro
Build command:     npm run build
Output directory:  dist
Node version:      22 (env var NODE_VERSION=22)
Env vars:          MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY
```

Deploy the backend first — the storefront build will fail without a reachable `MEDUSA_BACKEND_URL` that has at least one region/category/product. Cloudflare Pages' free tier allows commercial use and doesn't charge for bandwidth.

Don't use Vercel Hobby for this site — Vercel's ToS restricts Hobby to non-commercial use.

## Technical notes

**Fonts.** Vietnamese diacritics must render correctly — test `ề ữ ỡ ặ` before swapping any display font; many fonts lack a Vietnamese subset.

**Prices.** Medusa returns calculated prices as integers in the smallest currency unit; VND has no subunit, so `calculated_amount` is the VND value directly. Format at render time, don't pre-format strings.

**No online checkout by design.** The site links out to Zalo/phone instead of a cart+payment flow — this is intentional, not a missing feature.

## Not implemented yet

- Client-side search using `search-index.json.ts` (Pagefind or similar)
- Price/ml comparison page across similar products
- "Leave your number, we'll call back" form
- Lookup page linking cosmetic license numbers to the Drug Administration portal
