# ICAADA website

Website and admin workspace for the **Initiative for Community Action Against Drug Abuse (ICAADA)**, a community-focused platform for collective action against drug abuse across Northern Nigeria. Live at [icaada.com.ng](https://www.icaada.com.ng).

- **Public site:** about, our work, team, events, news, media, get involved and contact. Content is served from the database and pre-rendered; changes published in the admin appear immediately.
- **Admin workspace** (`/admin`): editors manage team, events, media, voices, news, programs and partners through a draft → review → published workflow, triage contact messages and volunteer applications, and manage newsletter subscribers. Administrators also manage users and workspace settings.

## Stack

Next.js 16 (App Router, React 19, React Compiler) · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL · JWT sessions backed by a `Session` table · Zod · Cloudinary (media) · Postmark (email) · pnpm.

## Getting started

```bash
pnpm install                 # also generates the Prisma client
cp .env.example .env         # fill in the database URLs, SESSION_SECRET and Cloudinary keys
pnpm prisma migrate deploy   # create the tables
pnpm prisma db seed          # admin + editor accounts and the initial site content
pnpm dev                     # http://localhost:3000 (admin at /admin)
```

The seed creates `admin@example.org` and `editor@example.org` with development passwords unless you set the `SEED_*` variables (see `.env.example`). Without `POSTMARK_SERVER_TOKEN`, emails such as invites and password resets are printed to the terminal instead of sent.

To run a disposable local database without installing Postgres, use `pnpm prisma dev` and set `DATABASE_POOL_MAX=1`.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Next.js dev server, production build, production server. The build pre-renders pages from the database, so it needs the env vars and a migrated database |
| `pnpm lint` | ESLint (Next core-web-vitals + TypeScript) |
| `pnpm db:migrate` | `prisma migrate dev`: create a migration after changing `prisma/schema.prisma` |
| `pnpm db:deploy` | `prisma migrate deploy`: apply migrations (run before deploying schema changes) |
| `pnpm db:seed` | Idempotent seed: never overwrites existing accounts or content |
| `pnpm db:studio` | Browse the database |

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md): structure, data model, API, auth, caching, email, and how to add a content module.
- [`BRAND.md`](./BRAND.md): colours, typography, components and voice.
- [`AGENTS.md`](./AGENTS.md): notes for AI coding agents (this Next.js version differs from older ones).
