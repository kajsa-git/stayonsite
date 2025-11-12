# Homepage Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a mobile-first, high-conversion landing page that keeps copy concise, drives immediate dialog, and presents proof in an energetic, consistent layout.

**Architecture:** Recompose the landing page into four tight sections (Hero/Snabbvy, Why StayOnSite, Case + Metrics, Next Steps) using existing component structure. Reuse context + translation systems, lean on Tailwind utility classes, and ensure accent color `#ff6300` is applied consistently for CTAs and highlights.

**Tech Stack:** React + TypeScript, Vite, TailwindCSS, shadcn/ui components, React Router.

---

### Task 1: Restructure Hero into compact “Dialog-first” block

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/data/translations.ts`
- Modify: `src/App.css` (add accent variables if needed)

**Step 1: Update translations for new hero copy**
- Replace existing hero strings with shorter headline/subheadline.
- Add keys for chip labels, dialog-card labels, response time note.

**Step 2: Implement layout**
- Use flex/stacked layout max height 480px desktop, 80vh mobile.
- Add gradient overlay darker than current (e.g., `from-black/70 to-black/30`).
- Render three clickable chips linking to `#why`, `#case`, `#contact`.
- Build dialog-card (phone + WhatsApp + response time text) using accent color `#ff6300`.

**Step 3: Add “Snabbvy” metrics row**
- Immediately under hero component, render a horizontal list of 3 metrics referencing new translation keys.
- On mobile, stack vertically with separator lines.

**Step 4: Verify responsive behavior**
- Use browser devtools (or `npm run dev` + manual check) to ensure hero height and chips wrap correctly under 640px.

**Step 5: Commit**

---

### Task 2: Replace ValueProps with “Why StayOnSite” timeline

**Files:**
- Modify: `src/components/ValueProps.tsx` (rename or replace)
- Modify: `src/pages/Index.tsx`
- Modify: `src/data/translations.ts`

**Step 1: Rename section and translation keys**
- `valueProps.*` → `why.timeline.*` (title, subtitle, steps, CTAs).

**Step 2: Implement horizontal timeline**
- Structure: parent section `id="why"`, contains 3 timeline steps (Planning, Contracts, Drift) as cards with accent top border.
- Each step includes icon, one-sentence description, and CTA button linking to `#contact`.
- On mobile, timeline stacks vertically with connector lines (use pseudo-elements or border-left).

**Step 3: Integrate into page**
- Update `Index.tsx` to import new `WhyStayOnSite` component.
- Place after hero/snabbvy.

**Step 4: Accessibility + consistency**
- Ensure buttons have accessible labels, accent color meets contrast (>4.5:1). If not, darken accent for text.

**Step 5: Commit**

---

### Task 3: Rebuild Case + Metrics section

**Files:**
- Modify: `src/components/CaseStudy.tsx` (new component)
- Modify: `src/pages/Index.tsx`
- Modify: `src/data/translations.ts`
- Add: background image asset if needed under `public/images/case-saffle.jpg`

**Step 1: Add translation keys**
- Title, timeline labels (24h proposal, 48h move-in, 3 sites), KPI descriptions.

**Step 2: Build component**
- Layout: two-column card (stack on mobile).
- Left column: case narrative with timeline (three steps, accent dots).
- Right column: metrics stack with `#ff6300` background and white text showing numbers (e.g., “24h”).

**Step 3: Integrate background photo**
- Use `style{{ backgroundImage }}` with dark overlay to keep text legible.

**Step 4: Wire anchor links**
- Chips in hero referencing case should scroll to this section via `id="case"`.

**Step 5: Commit**

---

### Task 4: Compact “Next Steps” section combining reference + contact

**Files:**
- Modify: `src/components/References.tsx` (or create new `NextSteps.tsx`)
- Modify: `src/components/InquiryForm.tsx`
- Modify: `src/pages/Index.tsx`
- Modify: `src/data/translations.ts`

**Step 1: Create `NextSteps` wrapper**
- Contains small testimonial card (quote + person) and simplified inquiry form side-by-side (stack on mobile).
- Add CTA buttons (phone + WhatsApp) repeated here.

**Step 2: Simplify form fields**
- Keep essentials: Company, Contact, Email, Phone, Location, Workers.
- Provide optional extras behind “visa fler fält” accordion.

**Step 3: Update translations**
- Add new labels for “Nästa steg”, “Boka ett samtal”, “Visa fler fält”, etc.

**Step 4: Wire sticky mini-CTA**
- When user scrolls beyond form, show a small sticky bar with phone + WhatsApp chips.
- Ensure this component only appears on mobile.

**Step 5: Testing**
- Run `npm run build` and manual form validation.

**Step 6: Commit**

---

### Task 5: Apply accent color system-wide

**Files:**
- Modify: `src/index.css` or `tailwind.config.ts` (extend theme with `accent: '#ff6300'`)
- Search & replace: update button classes to use `bg-accent` etc.

**Steps:**
1. Extend Tailwind theme `colors.accent`.
2. Replace hard-coded `bg-nordic-500` CTAs with accent variant where appropriate (hero buttons, timeline CTAs, sticky button).
3. Ensure hover state darkens accent (e.g., `#e25200`).
4. Run `npm run build` to confirm no Tailwind purge issues.
5. Commit.

---

### Task 6: QA pass + polish

**Files/Steps:**
1. Run `npm run build` and `npm run preview`.
2. Verify anchor links (#why, #case, #contact) scroll correctly.
3. Check mobile view (Chrome devtools iPhone 14) for each section.
4. Lint (if configured) `npm run lint`.
5. Final commit `feat: refresh landing layout`.

---

Plan complete and saved to `docs/plans/2025-11-12-homepage-refresh-plan.md`.  
