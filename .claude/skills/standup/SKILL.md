---
name: standup
description: "Veckovis team-standup for StayOnSite. Läser Kajsas Notion-CRM, kör 4 agenter (inkl trigger scanner), ger Kajsa en enkel att-göra-lista."
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

## Steg 1: Starta 4 agenter (parallellt, run_in_background: true)

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

**Agent 4 — Trigger Scanner (blue-collar)**
```
subagent_type: general-purpose
prompt: |
  {{CRM_DATA}}

  Du är trigger-baserad lead-scanner för StayOnSite (B2B personalboende, blue-collar fokus).
  StayOnSite hyr bostäder av husägare och hyr ut till företag som behöver boende åt
  gästarbetare (bygg, skog, energi, infrastruktur, montörer).
  Fokus: MINDRE STÄDER (inte Stockholm/Göteborg). Nyckelstäder: Boden, Luleå, Oskarshamn,
  Gävle, Säffle, Ludvika, Karlstad, Sundsvall.

  Din uppgift: Hitta TRIGGERS — händelser som signalerar att ett företag snart behöver boende.
  Sök webben efter FÄRSKA signaler (senaste 2 veckorna).

  ## TRIGGER 1: TED — Vunna EU-upphandlingar i Sverige
  Sök ted.europa.eu: Tilldelade kontrakt (contract award notices) i Sverige inom bygg,
  infrastruktur, energi, industri. Fokus på STORA kontrakt (>10 MSEK) i mindre städer.
  Kedjor att följa: Stort projekt → Huvudentreprenör (NCC, Skanska, Peab, Implenia, Veidekke)
  → Deras underentreprenörer (UE) som ofta är utländska bolag → DE behöver boende.
  Sök även: opic.com för svenska offentliga upphandlingar.

  ## TRIGGER 2: Nya filialer från utländska bolag (Bolagsverket)
  Sök bolagsverket.se / foretagsinfo.bolagsverket.se: Nyregistrerade filialer av utländska
  företag i Sverige, speciellt från Polen, Baltikum, Tyskland, Rumänien.
  Branscher: Bygg (SNI 41-43), Skog, Energi, El-installation, VVS, Stål/Svets.
  Dessa bolag är NYA i Sverige och behöver boende DIREKT. De vet inte var de ska börja.
  Extra: Dessa kan också behöva hjälp med visum/arbetstillstånd — StayOnSite kan hänvisa
  till samarbetspartners (relocation/immigration-byråer) som en mervärde-tjänst.

  ## TRIGGER 3: Utstationering — Arbetsmiljöverkets register
  Sök av.se/utstationering ("Sök utstationering"): Företag som registrerat utstationerade
  arbetare i Sverige. Filtrera på bygg/industri. Volymen indikerar storlek.
  Komplettera med nyheter: "utstationerade arbetare" + stad.
  OBS: Registret håller på att förbättras 2026 — kvaliteten kan variera.

  ## TRIGGER 4: Massrekrytering — gästarbetarroller
  Sök Platsbanken (arbetsformedlingen.se) + LinkedIn Jobs:
  Roller: montör, svetsare, byggjobbare, maskinförare, drifttekniker, installationselektriker
  Filter: 5+ öppna roller hos samma företag i EN ort = de importerar arbetskraft = behöver boende.
  Bonus-sök: "accommodation manager" OR "boende coordinator" — om ett företag rekryterar
  denna roll så har de redan ett boendebehov de försöker lösa internt.

  ## TRIGGER 5: Stora byggprojekt → Entreprenörskedjan
  Sök nyheter: "byggstart" OR "infrastrukturprojekt" OR "nytt byggprojekt" + nyckelstäder.
  MEN gå djupare: Identifiera inte bara huvudentreprenören — hitta deras UE-bolag.
  Kontaktkedja: VD-sekreterare på större bolag (de hanterar ofta logistik/boende).
  På mindre UE-bolag: Kontakta inköp eller direkt VD — de fixar ofta boende själva.

  ## TRIGGER 6: Boendebrist-signaler
  Sök: Kommuner/företag som nämner "bostadsbrist", "boendeproblem", "svårt hitta boende
  för personal" i lokaltidningar, pressmeddelanden. Detta = akut behov.

  VIKTIGT:
  - Matcha VARJE trigger mot CRM-datan ovan. Flagga om ort/bransch redan finns i pipeline.
  - För utländska bolag: Notera ursprungsland (relocation-partner-möjlighet).
  - Föreslå KONTAKTVÄG per trigger: VD-sekreterare / Inköp / Projektledare / Accommodation manager.

  RAPPORT (max 500 ord, svenska):
  - HETA TRIGGERS (max 5, sorterade på relevans)
    Per trigger: Företag | Signal | Ort | Bransch | Ursprungsland | Kontaktväg | Datakälla
  - UTLÄNDSKA NYETABLERINGAR (filialer/utstationeringar — extra heta, behöver boende NU)
  - ENTREPRENÖRSKEDJOR (stort projekt → HE → UE-bolag att kontakta)
  - TRIGGER-MATCH MED CRM (triggers som matchar befintliga leads/orter)
  - BEVAKNINGSLISTA (3 pågående projekt att följa upp nästa vecka)
  - MANUELLA DATAKÄLLOR (Byggfakta-sök, TED-filter, Bolagsverket-sök denna vecka)
```

---

## Steg 2: Samla resultat

Vänta på alla 4 agenter. Läs deras output.

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

## Trigger Scanner — veckans signaler
| # | Signal | Företag | Ort | Bransch | Källa | Action |
|---|--------|---------|-----|---------|-------|--------|
| 1 | | | | | | |
| 2 | | | | | | |
...max 5 rader

### CRM-matchningar
- [Trigger som matchar befintlig lead/ort → naturlig anledning att ringa]

### Bevakningslista (följ upp nästa vecka)
- [Projekt/händelse att följa]

### Manuella datakällor att kolla
- [Byggfakta-sök, Platsbanken-filter, etc]

## Omvärld
- [2-3 korta punkter: konkurrenter, möjligheter, risker]

## Synlighet
- [SEO-tips, content-förslag, ads-sökord]
- [LinkedIn-inlägg]

## Blogg
- Senaste: [titel + datum]
- Förslag nästa: [ämne]

## Fredagsreflektion (30-45 min)
Kom ihåg att avsätta fredag eftermiddag för Signal & Beslutslogg:
- [ ] **Signallogg:** Vilka triggers dök upp? Vilka ledde till samtal?
- [ ] **Beslutslogg:** Vilka beslut fattades? Vilka antaganden testades?
- [ ] **Nästa vecka:** 3 prioriteringar + uppdatera CRM

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
3. Trigger Scanner — bästa signalen denna vecka + vem att ringa
4. K daily doos som behöver rensas (gamla uppgifter)
5. Objektsbanken — fält att fylla i (om några)
6. Viktigaste omvärldsnyhet
7. Bekräfta att rapporten finns i Notion
