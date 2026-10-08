# ICAADA — Architecture

This document describes how the ICAADA web application is structured, how data and rendering flow through it, and the reasons behind its current design. For visual identity and tooling, see [`BRAND.md`](./BRAND.md).

> **Framework note:** the app runs **Next.js 16.3.3**. Its APIs and conventions differ from older versions, so read `node_modules/next/dist/docs/` before changing routing, rendering or config (see `AGENTS.md`).

---

## 1. System overview

```
┌──────────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router  (React 19 · React Compiler · TS strict)  │
│                                                                  │
│  ┌─────────────────────────────┐   ┌───────────────────────────┐ │
│  │  Public website  (public)   │   │  Admin workspace  /admin  │ │
│  │  marketing + content pages  │   │  demo CMS (in migration)  │ │
│  └──────────────┬──────────────┘   └─────────────┬─────────────┘ │
│                 │                                │               │
│      src/data/content.ts               src/data/admin/mock.ts    │
│      (static typed content)            (seed data, in-memory)    │
│                 │                                │               │
│                 ▼                                ▼               │
│        Cloudinary images              src/lib/mock-auth.ts       │
│        (next/image remote)            (fake login, no backend)   │
└──────────────────────────────────────────────────────────────────┘
```

- There is **no backend, database, API route or environment variable** yet. All content is static TypeScript.
- Media is hosted on **Cloudinary** and optimised by `next/image`.
- The public site is the production surface. The admin area is a **front-end demo** being ported into Next.js from an earlier Vite + wouter prototype (see §6).

---

## 2. Directory layout

```
icaada-main/
├── AGENTS.md / CLAUDE.md      Agent instructions (Next 16 warning)
├── BRAND.md / ARCHITECTURE.md Project docs
├── next.config.ts             reactCompiler + Cloudinary image allow-list
├── postcss.config.mjs         Tailwind v4 PostCSS plugin
├── eslint.config.mjs          Active ESLint config (next core-web-vitals + TS)
├── eslint.config.mts          Second, generic flat config (unused by `next lint`)
├── tsconfig.json              strict, bundler resolution, @/* → src/*
├── pnpm-workspace.yaml        Build-script ignores (sharp, unrs-resolver)
├── public/                    Default Next SVGs only
└── src/
    ├── app/
    │   ├── layout.tsx         Root <html>/<body>, metadata, globals.css
    │   ├── globals.css        ~5k lines: tokens + all component CSS
    │   ├── favicon.ico
    │   ├── (public)/          Route group: public site (no URL segment)
    │   │   ├── layout.tsx     Header/nav, mobile menu, <Footer/>
    │   │   ├── page.tsx       /            Home
    │   │   ├── about/         /about
    │   │   ├── our-work/      /our-work
    │   │   ├── team/          /team
    │   │   ├── events/        /events, /events/[slug]
    │   │   ├── media/         /media
    │   │   ├── news/          /news, /news/[slug]
    │   │   ├── get-involved/  /get-involved
    │   │   └── contact/       /contact
    │   └── admin/             Admin screens (see §6, not routed yet)
    │       ├── dashboard.tsx  login.tsx  messages.tsx  newsletter.tsx
    │       ├── settings.tsx   module-page.tsx
    ├── components/
    │   ├── site.tsx           Shared public building blocks (PageHero, ButtonLink,
    │   │                      Eyebrow, ImageCard, HeroCarousel, legacy Shell/Footer)
    │   ├── Footer.tsx         Footer used by (public)/layout.tsx
    │   ├── credibility.tsx    VoiceCarousel, VoiceDetailModal, FeaturedVideo, …
    │   ├── team.tsx           TeamGrid, TeamMemberCard, TeamMemberModal
    │   ├── error-boundary.tsx Class-based ErrorBoundary with resetKey
    │   ├── ButtonLink.tsx, Eyebrow.tsx, HeroCarousel.tsx   (duplicates of site.tsx exports, unused)
    │   ├── admin/             Admin shell, forms, module manager, config
    │   └── ui/                shadcn/ui-style Radix wrappers (~55 files)
    ├── data/
    │   ├── content.ts         All public-site content (typed arrays/objects)
    │   └── admin/mock.ts      Admin types + placeholder seed records
    ├── hooks/                 use-mobile, use-toast (shadcn)
    ├── lib/
    │   ├── utils.ts           cn() = clsx + tailwind-merge
    │   └── mock-auth.ts       mockAdminLogin(): simulated auth
    └── helpers.ts             Legacy Unsplash photo map
```

---

## 3. Routing

### Route groups

| Segment | Purpose |
|---|---|
| `app/layout.tsx` | Root layout. Sets `<html lang="en">`, global metadata (title "ICAADA" plus mission description) and imports `globals.css`. |
| `app/(public)/` | A **route group**, so `(public)` does not appear in URLs. Its `layout.tsx` wraps every public page in the fixed header, the nav and `<Footer/>`. Keeping the group separate lets `/admin` use a completely different chrome. |
| `app/admin/` | The admin workspace. It currently has **no `page.tsx`/`layout.tsx`**: the old placeholder routes were deleted and the new screens are plain modules that have not been wired up yet. |

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
| `/contact` | `contact/page.tsx` | Form with `preventDefault()`; it has no submit target yet |

Dynamic routes read the slug on the client with `useParams()`. They do not use `generateStaticParams` and do not call `notFound()`, so an unknown slug renders the first item instead of a 404.

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

## 5. Data layer

### Public content: `src/data/content.ts`

A single module of typed constants acts as a "CMS in code":

```
photos · heroSlides · strategicPriorities · communityActionModel
frameworkPrinciples · innovationAgenda · partnershipGroups · coreValues
sustainabilitySteps · impactAmbition · events · team · teamMembers (TeamMember[])
news · mediaItems · stakeholderVoices · leaderVideos
```

- **Why:** there is no backend, editors are developers for now, and the content changes rarely. Static data is type-checked, versioned in git and needs no build-time fetching.
- **Images and video** are Cloudinary URLs. `next.config.ts` allow-lists only `https://res.cloudinary.com/dcvyjmflf/**`, so any other remote host fails in `next/image`. `src/helpers.ts` holds older Unsplash URLs. Only the unused `components/HeroCarousel.tsx` imports it, and Unsplash is not allow-listed.
- **Migration path:** the admin module keys (`team`, `events`, `media`, `voices`, `news`, `programs`, `partners`) match these content collections one to one. When a real backend arrives, `content.ts` can be replaced by fetches in Server Components using the same shapes.

### Admin data: `src/data/admin/mock.ts`

- Types: `ModuleKey`, `Status` (`draft | review | published | archived`), `ModuleRecord`, `InboxMessage`, `Subscriber`, `NewsletterDraft`, `ActivityEntry`, `WorkspaceSettings`, `ProfileSettings`.
- `seedRecords`: obviously fake placeholder data, using the `example.org` domain.
- The screens expect a `useDemo()` store from `@/lib/admin/demo-store`, which **does not exist in the repo yet** (§6).

### Auth: `src/lib/mock-auth.ts`

`mockAdminLogin(email, password)` waits 1.2s, then accepts any well-formed email with a password of 8+ characters. Emails ending in `@invalid.test` are rejected so the error state can be previewed. **There is no real authentication, session or route protection.**

---

## 6. Admin workspace (in migration)

The working tree shows an admin port in progress, with uncommitted changes against `main`:

```
components/admin/
  admin-layout.tsx    Sidebar shell (Dashboard · Content · Organisation · Engagement · Settings)
  auth-layout.tsx     Split-screen login layout (photo + form)
  login-form.tsx      Validated login → mockAdminLogin → redirect
  password-input.tsx  Show/hide password field
  admin-parts.tsx     PageHeading, StatusBadge, Toolbar, EmptyState, Confirm/Form/DetailDialog
  fields-form.tsx     Schema-driven form (text|textarea|select|date|url|email|asset)
  module-configs.ts   One ModuleConfig per ModuleKey: columns, fields, copy
  module-manager.tsx  Generic list/search/filter/CRUD screen driven by a ModuleConfig
app/admin/
  module-page.tsx     createModulePage(key) → AdminTeam, AdminEvents, … AdminPartners
  dashboard.tsx  messages.tsx  newsletter.tsx  settings.tsx  login.tsx
```

**Key design decision: config-driven CRUD.** The seven content modules do not each get a hand-written screen. A single `ModuleManager` renders any module from a declarative `ModuleConfig` (list columns, form fields, title key, preview key). Adding a module means adding a seed collection and a config entry, with no new UI code.

**Isolation decision.** Admin styles live under `.admin-*` and `.adm-*` in `globals.css` and use their own `--admin-*` variables, so admin changes cannot leak into the public site's look.

**Current blockers** (`tsc --noEmit` reports errors only in admin files; the public site type-checks clean):

1. `wouter` (`Link`, `useLocation`) is imported by `admin-layout`, `auth-layout`, `login-form` and `module-manager`, but it is not installed. Replace it with `next/link` and `useRouter`/`usePathname` from `next/navigation`.
2. `@/lib/admin/demo-store` (`useDemo`) is missing. It needs a client-side store (e.g. a React context seeded from `seedRecords`) exposing `records`, `messages`, `subscribers`, `activity`, `profile` and mutators.
3. The screens are not routed. They need `app/admin/layout.tsx` (client, wrapping `AdminLayout`), `app/admin/page.tsx` → dashboard, `app/admin/login/page.tsx`, and `app/admin/[module]/page.tsx` or one folder per module.
4. Several `implicit any` errors cascade from the missing store types.
5. There is no route guard. Once real auth exists, protect `/admin/**` with Next 16's request interception (check the bundled docs for the current file convention) or a server-side session check in the admin layout.

Because `tsconfig.json` includes `**/*.tsx`, **`next build` will fail type-checking until these are resolved or the files are excluded.**

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
pnpm install
pnpm dev      # next dev
pnpm build    # next build (type-checks + lints)
pnpm start    # serve production build
pnpm lint     # eslint
```

- No `.env` is required (`.env*` is git-ignored for later use).
- The project is set up for Vercel or any Node host. There is no Dockerfile or CI config in the repo.

---

## 10. Technical debt & recommended next steps

| Priority | Item |
|---|---|
| **High** | Finish the admin port: remove `wouter`, add `demo-store`, wire the routes. `next build` is blocked until then |
| **High** | Fix the footer copy (it says "International Centre for Advocacy"). See BRAND.md |
| Medium | Convert pages to Server Components, add per-page metadata, `generateStaticParams` and `notFound()` for slugs |
| Medium | Load DM Sans and Space Grotesk via `next/font` and drop the unused Geist fonts and the CSS `@import` |
| Medium | Clean `package.json`: React is declared in both `dependencies` (19.2.8) and `devDependencies` (^19.1.0 / react-dom 19.1.0); remove the Vite/Replit leftovers (`@vitejs/plugin-react`, `@tailwindcss/vite`, `@replit/vite-plugin-*`); move runtime libs (Radix, lucide, zod, …) into `dependencies`; drop unused packages (`framer-motion`, `@tanstack/react-query`) |
| Low | Delete the duplicate `ButtonLink.tsx`, `Eyebrow.tsx`, `HeroCarousel.tsx` and the legacy `Shell`/`Footer` in `site.tsx`; delete `eslint.config.mts` and `helpers.ts` |
| Low | Remove or rebrand the unused `.dark` theme; split `globals.css` |
| Low | Replace the boilerplate `README.md`; add tests (selectors already exist) and CI |
| Future | Real backend/CMS and auth to replace `content.ts`, `mock.ts` and `mock-auth.ts`; give the contact and newsletter forms a submit target |
