# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 8080
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Vitest (jsdom environment)
```

Always use `pnpm`, not npm/yarn.

## Architecture

React 18 SSG (Static Site Generation) built with Vite + SWC + `vite-react-ssg`, deployed to Vercel at **stayonsite.se**.

All pages are pre-rendered to static HTML at build time. The build command runs `generate-sitemap.mjs` first, then `vite-react-ssg build`.

### Routing (React Router v6 + vite-react-ssg)

Three language variants with parallel route structures:

| Swedish (default) | English | Polish |
|---|---|---|
| `/` | — | — |
| `/stad/:citySlug` | `/en/corporate-housing/:citySlug` | `/pl/zakwaterowanie/:citySlug` |
| `/for-husagare` | `/en/corporate-housing-sweden` | `/pl/zakwaterowanie-firmowe` |
| `/om-oss` | — | — |
| `/lp/husagare` | — | — |

All routes defined in `src/routes.tsx` (with `getStaticPaths` for SSG). `src/App.tsx` is the layout wrapper with providers.

### Language System

- `src/contexts/LanguageContext.tsx` — React Context holding current locale (`sv`/`en`/`pl`), default `sv`
- `src/hooks/use-translation.ts` — `useTranslation()` hook returns `t(key)` function
- `src/data/translations.ts` — All UI strings keyed by `TranslationKey`
- `src/lib/utils.ts` — `normalizeLocale()`, `getLocalizedText()`, `getLocalizedKeywords()`
- `src/types/localized.ts` — `Locale`, `LocalizedString`, `LocalizedKeywords` types

When adding new UI text: add the key to `translations.ts` with all three languages, then use `t('key')`.

### City Data

`src/data/cities.ts` (124KB) contains all city entries with localized names, descriptions, and SEO metadata. City pages are rendered by `src/pages/CityPage.tsx` using the `:citySlug` param.

### SEO & GEO

- `src/components/SEO.tsx` — Sets meta tags (OG, Twitter, hreflang, JSON-LD) per page via `vite-react-ssg` Head. Every page should use this component.
- `index.html` — Static fallback tags (used if SSG head fails)
- `public/llms.txt` — AI-readable company info for LLM crawlers (ChatGPT, Perplexity, Claude)
- `public/robots.txt` — Allows all bots including AI crawlers
- `scripts/generate-sitemap.mjs` — Auto-generates sitemap with current date on each build

**Important:** Do NOT use `motion.h1` or `motion.h2` for headings — Framer Motion's `initial={{ opacity: 0 }}` renders `style="opacity:0"` in SSG output, making headings invisible to crawlers. Use plain `<h1>`/`<h2>` elements instead.

### UI Stack

- **shadcn/ui** components in `src/components/ui/` (configured via `components.json`)
- **Tailwind CSS** with custom Nordic color palette (`nordic-100` through `nordic-900`) and font families: Inter (sans), Montserrat (heading), Playfair Display (display)
- **Radix UI** primitives underneath shadcn
- **Framer Motion** for animations
- **Sonner** for toasts
- `cn()` from `src/lib/utils.ts` for merging Tailwind classes

### Forms

React Hook Form + Zod validation. See `src/components/inquiry/` and `src/components/homeowner/` for patterns.

### State Management

- **React Query** (`@tanstack/react-query`) for async/server state
- **React Context** for language only
- No global state library

### Path Alias

`@/*` maps to `src/*` (configured in tsconfig + vite).

## Team & Operations

- **`/standup`** — Veckovis team-standup som startar alla AI-agenter parallellt
- **`TEAM.md`** — Komplett teamstruktur, kanaler, budget och automationsplan
- **`standups/`** — Veckoprotokoll sparas här automatiskt

## SEO Intelligence (auto-genererad från keyword-analys)

Senast uppdaterad: 2026-02-07
Källa: `/Users/dpr/Documents/Project/Sem/data/seo_action_plan.md`

### Affärskontext

Kajsas fokus är **projekt utanför storstäderna** — bäst marginal i mindre städer där hon kan sourca boende billigt. Storstadssökord (Stockholm, Göteborg) är bra för trovärdighet men de mindre städerna (Boden, Oskarshamn, Säffle, Gävle, Luleå) är affärskritiska.

All text på sajten måste vara **trovärdig och professionell** — inga generiska AI-formuleringar, inga överdrifter, ingen skojarton.

### Konkurrenter (10 analyserade)

- **forenom.com**: 965 sökord, snittpos 30 (dominant, lägenhetshotell-profil)
- **guestit.se**: 835 sökord, snittpos 42 (stark bloggstrategi)
- **foretagsbostader.se**: 344 sökord, snittpos 50 (äger "företagsbostäder", starkast i segmentet)
- **swedenlongstay.se**: 133 sökord, snittpos 45
- **corporate-apartments.se**: 128 sökord, snittpos 51 (bygg & entreprenad, direkt konkurrent)
- **bostadstjanst.com**: 120 sökord, snittpos 58
- **rentaborg.com**: 97 sökord, snittpos 49 (corporate housing)

### Gap-sökord att arbeta in per sida

När du redigerar en stadssida eller statisk sida, försök naturligt väva in dessa sökord. **Viktigast: mindre städer med hög affärsrelevans.**

**Boden** (`/stad/boden`) — affärskritisk:
  "lägenheter boden" (1300/mån), "boende boden" (320/mån), "hyreslägenheter boden" (170/mån)

**Luleå** (`/stad/lulea`) — affärskritisk:
  "boende luleå" (880/mån), "hyra lägenhet luleå" (880/mån), "korttidsboende luleå" (110/mån)

**Oskarshamn** (`/stad/oskarshamn`):
  "boende oskarshamn" (480/mån), "boende i oskarshamn" (480/mån)

**Norrköping** (`/stad/norrkoping`):
  "norrköping boende" (1000/mån), "boende norrköping" (1000/mån)

**Gävle** (`/stad/gavle`):
  "lägenhetshotell gävle" (50/mån), "korttidsboende gävle" (50/mån)

**Linköping** (`/stad/linkoping`):
  "lägenhetshotell linköping" (260/mån), "billigt boende linköping" (170/mån)

**Stockholm** (`/stad/stockholm`) — för trovärdighet:
  "boende stockholm" (2900/mån), "lägenhetshotell stockholm" (2400/mån)

**Göteborg** (`/stad/goteborg`):
  "korttidsboende göteborg" (480/mån), "lägenhetshotell göteborg" (720/mån)

**För företag** (`/for-foretag`):
  "företagsbostäder" (590/mån), "tillfälligt boende" (320/mån), "företagslägenheter" (140/mån), "projektboende" (70/mån)

**För husägare** (`/for-husagare`):
  "hyra ut hus till företag" (260/mån), "hyra ut bostadsrätt till företag" (70/mån)

### Textriktlinjer (SEO + trovärdighet)

- Använd sökord **naturligt** i text, inte stuffat
- Undvik överdrifter ("bäst i Sverige", "garanterat billigast")
- Skriv som ett seriöst B2B-bolag, inte en annons
- Konkreta siffror > vaga löften ("svar inom 24h" > "snabb service")
- Nämn specifika projekt/industrier per stad för trovärdighet

## Deployment

- **Vercel project:** `stayonsite` (NOT `stayonsite-quick-lodgings-finder`)
- **GitHub repo:** `Ac0AI/stayonsite-quick-lodgings-finder`
- Auto-deploys on push to `main`. SPA fallback rewrite in `vercel.json`.
- Domain: **stayonsite.se** (redirects to www.stayonsite.se)
- `npx vercel --prod` deploys to a separate project — always use `git push` for production deploys.
