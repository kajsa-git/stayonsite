# City Pages Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild every `/stad/:citySlug` page with unique, city-specific SEO content, updated schema, and stronger internal linking so they rank and convert without duplicate copy.

**Architecture:** Extend the `City` data model with rich per-city content blobs (hero hook, neighborhoods, metrics, FAQ, testimonial). Recompose `CityPage` to consume that data for each section (hero, overview, locations, process, testimonial, FAQ, CTA) and inject city-specific structured data + metadata. Update linking components so crawlers and users can reach every city page.

**Tech Stack:** React + TypeScript, React Router, TailwindCSS, custom SEO component, pnpm/npm scripts (Vite build).

---

### Task 1: Expand City Data Model With Unique Content

**Files:**
- Modify: `src/data/cities.ts`

**Step 1:** Extend the `City` interface with fields for `heroHook`, `intro`, `neighborhoods`, `projects`, `metrics`, `testimonial`, `faq`, and `keywords`. Include TypeScript types for nested objects (e.g., `CityMetric`, `CityFAQ`).

**Step 2:** For each existing city entry, populate the new fields with unique copy: custom hero sentence, intro paragraph, 3+ neighborhood strings, 3+ current projects, an array of key metrics (value + label), testimonial quote/author/company, and at least 3 FAQ entries tailored to the city’s concerns.

**Step 3:** Add helper exports (e.g., `citySlugs`, `getNearbyCities(citySlug)` returning two related cities by geography) since later tasks will rely on them for linking.

**Step 4:** Run `npm run build` to ensure TypeScript compiles with the expanded data structure (acts as our type test).

**Step 5:** Commit with `git add src/data/cities.ts && git commit -m "feat: enrich city data"` once build succeeds.

---

### Task 2: Recompose CityPage Layout Around New Data

**Files:**
- Modify: `src/pages/CityPage.tsx`
- Modify: `src/components/Breadcrumbs.tsx` (to accept new breadcrumb schema props if needed)
- Modify: `src/components/FloatingPhoneButton.tsx` (ensure phone CTA references new copy if necessary)

**Step 1:** Replace the current hero JSX with a new layout that uses each city’s `heroHook`, `intro`, and `metrics`. Include chips for “Varför [stad]”, “Områden vi täcker”, “Kontakta oss”, anchored to section IDs.

**Step 2:** Add sections:
  - “Om projekt i [stad]” using the `projects` list
  - “Områden vi placerar team i” showing `neighborhoods` with commute notes
  - “Så löser Kajsa & Natalie boendet” reusing global process copy but injecting city name + SLA
  - Testimonial card pulling from `city.testimonial`
  - FAQ accordion using `city.faq`

Provide accessible headings (H2/H3) with city-specific keywords (`keywords` array).

**Step 3:** Ensure CTA buttons (phone, WhatsApp, form link) repeat in hero and near the bottom, referencing the founder value prop (“Kajsa eller Natalie svarar inom 24h”).

**Step 4:** Use the new helper `getNearbyCities` to render a “Behöver ni även boende i …?” cross-link block at the bottom of each city page.

**Step 5:** Run `npm run build` to catch JSX/typing issues. Once green, `git add src/pages/CityPage.tsx src/components/Breadcrumbs.tsx src/components/FloatingPhoneButton.tsx` and commit "feat: rebuild city page layout".

---

### Task 3: Inject City-Specific SEO Metadata & Schema

**Files:**
- Modify: `src/pages/CityPage.tsx`
- Modify: `src/components/SEO.tsx` (if new props required for FAQ/Breadcrumb schema)

**Step 1:** Generate dynamic `<title>` and `<meta description>` strings that use the primary keyword from `city.keywords[0]` plus the 24h promise. Pass them into `<SEO>` rather than hardcoding inside the component.

**Step 2:** Build FAQ schema JSON-LD using the `city.faq` array and inject via the existing `structuredData` prop (wrap both LocalBusiness and FAQ in an array).

**Step 3:** Add `BreadcrumbList` schema (Home → Stad → City). If `SEO.tsx` only accepts one object, update it to allow arrays of schema objects.

**Step 4:** Include `Service` schema snippet referencing the city, with `areaServed` and `provider` matching the new copy, to reinforce topical relevance.

**Step 5:** Run `npm run build` and manually inspect page source in `npm run preview` to confirm JSON-LD renders correctly without duplicates. Commit as "feat: enhance city SEO metadata".

---

### Task 4: Improve Internal Linking & City Directory

**Files:**
- Modify: `src/components/CityLinks.tsx`
- Modify: `src/components/Footer.tsx` (optional: add sitewide link to a “Alla städer” anchor)
- Add: `src/components/CityDirectory.tsx` (if list grows too large for `CityLinks`)

**Step 1:** Update `CityLinks` to iterate over all cities (remove `.slice(0, 10)`), group them by region (e.g., Stockholm/Mälardalen, Västsverige, Skåne, etc.), and render accessible anchor tags linking to each `/stad/<slug>`.

**Step 2:** Add an optional search/autocomplete input for quick navigation (client-side filter). Ensure it’s keyboard accessible.

**Step 3:** From each city page, include `rel="nofollow"`? (No, keep follow) internal links to two nearby cities using `getNearbyCities`.

**Step 4:** Run `npm run build` followed by `npm run preview` to ensure the expanded list doesn’t break layout on desktop/mobile. Commit with "feat: expose all city links".

---

### Task 5: QA, Lint, and Regression Checks

**Files/Commands:**
- Run: `npm run lint`
- Run: `npm run build`
- Run: `npm run preview` (manual)

**Step 1:** `npm run lint` – ensure ESLint passes. Fix any issues that surface (likely formatting or missing deps).

**Step 2:** `npm run build` – this double-checks TypeScript types and tree-shaking now that multiple files changed.

**Step 3:** `npm run preview` – load multiple `/stad/*` routes, verify anchors scroll, FAQ toggles, CTA links, schema blocks present in page source, and cross-links show unique cities.

**Step 4:** Once QA passes, `git status` to confirm only intended files changed, then `git add .` and `git commit -m "feat: finish city SEO refresh"` to wrap up.

---

Plan complete and saved to `docs/plans/2025-11-15-city-pages-refresh-plan.md`. Two execution options:

1. **Subagent-Driven (this session)** – dispatch fresh subagent per task with code review between tasks for rapid iteration.
2. **Parallel Session (separate)** – open a new session dedicated to executing this plan with `superpowers:executing-plans`.

Which approach should we use?
