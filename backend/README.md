# Backend (Medusa)

Medusa commerce backend. It is the data source the storefront (`storefront/`) fetches products and categories from at build time — the storefront cannot build without this running and reachable. There's no online checkout; the storefront links out to Zalo/phone instead.

## Local setup

Prerequisites: Node 20+, PostgreSQL 15+, pnpm 10+.

```bash
pnpm install
cp apps/backend/.env.template apps/backend/.env
```

Set `DATABASE_URL` in `apps/backend/.env`, then:

```bash
cd apps/backend
pnpm medusa db:migrate
pnpm medusa user -e admin@test.com -p supersecret
pnpm dev
```

Admin dashboard: `http://localhost:9000/app`. Add at least one region, category, and product before running the storefront — see the root [README.md](../README.md).

See [Medusa docs](https://docs.medusajs.com) for further configuration.
