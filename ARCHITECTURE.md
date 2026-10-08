# ICAADA — Architecture

This document describes how the ICAADA web application is structured, how data and rendering flow through it, and the reasons behind its current design. For visual identity and tooling, see [`BRAND.md`](./BRAND.md).

> **Framework note:** the app runs **Next.js 16.3.3**. Its APIs and conventions differ from older versions, so read `node_modules/next/dist/docs/` before changing routing, rendering or config (see `AGENTS.md`).

---

## 1. System overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router  (React 19 · React Compiler · TS strict)            │
│                                                                            │
│  Public website (public)        Admin workspace /admin (session-guarded)   │
│  pages still read content.ts    client screens call /api/admin/**          │
│        │  (can call services            │                                │
│        │   directly, see §5.6)           ▼                                │
│        │                  ┌──────────────────────────────┐                 │
│        │                  │ Route Handlers  src/app/api/ │  Zod validation │
│        │                  │   ▼  auth guard (cookie/JWT) │                 │
│        └────────────────▶ │ Services  src/Services/      │  rules, DTOs,   │
│                           │   ▼                          │  activity log,  │
│                           │ Repositories src/Repositories│  revalidation   │
│                           │   ▼                          │                 │
│                           │ Prisma 7 (adapter-pg)        │                 │
│                           └──────────────┬───────────────┘                 │
└──────────────────────────────────────────┼─────────────────────────────────┘
                                           ▼
                                      PostgreSQL          Cloudinary (media;
                                                          signed direct upload)
```

- A **layered backend** (Route Handler → Guard → Service → Repository → Prisma → PostgreSQL) owns all content, inbox, newsletter, users and settings data. It mirrors the Academy LMS architecture. See §5.
- `src/data/content.ts` is still what the public pages render. The seed copies it into the database as PUBLISHED records. Swapping pages over to the services is the next step (§5.6).
- Media lives on **Cloudinary**. The database stores only URLs and public IDs, and browsers upload directly with a server-signed signature.
- The admin workspace (§6) is fully wired to the API: a server layout checks the session, and the client screens read and write through `/api/admin/**`.

---

## 2. Directory layout

```
icaada-main/
├── AGENTS.md / CLAUDE.md      Agent instructions (Next 16 warning)
├── BRAND.md / ARCHITECTURE.md Project docs
├── .env.example               Every env var, documented (copy to .env)
├── next.config.ts             reactCompiler + Cloudinary image allow-list (from CLOUDINARY_CLOUD_NAME)
├── prisma.config.ts           Prisma 7 CLI config: schema, migrations, seed, DIRECT_URL
├── prisma/
│   ├── schema.prisma          The single data model
│   ├── migrations/            SQL migrations (commit these)
│   └── seed.ts                Dev users + content.ts → PUBLISHED rows (idempotent)
├── postcss.config.mjs         Tailwind v4 PostCSS plugin
├── eslint.config.mjs          Active ESLint config (next core-web-vitals + TS)
├── eslint.config.mts          Second, generic flat config (unused by `next lint`)
├── tsconfig.json              strict, bundler resolution, @/* → src/*
├── pnpm-workspace.yaml        Allowed build scripts (prisma, bcrypt, esbuild)
├── public/                    Default Next SVGs only
└── src/
    ├── instrumentation.ts     Validates env once at server boot (fail fast)
    ├── app/
    │   ├── layout.tsx         Root <html>/<body>, metadata, globals.css
    │   ├── globals.css        ~5k lines: tokens + all component CSS
    │   ├── (public)/          Route group: public site (no URL segment)
    │   │   ├── layout.tsx     Header/nav, mobile menu, <Footer/>
    │   │   ├── page.tsx       /            Home
    │   │   └── about/ our-work/ team/ events/ media/ news/ get-involved/ contact/
    │   ├── api/               Route Handlers (see §5.3)
    │   │   ├── auth/          login · logout · me
    │   │   ├── public/        published content reads + contact/volunteer/newsletter forms
    │   │   └── admin/         guarded CRUD, inbox, newsletter, users, settings, uploads
    │   └── admin/             (auth)/login and (workspace)/… screens (see §6)
    ├── Services/              Business rules, DTOs, activity logging (*.service.ts)
    ├── Repositories/          The ONLY Prisma users (*.repository.ts)
    ├── Schemas/               Zod request schemas + domain enums (*.schema.ts)
    ├── generated/prisma/      Generated Prisma client. Git-ignored, never hand-edited
    ├── components/            (unchanged; see §4, §6)
    ├── data/
    │   └── content.ts         Static site content (pages still read it; seed source)
    ├── hooks/                 use-mobile, use-toast (shadcn)
    ├── lib/
    │   ├── env.ts             Zod-validated env (getEnv)
    │   ├── prisma.ts          Prisma client singleton (Repositories only)
    │   ├── api/               api-error · response (ok/handle) · request (parse) · content-routes
    │   ├── auth/              session (JWT) · cookies · password (bcrypt) · auth-guard
    │   ├── cache.ts           unstable_cache wrappers + revalidateContent()
    │   ├── rate-limit.ts      In-memory fixed-window limiter
    │   ├── cloudinary.ts      Upload signature helper
    │   ├── notifier.ts        Notification interface (logs for now)
    │   ├── slug.ts            slugify / uniqueSlug
    │   └── utils.ts           cn() = clsx + tailwind-merge
    └── helpers.ts             Legacy Unsplash photo map
```

---

## 3. Routing

### Route groups

| Segment | Purpose |
|---|---|
| `app/layout.tsx` | Root layout. Sets `<html lang="en">`, global metadata (title "ICAADA" plus mission description) and imports `globals.css`. |
| `app/(public)/` | A **route group**, so `(public)` does not appear in URLs. Its `layout.tsx` wraps every public page in the fixed header, the nav and `<Footer/>`. Keeping the group separate lets `/admin` use a completely different chrome. |
| `app/admin/(auth)/` | `/admin/login`. Redirects to `/admin` when a session already exists. |
| `app/admin/(workspace)/` | Every other `/admin/**` screen. Its server `layout.tsx` checks the session (redirecting to `/admin/login`), loads the user, settings and header counts, and mounts the admin shell once for all screens. |

### Public routes

| URL | File | Data sources |
|---|---|---|
| `/` | `(public)/page.tsx` | `heroSlides`, `strategicPriorities`, `communityActionModel`, `events`, `photos` |
| `/about` | `about/page.tsx` | `coreValues`, `frameworkPrinciples`, `innovationAgenda`, `sustainabilitySteps`, `impactAmbition`, … |
| `/our-work` | `our-work/page.tsx` | `strategicPriorities`, `communityActionModel`, `partnershipGroups` |
| `/team` | `team/page.tsx` | `teamMembers` → `<TeamGrid>` |
| `/events`, `/events/[slug]` | `events/…` | `events` (lookup by `slug`, **falls back to `events[0]`**) |
| `/news`, `/news/[slug]` | `news/…` | `news` (same slug lookup) |
| `/media` | `media/page.tsx` | `mediaItems`, `leaderVideos`, `stakeholderVoices` |
| `/get-involved` | `get-involved/page.tsx` | Static copy |
| `/contact` | `contact/page.tsx` | Form with `preventDefault()`. The backend endpoint `POST /api/public/contact` exists but the form is not wired to it yet |

Dynamic routes read the slug on the client with `useParams()`. They do not use `generateStaticParams` and do not call `notFound()`, so an unknown slug renders the first item instead of a 404. The fix comes with the service swap in §5.6.

---

## 4. Rendering model

**Decision: every page is a Client Component today.** Each file in `(public)/` begins with `"use client"`, and so does the group layout, because it needs `usePathname()` and mobile-menu state.

- **Why:** the site was ported from a client-side SPA (Vite + wouter). Marking whole pages `"use client"` was the quickest way to keep hooks, carousels and modals working unchanged.
- **Consequences:**
  - The pages still pre-render to HTML at build time, since static client pages are SSR'd. However, all page JS ships to the browser and per-page `metadata` cannot be exported. Only the root `metadata` exists, so every page shares one `<title>`.
  - `site.tsx` has no `"use client"` directive. It works only because client pages import it.
- **Suggested direction:** make pages Server Components, push `"use client"` down to the interactive leaves (`HeroCarousel`, `VoiceCarousel`, team modals, mobile nav), add `generateMetadata`, `generateStaticParams` and `notFound()` to the `[slug]` routes, and move the nav into its own small client component so `(public)/layout.tsx` can be a server layout.

**React Compiler** is on (`reactCompiler: true`), so components are memoised automatically and manual `useMemo`/`useCallback` is rarely needed.

---

## 5. Backend & data layer

### 5.1 Layering (strict)

```
Route Handler   src/app/api/**/route.ts        parse + Zod-validate, call guard, delegate, shape JSON
   ▼
Auth guard      src/lib/auth/auth-guard.ts     requireAuth / requireEditor / requireAdmin
   ▼
Service         src/Services/*.service.ts      business rules, authorization beyond role, DTOs,
   ▼                                           ActivityLog writes, cache revalidation
Repository      src/Repositories/*.repository.ts   the ONLY code that imports @/lib/prisma
   ▼
Prisma client   src/generated/prisma  →  PostgreSQL
```

- **Route Handlers** contain no business logic and never touch Prisma. The seven content modules share factories in `src/lib/api/content-routes.ts`, so each `route.ts` is three lines.
- **Services** never import Prisma. They depend on repository functions and on the domain enums in `src/Schemas/common.schema.ts`, which mirror the Prisma enums.
- **Repositories:** one per aggregate. Known Prisma errors are mapped to API errors in `withPrismaErrors` (unique → 409, missing → 404, bad foreign key → 422).
- **Schemas:** one Zod file per domain area in `src/Schemas/`. `create` schemas carry the defaults, and `update` schemas are `create.partial()`.
- **Naming:** kebab-case files, and the folders are named exactly `Services`, `Repositories` and `Schemas`, to match the Academy LMS.
- **Allowed exceptions:** `src/lib/prisma.ts` (the client itself) and `prisma/seed.ts` (an offline CLI script).

### 5.2 Data model (`prisma/schema.prisma`)

| Model | Purpose | Source in `content.ts` |
|---|---|---|
| `User` | Admin accounts: `role` ADMIN/EDITOR, `status` ACTIVE/DISABLED, bcrypt `passwordHash`, `preferences` JSON | — |
| `TeamMember` | Team profiles | `teamMembers` |
| `Event` | Events. `phase` (ENVISIONED/UPCOMING/ONGOING/PAST) is the real-world state, kept separate from editorial `status` | `events` |
| `NewsPost` | Articles (`author` → User, SetNull) | `news` |
| `MediaItem` | Photos, videos, documents and audio by URL (`voice` → Voice, SetNull) | `mediaItems` |
| `Voice` | Stakeholder quotes plus their optional leader video. Publishing requires `consentConfirmed` | `stakeholderVoices` + `leaderVideos` |
| `Program` | Strategic priorities and programmes (`stage`, `featured`) | `strategicPriorities` |
| `Partner` | Partner directory (`type`) | `partnershipGroups` |
| `ContactMessage` | Inbox (NEW/READ/ARCHIVED, reply draft) | — |
| `VolunteerApplication` | Native volunteer form (NEW/CONTACTED/ARCHIVED) | — |
| `Subscriber`, `NewsletterDraft` | Newsletter list and drafts (no sending yet) | — |
| `ActivityLog` | Audit trail written by services on every mutation | — |
| `WorkspaceSettings` | Single row (`id = "workspace"`) | — |

**Conventions**
- Every content model has `slug` (unique), `status` (DRAFT/REVIEW/PUBLISHED/ARCHIVED), `publishedAt`, `sortOrder` and timestamps.
- IDs are `cuid()`, and every relation sets an explicit `onDelete`.
- Indexes cover slugs, `status` (paired with the sort column) and every foreign key.
- Media columns hold Cloudinary URLs and `*PublicId` values only, never binaries.

Page copy that no editor manages (hero slides, values, principles, the action model) stays in `content.ts`.

### 5.3 API surface

All responses use one of two shapes:
- Success: `{ data, meta? }`, where list endpoints add `meta: { page, pageSize, total, totalPages }`.
- Error: `{ error: { code, message, details? } }`.

| Area | Endpoints | Guard |
|---|---|---|
| Auth | `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | login: rate-limited; me: any user |
| Public reads | `GET /api/public/{team,events,news,media,voices,programs,partners}` · `GET /api/public/{events,news}/[slug]` (404 if missing or unpublished) | none (PUBLISHED only) |
| Public forms | `POST /api/public/contact` · `POST /api/public/volunteers` · `POST /api/public/newsletter/subscribe` | none; Zod, honeypot field `company`, per-IP rate limit; always `202` |
| Content (×7) | `GET/POST /api/admin/{module}` (`?search=&status=&page=&pageSize=`) · `GET/PATCH/DELETE /api/admin/{module}/[id]` · `POST /api/admin/{module}/[id]/status` `{ status }` | EDITOR+ |
| Media | `POST /api/admin/media/sign-upload` `{ resourceType, folder }` → Cloudinary signature | EDITOR+ |
| Inbox | `GET /api/admin/messages` · `GET/PATCH/DELETE /api/admin/messages/[id]` (status, `replyDraft`) | EDITOR+ |
| Volunteers | `GET /api/admin/volunteers` · `GET/PATCH/DELETE /api/admin/volunteers/[id]` | EDITOR+ |
| Newsletter | `GET/POST /api/admin/subscribers` · `PATCH/DELETE /api/admin/subscribers/[id]` · `GET/POST /api/admin/newsletter` · `GET/PATCH/DELETE /api/admin/newsletter/[id]` | EDITOR+ |
| Activity | `GET /api/admin/activity` (`?entityType=&actorId=`) | EDITOR+ |
| Summary | `GET /api/admin/summary` (per-module status counts, review queue, unread messages, new volunteers, active subscribers) | EDITOR+ |
| Settings | `GET /api/admin/settings` (EDITOR+) · `PATCH /api/admin/settings` (ADMIN) | mixed |
| Profile | `GET/PATCH /api/admin/profile` · `POST /api/admin/profile/password` | any user |
| Users | `GET/POST /api/admin/users` · `GET/PATCH/DELETE /api/admin/users/[id]` | ADMIN |

**Status codes**
- 401 when signed out, or for a bad or expired token.
- 403 for the wrong role or a disabled account.
- 404 for a missing record.
- 409 for a duplicate slug or email, or an attempt to remove the last admin.
- 422 for Zod failures (`details` maps field paths to messages), a broken publish rule, or an illegal status transition.
- 429 when rate-limited (with a `Retry-After` header).

Unknown errors are logged server-side and return a generic 500. The real message is included only outside production.

### 5.4 Content workflow & rules

- **Status transitions** (in `content.service.ts`, mirroring `statusTransitions` in `module-configs.ts`): DRAFT → REVIEW or PUBLISHED; REVIEW → PUBLISHED or DRAFT; PUBLISHED → ARCHIVED or DRAFT; ARCHIVED → DRAFT. New records always start as DRAFT, and status only changes through `/status`.
- **Slugs** are generated from the title or name, with `-2`, `-3` and so on added on collision. An explicitly supplied slug that is already taken returns 409.
- **Publish rules** live in each module's service:
  - Team: a photo is required.
  - Event: a start date or a date label is required, and the end date must be after the start.
  - News: a cover image is required.
  - Media: images need a URL and alt text; other types need an asset URL.
  - Voice: `consentConfirmed` must be set.
  - Programs and partners: no extra rules.
- `publishedAt` is set the first time a record is published and is kept if it is re-published.
- Media URLs must be on `res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/`, the same allow-list `next/image` uses.
- The seven modules share `createContentService()`, which handles the lifecycle: listing, slugs, transitions, activity logging and revalidation. Everything module-specific is passed in from the module's own service file.

### 5.5 Auth

- **Session:** an HS256 JWT signed with `jose` (`SESSION_SECRET`, 7-day expiry), stored in an HTTP-only `icaada_session` cookie with `sameSite: "lax"`, `path: "/"`, and `secure` in production.
- **Guards** reload the user from the database on every request. Disabling, demoting or deleting a user therefore takes effect immediately, even while their JWT is still valid.
- **Login** returns the same message for an unknown email, a wrong password or a disabled account, and compares against a dummy bcrypt hash when the email is unknown so the timing matches. It is rate-limited to 5 attempts per IP and email per 15 minutes, and 30 per IP.
- **No public registration.** Accounts come from the seed or `POST /api/admin/users` (ADMIN).
- **Self-protection:** admins cannot change their own role or status, cannot delete themselves, and the last active admin cannot be demoted, disabled or deleted.
- `passwordHash` never leaves the repository layer. `UserDto` omits it.

### 5.6 Using the backend from Server Components

Public pages should call the **services directly**, not over HTTP. These are the same functions behind `/api/public/**`:

```tsx
// src/app/(public)/events/[slug]/page.tsx (after removing "use client")
import { notFound } from "next/navigation";
import { eventService } from "@/Services/event.service";

export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const event = await eventService.getPublishedBySlug((await params).slug);
  if (!event) notFound(); // fixes today's fallback-to-events[0] bug
  return <EventView event={event} />; // keep interactive bits in small client components
}
```

To migrate a page:
1. Remove `"use client"`.
2. Replace `import { events } from "@/data/content"` with `await eventService.listPublished()`.
3. Pass the DTOs to client components as props.
4. Call `notFound()` on `null`.

DTO field names differ slightly from `content.ts` (for example `imageUrl` instead of `image`, `phase` instead of `status`, and `dateLabel` instead of `date`), so adjust the components that consume them.

**Caching** (Next 16 without Cache Components):
- `listPublished` and `getPublishedBySlug` are wrapped in `unstable_cache`, tagged `content:<module>`, with a one-hour backstop.
- Every admin mutation that affects public content calls `revalidateContent()` (`src/lib/cache.ts`). That function calls `revalidateTag(tag, { expire: 0 })`, so editors see a publish immediately, and `revalidatePath` for the public pages that render the module.
- `updateTag` is not used because it only works in Server Actions.
- If Cache Components is enabled later, replace `unstable_cache` with `"use cache"` and `cacheTag` in `src/lib/cache.ts`. The services keep the same interface.

### 5.7 Media uploads

`POST /api/admin/media/sign-upload` returns `{ uploadUrl, apiKey, timestamp, folder, signature }`, signed with the server-side API secret. The browser then POSTs the file straight to Cloudinary and saves the returned `secure_url` and `public_id` on the record. No file bytes go through this app.

### 5.8 Cross-cutting

- **Env:** `src/lib/env.ts` validates formats with Zod, not just presence: Postgres URLs, a secret of at least 32 characters, the cloud-name pattern, a numeric API key.
- **Rate limiting:** `src/lib/rate-limit.ts` keeps counters in memory per instance. Use Redis before scaling out.
- **Notifications:** `src/lib/notifier.ts` defines the interface. The current implementation only logs; plug in email later.
- **Pool size:** `DATABASE_POOL_MAX` (optional) caps connections per instance. Set it to 1 when using `prisma dev`, whose PGlite server accepts only one connection.

---

## 6. Admin workspace

```
app/admin/
  (auth)/login/page.tsx        Server page: redirects signed-in users; renders AuthLayout + LoginForm
  (workspace)/layout.tsx       Server gate: getCurrentActor() or redirect('/admin/login');
                               loads me, workspace settings, summary → <AdminProvider><AdminLayout>
  (workspace)/page.tsx         Dashboard (summary counts + recent activity)
  (workspace)/{team,events,media,voices,news,programs,partners}/page.tsx
                               createModulePage(key) → <ModuleManager config={moduleConfigs[key]}>
  (workspace)/messages · volunteers · newsletter · settings
components/admin/
  admin-layout.tsx    Sidebar + header shell (client); logout calls POST /api/auth/logout
  auth-layout.tsx     Split-screen login layout
  login-form.tsx      POST /api/auth/login (remember me → persistent vs browser-session cookie)
  admin-parts.tsx     PageHeading, StatusBadge, Toolbar, EmptyState, ListStatus, Confirm/Form/DetailDialog
  fields-form.tsx     Schema-driven form; async submit maps API field errors inline; asset fields upload to Cloudinary
  module-configs.ts   One ModuleConfig per module (fields named exactly as the API schemas)
  module-manager.tsx  Generic list/search/filter/CRUD/status screen for any ModuleConfig
  module-page.tsx     createModulePage(key)
lib/admin/
  api-client.ts       fetch wrapper for /api/** → { data, meta } or AdminApiError (401 → /admin/login)
  admin-store.tsx     AdminProvider/useAdmin: me, workspace, summary (header badges), toasts
  use-admin-list.ts   Server-side list: debounced search, status filter, "load more" pagination
  field-values.ts     DTO ⇄ form-string conversion (lists, booleans, dates, null-clearing)
  cloudinary-upload.ts  Signed direct upload (sign via API, POST file to Cloudinary)
  format.ts           Relative dates, initials
```

**Config-driven CRUD.** The seven content modules share one screen. `ModuleManager` renders any module from a `ModuleConfig` (list columns, form fields, title key, preview key). Field `kind`s map form strings to API types: `list` (comma-separated) and `lines` (one per line) become `string[]`, `boolean` becomes `true`/`false`, `date` becomes an ISO date, an empty optional field becomes `null`, and `asset` holds a URL plus a `publicIdField`.

**Data flow.** Screens never hold the whole dataset. Each list asks the API for one page at a time, filtered and searched server-side. Mutations update the affected row in place, or reload the list, and then refresh the header counts (`GET /api/admin/summary`). Server validation errors come back with field paths, and `FieldsForm` shows them under the matching field. Publish-rule failures appear as a toast that includes the server's reasons.

**Auth.** The workspace layout checks the session on every full page load. Client-side navigation relies on the API instead: every `/api/admin/**` call is guarded, and a 401 sends the browser to `/admin/login`. Editors see the workspace settings read-only; only admins can change them.

**Isolation decision.** Admin styles live under `.admin-*` and `.adm-*` in `globals.css` and use their own `--admin-*` variables, so admin changes cannot leak into the public site's look.

**Not built yet:** a users screen (the `/api/admin/users` endpoints exist), "Forgot password" (the link is inert; admins can reset a password via `PATCH /api/admin/users/[id]`), and choosing an event for a voice (`eventId` is API-only for now).

---

## 7. Styling architecture

- **Tailwind v4** with no `tailwind.config` file. Configuration lives in CSS (`@import "tailwindcss"`, `@theme inline`, `@plugin`, `@custom-variant dark`).
- **Two layers of styling:**
  1. **Design tokens** (`:root` HSL vars), bridged to Tailwind colours. The shadcn `ui/` kit uses these.
  2. **Semantic BEM-ish classes** (`.hero-carousel`, `.editorial-card`, `.nav-cta`, `.admin-shell-*` and many more) hold most of the site's styling, all in `globals.css`.
- **Decision:** semantic classes were kept from the prototype so the hand-crafted editorial look carries over intact. Tailwind utilities are used lightly in JSX (`relative`, `flex`, `object-contain`).
- **Trade-off:** `globals.css` is about 5,000 lines in one global file. A good next step is to split it by area (`styles/tokens.css`, `styles/public/*.css`, `styles/admin/*.css`) or to move component styles into CSS Modules.

---

## 8. Cross-cutting conventions

| Concern | Convention |
|---|---|
| Imports | Absolute `@/…` alias for everything under `src/` |
| Class merging | `cn()` from `@/lib/utils` |
| Testing hooks | `data-testid` on every interactive element (`link-nav-about`, `button-hero-next`, `input-newsletter-email`) so future E2E tests have stable selectors. There is no test runner configured yet |
| Accessibility | `.focus-ring`, ARIA on carousels/tabs/menus, `prefers-reduced-motion`, 48px touch targets |
| Errors | `components/error-boundary.tsx` (class boundary, `resetKey` to recover on navigation). It is not mounted yet; App Router `error.tsx` files are the idiomatic alternative |
| Formatting | Public code uses double quotes; ported admin code uses single quotes. There is no Prettier config |

---

## 9. Build, run & deploy

```bash
pnpm install              # also runs `prisma generate` (postinstall)
cp .env.example .env      # fill in DATABASE_URL, DIRECT_URL, SESSION_SECRET, Cloudinary keys
pnpm prisma migrate dev   # create/apply migrations (alias: pnpm db:migrate)
pnpm prisma db seed       # dev users + content.ts data (alias: pnpm db:seed)
pnpm dev                  # next dev
pnpm build                # next build (type-checks + lints)
pnpm start                # serve production build
pnpm db:deploy            # production: prisma migrate deploy
pnpm db:studio            # browse data
```

- **Env:** every variable in `.env.example` is required at runtime. `src/instrumentation.ts` validates them when the server boots, and the server refuses to start with a list of what is wrong. `next build` does **not** need them: env and the DB client are created lazily, at first use.
- **Seed accounts:** `admin@example.org` / `dev-admin-password-123` (ADMIN) and `editor@example.org` / `dev-editor-password-123` (EDITOR), unless the `SEED_*` vars are set. The seed refuses the fake defaults when `NODE_ENV=production`.
- **Prisma 7 notes:** connection URLs live in `prisma.config.ts` (CLI, `DIRECT_URL`) and `src/lib/prisma.ts` (runtime, `DATABASE_URL` via `@prisma/adapter-pg`), not in `schema.prisma`. `migrate dev` no longer seeds automatically, so run `db seed` yourself.
- **Hosting:** any Node host with PostgreSQL works (Vercel + Neon/Supabase, Railway, etc.). Use a pooled `DATABASE_URL` and a direct `DIRECT_URL` where the provider offers both. There is no Dockerfile or CI config in the repo.

---

## 10. Technical debt & recommended next steps

| Priority | Item |
|---|---|
| Medium | Admin users screen on top of `/api/admin/users`; a password-reset flow (needs an email provider) |
| Medium | Sessions are stateless JWTs: logout clears the cookie, but a copied token stays valid until it expires (7 days). If that matters, add a token version on `User` and bump it on logout and password change |
| **High** | Swap public pages from `content.ts` to the services and add `notFound()` (§5.6). Then wire the contact, volunteer and newsletter forms to `/api/public/**` |
| **High** | Fix the footer copy (it says "International Centre for Advocacy"). See BRAND.md |
| Medium | Convert pages to Server Components, add per-page metadata, `generateStaticParams` and `notFound()` for slugs |
| Medium | Load DM Sans and Space Grotesk via `next/font` and drop the unused Geist fonts and the CSS `@import` |
| Medium | Clean `package.json`: React is declared in both `dependencies` (19.2.8) and `devDependencies` (^19.1.0 / react-dom 19.1.0); remove the Vite/Replit leftovers (`@vitejs/plugin-react`, `@tailwindcss/vite`, `@replit/vite-plugin-*`); move runtime libs (Radix, lucide, zod, …) into `dependencies`; drop unused packages (`framer-motion`, `@tanstack/react-query`) |
| Low | Delete the duplicate `ButtonLink.tsx`, `Eyebrow.tsx`, `HeroCarousel.tsx` and the legacy `Shell`/`Footer` in `site.tsx`; delete `eslint.config.mts` and `helpers.ts` |
| Low | Remove or rebrand the unused `.dark` theme; split `globals.css` |
| Low | Replace the boilerplate `README.md`; add tests (selectors already exist) and CI |
| Medium | Move rate limiting to a shared store (Redis/Upstash) before running more than one server instance |
| Medium | Add a signed unsubscribe link/endpoint before sending any newsletter; choose an email provider and implement `Notifier` |
| Low | Add API integration tests (the request/response contracts are stable) |

---

## 11. How to add a new content module

The example adds a `resources` module (downloadable guides). Follow the same steps for any editorial collection.

1. **Model:** add `model Resource` to `prisma/schema.prisma` with the standard content fields (`id cuid`, `slug @unique`, `status ContentStatus`, `publishedAt`, `sortOrder`, timestamps, and `@@index([status, sortOrder])`) plus its own columns. Run `pnpm prisma migrate dev --name add-resources`.
2. **Schema:** create `src/Schemas/resource.schema.ts`. Define `resourceCreateSchema = z.object({ ...contentBaseShape, title: text(200, "Title"), … })`, set `resourceUpdateSchema = resourceCreateSchema.partial()`, and export the inferred input types. Use `cloudinaryUrl` and `optionalPublicId` for media fields.
3. **Repository:** create `src/Repositories/resource.repository.ts` and implement `ContentRepository<Resource, …>` (from `repository-utils.ts`) against `getPrisma().resource`. Copy an existing content repository and change the delegate, the search fields and the public `orderBy`.
4. **Service:** create `src/Services/resource.service.ts`. Export a `ResourceDto`, a `toResourceDto` (dates as ISO strings), and `resourceService = createContentService({ module: "resources", entityType: "resource", label: "Resource", repository, toDto, titleOf, slugSource, publishProblems? })`. Add `"resources"` to `ContentModule` and to `publicPaths` in `src/lib/cache.ts`.
5. **Routes:** add three-line route files using the factories in `src/lib/api/content-routes.ts`:
   - `src/app/api/admin/resources/route.ts`: `adminCollectionRoutes(resourceService, resourceCreateSchema)`
   - `src/app/api/admin/resources/[id]/route.ts`: `adminItemRoutes(resourceService, resourceUpdateSchema)`
   - `src/app/api/admin/resources/[id]/status/route.ts`: `adminStatusRoute(resourceService)`
   - `src/app/api/public/resources/route.ts`: `publicListRoute(resourceService)` (add `[slug]/route.ts` with `publicSlugRoute` if it has detail pages)
6. **Admin UI:** add `"resources"` to `ModuleKey` and a `ModuleConfig` entry in `src/components/admin/module-configs.ts` (label, columns, fields, `titleKey`). Then add a sidebar item in `admin-layout.tsx`. `ModuleManager` renders it with no new screen code.
7. **Seed (optional):** if the module starts with existing content, add an idempotent `upsertBySlug` block to `prisma/seed.ts`.
8. **Verify:** `pnpm exec tsc --noEmit` and `pnpm lint`, then confirm that `grep -rn "@/lib/prisma" src | grep -v src/Repositories` prints nothing apart from the client file itself.

For a non-editorial aggregate (no publish workflow, e.g. a form inbox), skip `createContentService`. Write an explicit repository, schema and service the way `volunteer.*` does, and use plain route files.
