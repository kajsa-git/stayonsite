---
name: verify
description: Verifiera CRM-/sajtändringar körande lokalt — lokal DB, riktig session, headless Chrome. Använd när en ändring i src/components/crm, app/crm eller app/api/crm ska ses fungera på riktigt utan att röra produktions-Turso.
---

# Verifiera StayOnSite lokalt (CRM)

## Recept som fungerar

1. **Lokal DB med fullt schema + seed** — bygg en fil-DB från `drizzle/`-journalen
   (samma split-på-";" som `src/lib/crm/cascade-delete.test.ts`) och seeda:
   godkänd användare i `crm_users` (approved=1), rad i `crm_sessions`
   (sessionToken valfri sträng, expires = ms-epoch), företag/förfrågan/uthyrare/
   objekt/match efter behov.

2. **Servera DB:n över HTTP — INTE `file:`** — appens middleware kör i edge-runtime
   där libsql-klienten inte stödjer `file:`-URL:er (API-routes/RSC funkar, men alla
   /crm-sidor 307:ar till login). Kör i stället:
   `turso dev --db-file <path>/verify.db --port 8880` (finns via Homebrew).

3. **Dev-server mot lokala DB:n** (env-varor slår .env.local):
   `TURSO_DATABASE_URL="http://127.0.0.1:8880" TURSO_AUTH_TOKEN="" pnpm dev`

4. **Auth = cookie rakt av** (database sessions, next-auth v5):
   `authjs.session-token=<sessionToken från seed>` — funkar i curl och Playwright.
   Ingen Google-OAuth behövs.

5. **Headless Chrome utan browserdnedladdning**: `npm i playwright-core` i scratchpad
   + `chromium.launch({ channel: "chrome", headless: true })` (systemets Chrome).

## Fallgropar

- **Playwrights `getByRole(name:)` matchar SUBSTRING** — "Kalkyl" träffar även
  TopBarens ikonknapp `title="Vinstkalkylator"`. Använd `exact: true` och scopa
  till kortet/regionen: `page.locator("div.border.rounded-lg", { hasText: … })`.
- **Regex-namn i getByRole normaliserar inte whitespace** (ikon + text ger ledande
  mellanslag) — använd sträng + `exact: true` i stället för `/^…$/`.
- **sv-SE-tal**: tusentalsavgränsare är NBSP och minus är unicode-minus (−, U+2212).
  Matcha med regex `/[−-]12\s?000/`-stil, inte ASCII-strängar.
- **Toast-kvittenser**: CRM:t har egen root-layout (`app/crm/layout.tsx`) utan
  sajtens Providers — `<Toaster />` måste vara monterad där (fixat 2026-07-12,
  saknades tyst i över ett år). Verifiera gärna skrivningar via API/omladdning
  också, inte bara toasttext.
- Döda gamla processer på port 8080 först: `lsof -ti :8080 | xargs kill`.
- **`pnpm start` (prod-läge) kräver `AUTH_TRUST_HOST=true`** — annars ger auth()
  null → 401 på alla CRM-anrop trots giltig sessions-cookie (dev litar på hosten
  automatiskt, prod gör det inte). Sätt även `AUTH_URL="http://localhost:8080"`.
- **Läckagekoll av publika sidor: kör mot `pnpm build` + `pnpm start`, inte dev** —
  dev-lägets React-flight streamar awaitade värden som debug-info (råa libSQL-resultat
  med `columns`/`rows`/`rowsAffected` syns i HTML:en). Ser ut som en dataläcka men
  strippas helt i produktionsbygget (verifierat 2026-07-12).
