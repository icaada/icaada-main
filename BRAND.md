# ICAADA — Brand & Design System

> **ICAADA — Initiative for Community Action Against Drug Abuse.**
> A community-focused platform that builds collective action against drug abuse and its health, social, economic and security effects across Northern Nigeria.

This document records the visual identity, design tokens, voice and tooling the codebase uses today. Values come from `src/app/globals.css` and the components in `src/components/`. Where the code disagrees with itself, the disagreement is listed under [Known inconsistencies](#known-inconsistencies).

---

## 1. Identity

| Element | Value |
|---|---|
| Name | **ICAADA** |
| Full name | Initiative for Community Action Against Drug Abuse |
| Focus region | Northern Nigeria |
| Tagline (footer / hero) | *Community ownership. Prevention first. Sustainable action.* · *Listening first. Acting together.* |
| Topbar message | *Mobilising communities. Empowering people. Building resilience across Northern Nigeria.* |

### Logo / brand lockup

The site has no image logo. The brand is drawn in CSS (`.brand`, `.brand-mark`, `.brand-wordmark`):

```
┌────┐
│ IC │  ICAADA
└────┘  INITIATIVE FOR COMMUNITY ACTION AGAINST DRUG ABUSE
```

- **Mark**: a 38×38px square with no rounding, filled with the accent red (`--accent`). It holds the white letters "IC" in Space Grotesk 700 with tight tracking (`-0.05em`).
- **Wordmark**: "ICAADA" in Space Grotesk 700, `1.05rem`, `letter-spacing: -0.04em`, `line-height: 0.9`.
- **Descriptor**: the full name in DM Sans 700, `0.56rem`, uppercase, `letter-spacing: 0.1em`, muted grey.
- The admin area uses the same mark (`.admin-shell-brand-mark`, `.admin-auth-mark`), with the descriptor changed to "Admin workspace" or "Administration Portal".

---

## 2. Color

### Core palette (light theme, the only theme in use)

Tokens are HSL triplets on `:root`. Tailwind v4 exposes them through `@theme inline` as `bg-primary`, `text-accent`, `border-border` and so on.

| Token | HSL | ≈ Hex | Role |
|---|---|---|---|
| `--accent` | `349 100% 39%` | **`#C70025`** | **Brand red.** Primary CTAs, brand mark, eyebrows, active nav underline, focus ring, text selection |
| *(accent hover)* | `349 100% 32%` | `#A3001E` | `.button-primary:hover` |
| `--primary` | `0 0% 27%` | `#454545` | Charcoal. Topbar, hero background, secondary-button outline, card top rules |
| `--foreground` | `0 0% 27%` | `#454545` | Body text |
| `--muted-foreground` | `0 0% 40%` | `#666666` | Secondary text, nav links, descriptors |
| `--background` / `--card` | `0 0% 100%` | `#FFFFFF` | Page and card surfaces |
| `--secondary` | `0 0% 96%` | `#F5F5F5` | Alternate section bands, image placeholders |
| `--muted` | `0 0% 95%` | `#F2F2F2` | Muted surfaces |
| `--border` / `--input` | `0 0% 86%` | `#DBDBDB` | Hairlines, inputs, `.rule` dividers |
| `--ring` | `349 100% 39%` | `#C70025` | Focus ring (drawn at 42% alpha) |
| `--destructive` | `349 100% 39%` | `#C70025` | Same as the accent |
| `--primary-foreground`, `--accent-foreground` | `0 0% 100%` | `#FFFFFF` | Text on charcoal or red |

**How the palette works:** charcoal and white carry the page, and red is used sparingly for action and emphasis. Red never fills large areas except the brand mark and CTA buttons.

### Admin palette (scoped to `.admin-shell` and `.adm-*`)

The admin workspace is meant to stay visually separate from the public site, so it defines its own custom properties:

| Variable | Hex | Role |
|---|---|---|
| `--admin-ink` | `#292D2E` | Text, dark sidebar |
| `--admin-ink-soft` | `#5D6463` | Secondary text |
| `--admin-paper` | `#F5F4F0` | Warm off-white app background |
| `--admin-panel` | `#FFFFFF` | Panels and cards |
| `--admin-line` | `#DFDFDA` | Borders |
| `--admin-red` | `#C90025` | Brand red (hex form of the accent) |
| `--admin-red-dark` | `#9F001E` | Pressed/hover red |
| `--admin-blue` | `#49616C` | "Archived" and info states |
| `--admin-ochre` | `#9C7441` | "Review" and warning states |
| `--admin-green` | `#54715C` / `#6A9875` | "Published" and success; sync/status dots |
| *(tints)* | `#FAECEE`, `#F08A9B`, `#F4F2EB` | Red tint backgrounds, logout/kicker on dark, text on dark panels |

### Overlays & shadows

- Hero image shade: `rgba(0,0,0,0.48)`
- `--shadow-sm`: `0 8px 24px rgba(68,68,68,.07)`
- `--shadow-md`: `0 16px 42px rgba(68,68,68,.11)`

---

## 3. Typography

Fonts load from Google Fonts with an `@import` at the top of `globals.css`.

| Role | Family | Weights | CSS var |
|---|---|---|---|
| Body / UI | **DM Sans** | 400, 500, 600, 700 | `--app-font-sans` → `font-sans` |
| Display / headings / wordmark | **Space Grotesk** | 500, 600, 700 | `--app-font-mono` → `font-mono` (named "mono" for historical reasons; the font is not monospace) |
| Serif fallback | Georgia | — | `--app-font-serif` |

**Type rules**

- `.display`: Space Grotesk, `letter-spacing: -0.055em`, `line-height: 0.98`. Headlines are tight and heavy.
- Headline sizes are fluid and use `clamp()`, e.g. `clamp(2.4rem, 6vw, 5.5rem)` for page heroes and `clamp(3rem, 6vw, 4.5rem)` for the home hero.
- `.eyebrow`: `0.7rem`, uppercase, `letter-spacing: 0.18em`, weight 700, in **accent red**. Nearly every section opens with one (see the `<Eyebrow>` component).
- Nav and buttons use small, bold UI text (`0.76–0.82rem`, weight 600–700).

---

## 4. Shape, spacing & layout

| Token | Value |
|---|---|
| `--radius` | `0.35rem` (Tailwind `rounded-sm…xl` are derived from it) |
| Brand mark, buttons, nav CTA | **Square corners.** No radius |
| `--spacing` | `0.25rem` (Tailwind base unit) |
| `.container-wide` | `width: min(100% - 2.5rem, 1240px)`, centred |
| `.section-pad` | `padding-block: 6.5rem` |
| Header | Fixed, 80px tall, white at 96% opacity with `backdrop-filter: blur(10px)` |
| Buttons | Minimum 48px tall (touch target) |

**Breakpoints in use:** 480, 520, 640, 700, 720, 900, 1020, 1024, 1280px (`max-width` and `min-width` are mixed).

**Editorial cues:** cards use a 2px charcoal top rule (`.editorial-card`) in place of a box or shadow. Thin `1px` hairlines separate sections. Photography is shown full-bleed under a dark shade.

---

## 5. Components & interaction patterns

| Pattern | Class / component | Notes |
|---|---|---|
| Primary button | `.button-primary` / `<ButtonLink>` | Red fill, white text, trailing `ArrowRight`, lifts `-2px` on hover |
| Secondary button | `.button-secondary` / `<ButtonLink secondary>` | Charcoal outline that fills charcoal on hover. Uses a white outline on the hero |
| Nav CTA | `.nav-cta` | "Get involved ↗" in red |
| Text link | `.link-arrow` | Bold; the gap widens and the color turns red on hover |
| Section label | `<Eyebrow>` | Red uppercase kicker |
| Page header | `<PageHero eyebrow title description>` | Every inner page uses it |
| Hero | `<HeroCarousel>` | Auto-advances every 6.5s. Pauses on hover, focus, reduced motion or user toggle. Arrow-key navigation and progress-bar pagination |
| Testimonials | `<VoiceCarousel>`, `<VoiceDetailModal>`, `<FeaturedVideo>` | `src/components/credibility.tsx` |
| Team | `<TeamGrid>`, `<TeamMemberCard>`, `<TeamMemberModal>` | `src/components/team.tsx` |

**Motion**

- `.reveal`: a `rise-in` keyframe that moves content up 14px and fades it in over 0.65s with `cubic-bezier(.2,.7,.2,1)`. `.reveal-delay-1/2/3` stagger by 80ms.
- Hover transitions are 0.2s ease.
- `prefers-reduced-motion` is respected by the carousel and the media card transitions.

**Accessibility conventions**

- `.focus-ring`: a 3px red outline at 42% alpha with a 3px offset, on `:focus-visible`.
- `aria-current="page"` on active nav links. The carousel uses `aria-roledescription="carousel"`, `role="tablist"` and live regions.
- Every interactive element has a `data-testid` in the form `<kind>-<area>-<name>`, e.g. `link-nav-about` or `button-hero-next`.

---

## 6. Iconography & imagery

- **Icons:** [`lucide-react`](https://lucide.dev). Common ones are `ArrowRight`, `ArrowUpRight`, `MapPin`, `Menu`, `X`, and social icons (Instagram, LinkedIn, Facebook). Typical sizes are 12–17px inline and 24px for the menu.
- **Photography:** documentary and community-centred images of real people, gatherings and workshops. Production images are served from **Cloudinary** (`res.cloudinary.com/dcvyjmflf/**`, allow-listed in `next.config.ts`). The legacy `src/helpers.ts` (imported only by the unused `HeroCarousel.tsx`) still points at Unsplash.
- Every image needs meaningful `alt` text. The content model carries an `alt` field for each image.

---

## 7. Voice & tone

From the copy in `src/data/content.ts` and the components:

- **Community-first and dignified.** Write "communities", "young people", "families". Avoid stigmatising language about people who use drugs.
- **Action-oriented and collective.** Use verbs like *mobilise, empower, build, act together*.
- **Evidence-based and calm.** Prefer *prevention, research, recovery support* over alarmist framing.
- **Sentence case** for headings and buttons ("Get involved", "Our work").
- British/Nigerian English spelling (*mobilising, organisation, programme*).

---

## 8. Tooling & dependencies

### Runtime stack

| Tool | Version | Purpose |
|---|---|---|
| **Next.js** | 16.3.3 (App Router) | Framework. Read `node_modules/next/dist/docs/` before changing framework code (see `AGENTS.md`) |
| **React / React DOM** | 19.2.8 | UI |
| **React Compiler** | `babel-plugin-react-compiler` 1.0.0, `reactCompiler: true` | Automatic memoisation. Avoid adding manual `useMemo`/`useCallback` by habit |
| **TypeScript** | ^5, `strict` | Path alias `@/* → src/*` |
| **Tailwind CSS** | v4 via `@tailwindcss/postcss` | Utility classes plus `@theme inline` token bridge |
| `tw-animate-css`, `@tailwindcss/typography` | — | Animation utilities and `prose` |

### UI libraries (shadcn/ui-style kit in `src/components/ui/`)

- **Radix UI** primitives (accordion, dialog, dropdown, popover, select, tabs, toast, tooltip and others)
- `class-variance-authority`, `clsx`, `tailwind-merge` (through `cn()` in `src/lib/utils.ts`)
- `lucide-react` and `react-icons` for icons
- `react-hook-form`, `zod`, `@hookform/resolvers` for forms
- `sonner` for toasts, `vaul` for drawers, `cmdk` for the command palette, `embla-carousel-react`, `react-day-picker`, `input-otp`, `react-resizable-panels`, `recharts`
- `framer-motion`, `next-themes`, `@tanstack/react-query`, `date-fns`: installed, but **not imported** by app code (`next-themes` appears only in `ui/sonner.tsx`)

### Dev tooling

- **Package manager:** pnpm 10.14.0 (`packageManager` field). `pnpm-workspace.yaml` skips the build scripts for `sharp` and `unrs-resolver`
- **Lint:** ESLint 9 with `eslint-config-next` (core-web-vitals and TypeScript) in `eslint.config.mjs`
- **Scripts:** `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint`

---

## Known inconsistencies

These are things to settle so the brand stays consistent:

1. **Two footer copies.** The live `src/components/Footer.tsx` (used by `(public)/layout.tsx`) expands ICAADA as **"International Centre for Advocacy"**, shows `© 2025 … A Nigerian nonprofit`, and uses `hello@icaada.org`. The unused footer in `site.tsx` uses the correct **"Initiative for Community Action Against Drug Abuse"**. The live footer should be brought in line.
2. **Fonts loaded twice.** `src/app/layout.tsx` loads Geist and Geist Mono through `next/font`, but the CSS uses DM Sans and Space Grotesk from a Google Fonts `@import`. Load DM Sans and Space Grotesk through `next/font/google` and remove Geist.
3. **Leftover dark theme.** The `.dark` block uses an olive/terracotta palette (`--accent: 17 43% 59%`) from an earlier template. It is unused and off-brand. `.nav-cta:hover` also uses a terracotta `hsl(17 43% 43%)` where a darker red is expected.
4. **Accent hex drift.** The public accent computes to `#C70025`, while the admin hard-codes `#C90025`. Pick one.
5. **Duplicate components.** `ButtonLink`, `Eyebrow`, `HeroCarousel` and `Footer` exist both as standalone files and inside `site.tsx`.
