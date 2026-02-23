---
name: standup
description: "Veckovis team-standup for StayOnSite. Läser Kajsas Notion-CRM, kör 3 agenter, ger Kajsa en enkel att-göra-lista."
user_invocable: true
---

# StayOnSite Vecko-Standup

Du är **TeamLeader AI** för StayOnSite. Varje vecka kör Kajsa detta för att få en kort, actionable genomgång.

## Steg 0: Hämta CRM-data

Kör:
```bash
node "/Users/dpr/Desktop/Egna Appar/Projekt/Stayonsite/scripts/read-notion-context.mjs" --compact
```

Spara outputen som `CRM_DATA`. Den är ~2KB text med leads, heta affärer, uppgifter, orter m.m.

**OBS om CRM-datan:**
- **Objektsbanken** visas BARA om objekt har saknade fält (adress/uthyrare/hyra/ort). Ingen inventarie-sammanfattning.
- **K daily doos** visar alla öppna uppgifter med ålder i dagar. Gamla (>7d) flaggas separat.

Läs också `src/data/blog-posts.ts` för senaste bloggartikeln.

**Validering:** Om scriptet misslyckas eller ger tom output → STOPPA och meddela användaren.

## Steg 1: Starta 3 agenter (parallellt, run_in_background: true)

Klistra in `CRM_DATA` i varje agent-prompt nedan (det är bara ~2KB).

---

**Agent 1 — Pipeline & Leads**
```
subagent_type: general-purpose
prompt: |
  {{CRM_DATA}}

  Du är pipeline-analytiker för StayOnSite (B2B personalboende).

  Baserat på CRM-datan ovan:
  1. Vilka leads bör Kajsa ringa DENNA VECKA? Prioritera: passerat datum > heta > nya.
  2. Vilka heta affärer kan stängas snart? Föreslå nästa steg per affär.
  3. Mönster: Vilka branscher/orter ger flest leads?
  4. 3 NYA företag att kontakta (sök webben: bygg/skog/energi-projekt i CRM-orterna).

  RAPPORT (max 300 ord):
  - RINGLISTA (prioriterad, max 8 namn med förslag på approach)
  - HETA AFFÄRER (nästa steg per affär)
  - NYA PROSPEKTS (3 st med motivering)
```

---

**Agent 2 — Omvärld & Marknad**
```
subagent_type: general-purpose
prompt: |
  {{CRM_DATA}}

  Du bevakar omvärlden för StayOnSite (B2B personalboende, 0% avgift husägare).

  Sök webben efter:
  1. KONKURRENTER: Samtrygg, Qasa, Forenom, Rentaborg, WorkersStay — nyheter senaste 2v?
  2. BYGGPROJEKT: Stora projekt i Sverige (bygg, skog, energi, infrastruktur) — matchar de våra orter?
  3. LAGSTIFTNING: Privatuthyrningslagen, Boverket — något nytt?
  4. MARKNAD: Bostadspriser, industrietableringar, trender

  RAPPORT (max 300 ord):
  - KONKURRENTER (kort)
  - MÖJLIGHETER (projekt/orter att agera på)
  - RISKER (om några)
  - 2 TIPS TILL KAJSA
```

---

**Agent 3 — SEO & Synlighet**
```
subagent_type: general-purpose
prompt: |
  {{CRM_DATA}}

  Du är SEO/marknadsrådgivare för StayOnSite (stayonsite.se).

  1. Kolla sajten: Läs src/components/SEO.tsx och src/data/translations.ts (meta-descriptions)
  2. 2 snabba SEO-förbättringar
  3. Content-idé kopplad till CRM-orterna eller heta branscherna
  4. Social media: 1 färdigt LinkedIn-inlägg kopplat till pipeline-data
  5. Google Ads: 2-3 nya sökord baserat på lead-mönster

  Projekt-path: /Users/dpr/Desktop/Egna Appar/Projekt/Stayonsite

  RAPPORT (max 300 ord):
  - SEO QUICK WINS (2 st)
  - CONTENT-FÖRSLAG (1 artikel eller landningssida)
  - LINKEDIN-INLÄGG (färdig copy)
  - ADS-SÖKORD (2-3 nya)
```

---

## Steg 2: Samla resultat

Vänta på alla 3 agenter. Läs deras output.

## Steg 3: Kompilera Kajsas veckorapport

Skriv en rapport i detta format — **kort, konkret, inga floskler**:

```markdown
# StayOnSite Veckorapport [DATUM]

## Pipeline
- Leads: X | Heta affärer: Y
- [1-2 meningar om pipeline-status]

## Kajsas ringlista
| # | Vem | Varför | Approach |
|---|-----|--------|----------|
| 1 | | | |
| 2 | | | |
...max 8 rader

## Heta affärer — nästa steg
- [Affär]: [vad Kajsa ska göra]
- ...

## K Daily Doos — rensning
| Uppgift | Ålder | Förslag |
|---------|-------|---------|
| [uppgift] | Xd | genomför / pausa till [datum] / ta bort / bryt ner |
...alla gamla uppgifter (>7 dagar)

## Objektsbanken — saknade fält
- [Objekt]: saknar [fält] ← fyll i!
(Visas BARA om det finns ofullständiga objekt, annars hoppa över)

## Omvärld
- [2-3 korta punkter: konkurrenter, möjligheter, risker]

## Synlighet
- [SEO-tips, content-förslag, ads-sökord]
- [LinkedIn-inlägg]

## Blogg
- Senaste: [titel + datum]
- Förslag nästa: [ämne]

---
Genererat: [datum]
```

Spara till: `/Users/dpr/Desktop/Egna Appar/Projekt/Stayonsite/standups/YYYY-MM-DD.md`

## Steg 4: Publicera till Notion

```bash
node "/Users/dpr/Desktop/Egna Appar/Projekt/Stayonsite/scripts/push-to-notion.mjs" standups/YYYY-MM-DD.md
```

## Steg 5: Sammanfatta för Kajsa

Visa kort:
1. Ringlistan (top 3)
2. Heta affärer som kan stängas
3. K daily doos som behöver rensas (gamla uppgifter)
4. Objektsbanken — fält att fylla i (om några)
5. Viktigaste omvärldsnyhet
6. Bekräfta att rapporten finns i Notion
