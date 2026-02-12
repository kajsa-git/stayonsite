# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server on port 8080
pnpm build        # Production build (sitemap → vite-react-ssg)
pnpm lint         # ESLint
pnpm test         # Vitest (jsdom, globals enabled)
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
| `/blogg` | — | — |
| `/lp/husagare` | — | — |

All routes defined in `src/routes.tsx` (with `getStaticPaths` for SSG). `src/App.tsx` is the layout wrapper with providers.

### Language System

- `src/contexts/LanguageContext.tsx` — React Context holding current locale (`sv`/`en`/`pl`), auto-detects from URL path
- `src/hooks/use-translation.ts` — `useTranslation()` hook returns `t(key)` function
- `src/data/translations.ts` — All UI strings keyed by `TranslationKey`
- `src/lib/utils.ts` — `normalizeLocale()`, `getLocalizedText()`, `getLocalizedKeywords()`
- `src/types/localized.ts` — `Locale`, `LocalizedString`, `LocalizedKeywords` types

When adding new UI text: add the key to `translations.ts` with all three languages + add to `TranslationKey` type union, then use `t('key')`.

### City Data

`src/data/cities.ts` (~2800 lines) contains all city entries with localized names, descriptions, FAQ, projects, neighborhoods, testimonials, and SEO metadata. City pages are rendered by `src/pages/CityPage.tsx` using the `:citySlug` param. Adding a city here + rebuilding auto-generates the sitemap entry with hreflangs.

### Blog System

- Articles are full TSX components in `src/pages/blogg/` using `BlogLayout` wrapper
- Metadata in `src/data/blog-posts.ts` (BlogPost interface)
- **Auto-generation:** `scripts/generate-article.mjs` calls Claude API with web search
- **Weekly cron:** `.github/workflows/article.yml` — every Wednesday 09:00 CET, commits and pushes automatically

**Adding a new article requires updating 4 files:**
1. Create TSX component in `src/pages/blogg/`
2. Add metadata to `src/data/blog-posts.ts`
3. Add route to `src/routes.tsx`
4. Add URL to `scripts/generate-sitemap.mjs`

### Landing Pages

- **Route:** `/lp/husagare` — isolated page without Header/Footer/navigation
- **Components:** `src/components/lp/` (LpHeroForm, LpTrustBadges, LpTestimonials, LpBottomCTA)
- **Tracking:** UTM capture (`src/hooks/use-utm-capture.ts`) + Facebook Pixel (`src/hooks/use-facebook-pixel.ts`, loaded via `VITE_FB_PIXEL_ID` env var)
- **SEO protection:** noindex meta + `robots.txt Disallow: /lp/` + no internal links

### SEO & GEO

- `src/components/SEO.tsx` — Sets meta tags (OG, Twitter, hreflang, JSON-LD) per page via `vite-react-ssg` Head. Every page should use this component.
- `index.html` — Static fallback tags (used if SSG head fails)
- `public/llms.txt` — AI-readable company info for LLM crawlers (ChatGPT, Perplexity, Claude)
- `public/robots.txt` — Allows all bots including AI crawlers
- `scripts/generate-sitemap.mjs` — Auto-generates sitemap with current date on each build

**Important:** Do NOT use `motion.h1` or `motion.h2` for headings — Framer Motion's `initial={{ opacity: 0 }}` renders `style="opacity:0"` in SSG output, making headings invisible to crawlers. Use plain `<h1>`/`<h2>` elements instead.

### UI Stack

- **shadcn/ui** components in `src/components/ui/` (configured via `components.json`)
- **Tailwind CSS** with custom Nordic color palette (`nordic-100` through `nordic-900`), accent `#ff6300`
- **Fonts:** Inter (sans), Montserrat (heading), Playfair Display (display)
- **Radix UI** primitives underneath shadcn
- **Framer Motion** for animations (but NOT on h1/h2 — see SEO note above)
- **Sonner** for toasts
- `cn()` from `src/lib/utils.ts` for merging Tailwind classes

### Forms

React Hook Form + Zod validation. Forms POST to FormSubmit.co (`https://formsubmit.co/ajax/kajsa@stayonsite.se`). See `src/components/inquiry/` and `src/components/homeowner/` for patterns.

### State Management

- **React Query** (`@tanstack/react-query`) for async/server state
- **React Context** for language only
- No global state library

### Path Alias

`@/*` maps to `src/*` (configured in tsconfig + vite).

### Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_FB_PIXEL_ID` | Vercel | Facebook Pixel for landing pages |
| `ANTHROPIC_API_KEY` | GitHub Secret | Article auto-generation |
| `NOTION_TOKEN` | `.env` + GitHub Secret | CRM reads/writes |
| `NOTION_STANDUPS_PAGE_ID` | `.env` + GitHub Secret | Standup Notion page |

## Team & Operations

- **`/standup`** — Veckovis team-standup: läser CRM (compact), kör 3 agenter parallellt, ger Kajsa en att-göra-lista
- **`TEAM.md`** — Komplett teamstruktur, kanaler, budget och automationsplan
- **`standups/`** — Veckoprotokoll sparas här automatiskt
- **CRM-script:** `scripts/read-notion-context.mjs` (`--compact` för ~2KB sammanfattning, utan flagga för full JSON)
- **Notion-push:** `scripts/push-to-notion.mjs` (markdown → Notion page)

## SEO Intelligence

Senast uppdaterad: 2026-02-07. Källa: Sem-projektet (SEO keyword pipeline).

### Affärskontext

Kajsas fokus är **projekt utanför storstäderna** — bäst marginal i mindre städer. Storstadssökord (Stockholm, Göteborg) är bra för trovärdighet men de mindre städerna (Boden, Oskarshamn, Säffle, Gävle, Luleå) är affärskritiska.

All text på sajten måste vara **trovärdig och professionell** — inga generiska AI-formuleringar, inga överdrifter, ingen skojarton.

### Konkurrenter

- **forenom.com**: 965 sökord, snittpos 30 (dominant, lägenhetshotell-profil)
- **guestit.se**: 835 sökord, snittpos 42 (stark bloggstrategi)
- **foretagsbostader.se**: 344 sökord, snittpos 50 (äger "företagsbostäder")
- **corporate-apartments.se**: 128 sökord, snittpos 51 (bygg & entreprenad, direkt konkurrent)
- **rentaborg.com**: 97 sökord, snittpos 49 (corporate housing)

### Gap-sökord (topp-prioritet)

**Affärskritiska städer:** Boden ("boende boden" 320/mån), Luleå ("boende luleå" 880/mån), Oskarshamn ("boende oskarshamn" 480/mån)

**Statiska sidor:** `/for-foretag` → "företagsbostäder" (590/mån), "projektboende" (70/mån). `/for-husagare` → "hyra ut hus till företag" (260/mån)

### Textriktlinjer

- Använd sökord **naturligt** i text, inte stuffat
- Skriv som ett seriöst B2B-bolag, inte en annons
- Konkreta siffror > vaga löften ("svar inom 24h" > "snabb service")
- Nämn specifika projekt/industrier per stad för trovärdighet

## Deployment

- **Vercel project:** `stayonsite` (NOT `stayonsite-quick-lodgings-finder`)
- **GitHub repo:** `Ac0AI/stayonsite-quick-lodgings-finder`
- Auto-deploys on push to `main`. SPA fallback rewrite + security headers in `vercel.json`.
- Domain: **stayonsite.se** (redirects to www.stayonsite.se)
- `npx vercel --prod` deploys to a separate project — always use `git push` for production deploys.
