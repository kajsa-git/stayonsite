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

## Deployment

- **Vercel project:** `stayonsite` (NOT `stayonsite-quick-lodgings-finder`)
- **GitHub repo:** `Ac0AI/stayonsite-quick-lodgings-finder` (redirects from `Davidodpr/...`)
- Auto-deploys on push to `main`. SPA fallback rewrite in `vercel.json`.
- Domain: **stayonsite.se** (redirects to www.stayonsite.se)
- `npx vercel --prod` deploys to a separate project — always use `git push` for production deploys.
