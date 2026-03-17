# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 8080
pnpm build        # Production build (Next.js static export)
pnpm lint         # Next.js ESLint
pnpm test         # Vitest (jsdom, globals enabled)
```

Always use `pnpm`, not npm/yarn.

## Architecture

React 18 SSG (Static Site Generation) built with **Next.js App Router** (`output: 'export'`), deployed to Vercel at **stayonsite.se**.

All pages are pre-rendered to static HTML at build time. Output goes to `out/`.

### Routing (Next.js App Router)

Three language variants with parallel route structures:

| Swedish (default) | English | Polish |
|---|---|---|
| `/` | — | — |
| `/stad/:citySlug` | `/en/corporate-housing/:citySlug` | `/pl/zakwaterowanie/:citySlug` |
| `/for-husagare` | `/en/corporate-housing-sweden` | `/pl/zakwaterowanie-firmowe` |
| `/om-oss` | — | — |
| `/blogg` | — | — |
| `/lp/husagare` | — | — |

Routes defined in `app/` directory. Dynamic routes use `generateStaticParams()`. Layout + providers in `app/layout.tsx` and `app/providers.tsx`.

**Important:** In Next.js 15+, `params` is a Promise. Dynamic page components must use `async function Page({ params }: { params: Promise<{ slug: string }> })` and `await params`.

### Page Structure

Each `app/*/page.tsx` is a thin wrapper that:
1. Exports `metadata` (static) or `generateMetadata()` (dynamic) via `buildMetadata()` from `src/lib/metadata.ts`
2. Renders the actual page component from `src/views/`

Page components live in `src/views/` (NOT `src/pages/` — renamed to avoid Next.js Pages Router detection).

### Language System

- `src/contexts/LanguageContext.tsx` — React Context holding current locale (`sv`/`en`/`pl`), auto-detects from URL path
- `src/hooks/use-translation.ts` — `useTranslation()` hook returns `t(key)` function
- `src/data/translations.ts` — All UI strings keyed by `TranslationKey`
- `src/lib/utils.ts` — `normalizeLocale()`, `getLocalizedText()`, `getLocalizedKeywords()`
- `src/types/localized.ts` — `Locale`, `LocalizedString`, `LocalizedKeywords` types

When adding new UI text: add the key to `translations.ts` with all three languages + add to `TranslationKey` type union, then use `t('key')`.

### City Data

`src/data/cities.ts` (~2800 lines) contains all city entries with localized names, descriptions, FAQ, projects, neighborhoods, testimonials, and SEO metadata. City pages are rendered by `src/views/CityPage.tsx` receiving `citySlug` and `locale` as props. Adding a city here + rebuilding auto-generates the sitemap entry with hreflangs.

### Blog System

- Articles are full TSX components in `src/views/blogg/` using `BlogLayout` wrapper
- Metadata in `src/data/blog-posts.ts` (BlogPost interface)
- Import map in `app/blogg/[slug]/page.tsx` maps slugs to components
- **Auto-generation:** `scripts/generate-article.mjs` calls Claude API with web search
- **Weekly cron:** `.github/workflows/article.yml` — every Wednesday 09:00 CET, commits and pushes automatically

**Adding a new article requires updating 3 files:**
1. Create TSX component in `src/views/blogg/`
2. Add metadata to `src/data/blog-posts.ts`
3. Add import + mapping to `app/blogg/[slug]/page.tsx`

(Sitemap auto-generates from `blog-posts.ts` via `app/sitemap.ts`)

### Landing Pages

- **Route:** `/lp/husagare` — isolated page without Header/Footer/navigation
- **Components:** `src/components/lp/` (LpHeroForm, LpTrustBadges, LpTestimonials, LpBottomCTA)
- **Tracking:** UTM capture (`src/hooks/use-utm-capture.ts`) + Facebook Pixel (`src/hooks/use-facebook-pixel.ts`, loaded via `NEXT_PUBLIC_FB_PIXEL_ID` env var)
- **SEO protection:** noindex meta + `robots.txt Disallow: /lp/` + no internal links

### SEO & GEO

- **Metadata:** `src/lib/metadata.ts` — `buildMetadata()` helper generates Next.js Metadata objects. Used in all `page.tsx` files.
- **JSON-LD:** `src/components/SEO.tsx` — Compatibility wrapper that only renders `<script type="application/ld+json">`. Used inside page components for structured data.
- **Sitemap:** `app/sitemap.ts` — Auto-generates from cities + blog-posts data at build time
- `public/llms.txt` — AI-readable company info for LLM crawlers (ChatGPT, Perplexity, Claude)
- `public/robots.txt` — Allows all bots including AI crawlers

**Important:** Do NOT use `motion.h1` or `motion.h2` for headings — Framer Motion's `initial={{ opacity: 0 }}` renders `style="opacity:0"` in SSG output, making headings invisible to crawlers. Use plain `<h1>`/`<h2>` elements instead.

### UI Stack

- **shadcn/ui** components in `src/components/ui/` (configured via `components.json`)
- **Tailwind CSS** with custom Nordic color palette (`nordic-100` through `nordic-900`), accent `#ff6300`
- **Fonts:** Inter (sans), Montserrat (heading), Playfair Display (display) — loaded via `next/font/google`
- **Radix UI** primitives underneath shadcn
- **Framer Motion** for animations (but NOT on h1/h2 — see SEO note above)
- **Sonner** for toasts
- `cn()` from `src/lib/utils.ts` for merging Tailwind classes

All client-side components must have `'use client'` directive at the top.

### Forms

React Hook Form + Zod validation. Forms POST to FormSubmit.co (`https://formsubmit.co/ajax/kajsa@stayonsite.se`). See `src/components/inquiry/` and `src/components/homeowner/` for patterns.

### State Management

- **React Query** (`@tanstack/react-query`) for async/server state
- **React Context** for language only
- No global state library

### Path Alias

`@/*` maps to `src/*` (configured in tsconfig).

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FB_PIXEL_ID` | Vercel | Facebook Pixel for landing pages |
| `ANTHROPIC_API_KEY` | GitHub Secret | Article auto-generation |
| `NOTION_TOKEN` | `.env` + GitHub Secret | CRM reads/writes |
| `NOTION_STANDUPS_PAGE_ID` | `.env` + GitHub Secret | Standup Notion page |

## Team & Operations

- **`/standup`** — Veckovis team-standup: laser CRM (compact), kor 3 agenter parallellt, ger Kajsa en att-gora-lista
- **`TEAM.md`** — Komplett teamstruktur, kanaler, budget och automationsplan
- **`standups/`** — Veckoprotokoll sparas har automatiskt
- **CRM-script:** `scripts/read-notion-context.mjs` (`--compact` for ~2KB sammanfattning, utan flagga for full JSON)
- **Notion-push:** `scripts/push-to-notion.mjs` (markdown -> Notion page)

## SEO Intelligence

Senast uppdaterad: 2026-02-07. Kalla: Sem-projektet (SEO keyword pipeline).

### Affarkontext

Kajsas fokus ar **projekt utanfor storstaderna** — bast marginal i mindre stader. Storstadssokord (Stockholm, Goteborg) ar bra for trovardighet men de mindre staderna (Boden, Oskarshamn, Saffle, Gavle, Lulea) ar affarskritiska.

All text pa sajten maste vara **trovarding och professionell** — inga generiska AI-formuleringar, inga overdrifter, ingen skojarton.

### Konkurrenter

- **forenom.com**: 965 sokord, snittpos 30 (dominant, lagenhetshotell-profil)
- **guestit.se**: 835 sokord, snittpos 42 (stark bloggstrategi)
- **foretagsbostader.se**: 344 sokord, snittpos 50 (ager "foretagsbostader")
- **corporate-apartments.se**: 128 sokord, snittpos 51 (bygg & entreprenad, direkt konkurrent)
- **rentaborg.com**: 97 sokord, snittpos 49 (corporate housing)

### Gap-sokord (topp-prioritet)

**Affarskritiska stader:** Boden ("boende boden" 320/man), Lulea ("boende lulea" 880/man), Oskarshamn ("boende oskarshamn" 480/man)

**Statiska sidor:** `/for-foretag` -> "foretagsbostader" (590/man), "projektboende" (70/man). `/for-husagare` -> "hyra ut hus till foretag" (260/man)

### Textriktlinjer

- Anvand sokord **naturligt** i text, inte stuffat
- Skriv som ett seriest B2B-bolag, inte en annons
- Konkreta siffror > vaga loften ("svar inom 24h" > "snabb service")
- Namn specifika projekt/industrier per stad for trovardighet

## Deployment

- **Vercel project:** `stayonsite` (NOT `stayonsite-quick-lodgings-finder`)
- **GitHub repo:** `Ac0AI/stayonsite-quick-lodgings-finder`
- Auto-deploys on push to `main`. Security headers in `vercel.json`.
- Domain: **stayonsite.se** (redirects to www.stayonsite.se)
- `npx vercel --prod` deploys to a separate project — always use `git push` for production deploys.
