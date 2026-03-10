# StayOnSite - Teamstruktur & Operativ Plan

## Kajsas Team

### Mänskliga teamet

| Roll | Person | Uppgifter | Tid/vecka |
|------|--------|-----------|-----------|
| **VD & Grundare** | Kajsa | Kalla samtal (Byggfakta), stänga affärer, husägar-relationer, strategi | Heltid |
| **Tech** | Fästmannen | Deploy, sajt-uppdateringar, tekniska fixes | 2-4h/vecka (fritid) |

### AI-teamet (startas automatiskt via `/standup`)

| Roll | Agent | Ansvar | Frekvens |
|------|-------|--------|----------|
| **Facebook Scout** | search-specialist | Hitta bostäder via FB-grupper, bevaka byggprojekt, FB Ads-strategi | Veckovis |
| **SEO/GEO Specialist** | general-purpose | SEO-audit, content-förslag, AI-sökmotoroptimering | Veckovis |
| **Kundjakten** | search-specialist | Hitta företagskunder, Google Ads, B2B-leads | Veckovis |
| **Marknadsstrateg** | content-marketer | Konkurrentanalys, sociala medier, content-kalender | Veckovis |
| **Trigger Scanner** | general-purpose | Trigger-baserad leadgen: byggprojekt, rekryteringar, utstationeringar, upphandlingar | Veckovis |
| **Sekreterare** | (kompileras automatiskt) | Veckoprotokoll, TOP 5 åtgärder, mötesanteckningar | Veckovis |

---

## Kundinsikter & ICP (uppdaterat 2026-02-08)

### Primär ICP: "Mats-profilen"
Baserat på kundsamtal med Mats Johansson, BS Logistics (skogsbolag, Karlstad).

- **Beslutsfattare:** Projektledare/logistikansvarig som "hamnar med boendeproblemet"
- **Branscher (prio-ordning):** Skog & Maskin, Bygg, Energi, Infrastruktur, Montörer/Stål/Installation
- **Smärtpunkter:** Vill INTE vara mellanhand, spridda kvitton, kommunikationskedjan, utländska arbetslag
- **Köpbeteende:** Väljer på tillit, inte prisjämförelse. Tackar ja till allt som fungerar. Rekommenderar vidare.
- **Nyckelfras:** "Jag vill göra ett samtal och veta att det är löst."

### Ramavtalsmodellen (NYTT erbjudande)
- **Koncept:** Ett avtal, avrop efter behov ("4 pers i Gävle" → StayOnSite fixar)
- **Innehåll:** Prislista, förhandlade villkor, SLA, avropsprocedur
- **Projektfakturering:** En faktura/månad, uppdelad per projekt (10 dagars betalning)
- **Direktkontakt:** StayOnSite pratar direkt med maskinlag/montörer (inte genom kunden)
- **Flerspråkig service:** WhatsApp med AI-översättning på alla språk
- **Minsta avtalstid:** 3 månader per boende
- **Marginal:** ~12 000-16 000 kr/boende/mån, minst 30 000 kr vinst per kontrakt (3 mån)

### Aktiva leads (2026-02-08)
| Lead | Källa | Status | Prio |
|------|-------|--------|------|
| BS Logistics (Mats) | Befintlig kund | Ramavtalsmöte om 2 veckor | HÖG |
| BS Logistics underleverantörer | Mats intro | Väntar på intro | HÖG |
| VP Welding | Befintlig relation | Behöver uppföljning | HÖG |
| "Mellansverige" | Mats nämnde | Behöver undersökas | MEDEL |

### Konkurrenter (utökat 2026-02-08)
| Konkurrent | Styrka | StayOnSites fördel |
|------------|--------|---------------------|
| Samtrygg | 15% avgift, "trygghet"-varumärke | 0% avgift, personlig relation |
| Qasa | 4.95% avgift, tech-fokus | Helhetslösning, varmhyra |
| Workers Hotel | Polsk/rumänsktalande personal | AI-kompensation, bredare språk |
| Avisita | Fungerar som resebyrå | Hands-on, lokal närvaro |
| Forenom | Störst (965 sökord), lägenhetshotell | Personlig service, ramavtal |

### Webbplatsändringar (2026-02-08)
- **/for-foretag:** Bredare Hero ("alla era projekt"), 5 branschkort (+Skog & Maskin), vad-ingår-sektion, kundcase, ramavtals-sektion, FAQ 8 frågor, faktura 10 dagar
- **Startsidan:** TwoTrack (företag/husägare), References uppflyttad, FAQ kapade till 5
- **SEO:** "ramavtal personalboende" har 0 konkurrens — first mover advantage

### Docs i Notion (under "Insikter, Mats")
- Kundinsikter: BS Logistics / Mats Johansson
- Kundpitch: Ramavtal — Boendelösning för företag
- Strategisk analys: Ramavtalsmodellen
- ICP-analys: Ideal Customer Profile
- Transkription: Samtal David & Kajsa

---

## Trigger-baserad Leadgen (bootstrappad Growth Engine)

Inspirerat av Forenoms Growth Engine-program (550k+ SEK), men anpassat för StayOnSites blue-collar nisch i mindre städer. Forenom fokuserar på white-collar/storstad — vi äger blue-collar/glesbygd.

### Våra 6 triggers (blue-collar / gästarbetare-fokus)

| # | Trigger | Signal | Datakälla | Kostnad | Frekvens |
|---|---------|--------|-----------|---------|----------|
| T1 | **TED — EU-upphandlingar** | Tilldelade kontrakt i Sverige (bygg/infra/energi >10 MSEK) | [ted.europa.eu](https://ted.europa.eu) + [opic.com](https://opic.com) | 0 kr | Veckovis |
| T2 | **Nya utländska filialer** | Utländska bolag (PL/DE/LT/RO) registrerar filial i SE | [Bolagsverket](https://foretagsinfo.bolagsverket.se) (SNI 41-43 bygg, skog, energi) | 0 kr | Veckovis |
| T3 | **Utstationeringsregistret** | Utländska företag registrerar arbetare i Sverige | [Arbetsmiljöverket](https://av.se/utstationering) — sök utstationering | 0 kr | Veckovis |
| T4 | **Massrekrytering gästarbetarroller** | 5+ roller (montör/svetsare/maskinförare) hos ett bolag i en ort | Platsbanken + LinkedIn Jobs | 0 kr | Veckovis |
| T5 | **Stora byggprojekt → UE-kedjan** | Byggstart/infrastrukturprojekt → HE → underentreprenörer | Byggfakta (befintlig), nyheter, Trafikverket | 0 kr | Veckovis |
| T6 | **Boendebrist-signaler** | Kommuner/företag nämner bostadsproblem | Lokaltidningar, pressmeddelanden | 0 kr | Veckovis |

### Kontaktkedja — vem ringer Kajsa?

```
Stort EU-projekt (TED)
  → Huvudentreprenör (NCC/Skanska/Peab/Implenia/Veidekke)
    → VD-sekreterare eller "Accommodation Manager" (stora bolag har denna roll)
      → De vet vilka UE-bolag som jobbar på projektet
        → UE-bolagens inköpsavdelning eller VD (mindre bolag)
          → DESSA behöver boende mest akut
```

| Bolagsstorlek | Kontaktperson | Approach |
|--------------|---------------|----------|
| **Stort (500+)** | VD-sekreterare → Accommodation Manager → Inköp | "Vi samarbetar med flera av era UE i [stad]" |
| **Mellanstort (50-500)** | Inköpsavdelning / Projektledare | "Jag såg att ni vann [upphandling] i [stad]" |
| **Litet UE (<50)** | VD direkt | "Ni har registrerat filial/utstationering i [stad] — behöver ni boende?" |
| **Utländskt nyetablerat** | VD / Kontaktperson i filialregistret | "Välkomna till Sverige — vi ordnar boende + kan hänvisa till [relocation-partner]" |

### Mervärde: Relocation-partnerskap

Utländska bolag som etablerar filial i Sverige behöver ofta mer än bara boende:
- **Visum/arbetstillstånd** — samarbeta med relocation-byrå
- **Skattregistrering** — F-skatt, moms
- **Bankuppkoppling** — företagskonto i Sverige
- **Språk** — StayOnSite har redan PL/EN-sidor

**Taktik:** Hitta 1-2 relocation-/immigrationsbyråer och byt leads. De skickar boendebehov till oss, vi skickar nystartade som behöver visum till dem. Win-win utan kostnad.

### Trigger → Action-flöde

```
Signal upptäcks (Agent 4 i /standup)
  ↓
Matcha mot CRM: Finns företaget/orten redan? → Varmt samtal
  ↓
Ny lead? → Lägg i Kajsas ringlista med kontext
  ↓
Kajsa ringer: "Jag såg att ni precis vann [projekt] i [stad].
  Vi hjälper med boende åt era team — vill ni ha ett förslag?"
  ↓
Om intresse → Ramavtalspitch
```

### Forenoms approach vs StayOnSites bootstrap

| Aspekt | Forenom (Growth Engine) | StayOnSite (Bootstrap) |
|--------|------------------------|----------------------|
| **Segment** | White-collar, internationella bolag | Blue-collar: bygg, skog, energi, montörer |
| **Geografi** | Storstäder (Stockholm, Göteborg) | Mindre städer (Boden, Oskarshamn, Gävle, Säffle) |
| **Kostnad** | 550 000+ SEK (6 mån) | 0 kr (AI-agenter + offentlig data) |
| **Datakällor** | Proprietär databas, årsredovisningar | Byggfakta, Platsbanken, Arbetsmiljöverket, OPIC |
| **Triggers** | Bolagsregistreringar, ledningsbyten, resekostnader | Byggprojekt, rekryteringar, utstationering, upphandlingar |
| **Lead-kvalificering** | Manuell + proprietärt verktyg | CRM-matchning + Kajsas branschkunskap |
| **Frekvens** | Bi-weekly meetings | Veckovis automatiskt via `/standup` |

### Datakällor — manuell checklista för Kajsa (10-15 min/vecka)

| # | Källa | URL | Vad du söker | Tid |
|---|-------|-----|-------------|-----|
| 1 | **TED** (EU-upphandlingar) | ted.europa.eu → Sök → Land: Sverige, Typ: Bygg/Infra, Status: Tilldelad | Vem vann stora kontrakt? → Kontakta deras UE | 3 min |
| 2 | **Bolagsverket** | foretagsinfo.bolagsverket.se | Nya filialer av utländska bolag (PL/DE/LT/RO) i bygg/industri | 2 min |
| 3 | **Arbetsmiljöverket** | av.se → Sök utstationering | Utländska företag med utstationerade arbetare i Sverige | 2 min |
| 4 | **Platsbanken** | arbetsformedlingen.se/platsbanken | "montör" + "svetsare" + "maskinförare" i nyckelstäder, 5+ roller = signal | 3 min |
| 5 | **OPIC** | opic.com | Upphandlingar: "boende" OR "personalboende" OR "tillfälligt boende" | 2 min |
| 6 | **Byggfakta** | (befintlig licens) | Nya projekt i nyckelstäder — kolla entreprenör + UE-lista | 3 min |

**Google Alerts att sätta upp (engångsjobb):**
- "byggprojekt" + varje nyckelstad (Boden, Luleå, Oskarshamn, etc)
- "utstationerade arbetare Sverige"
- "bostadsbrist personal" + region
- "nytt datacenter Sverige" OR "batterifabrik" OR "vindkraftspark"

### Mål: Trigger-genererade leads

| Tidshorisont | Mål | Mätning |
|-------------|-----|---------|
| Vecka 1-4 | 3-5 triggers/vecka → 1-2 samtal | Antal triggers i veckorapport |
| Månad 2-3 | 5-10 triggers/vecka → 3-5 samtal | Träffprocent trigger → samtal |
| Månad 4-6 | 10+ triggers/vecka → Pipeline | Andel affärer från triggers vs kalla samtal |

---

## Veckorutin

### Måndag: Standup (15 min)

```
/standup
```

Kajsa kör kommandot och får:
1. Veckorapport från alla 4 AI-agenter
2. TOP 5 prioriterade åtgärder
3. Ringlista med potentiella kunder
4. Tech-backlog för fästmannen
5. Protokoll sparat i `standups/YYYY-MM-DD.md`

### Tisdag-Torsdag: Exekvering

| Tid | Aktivitet | Kanal |
|-----|-----------|-------|
| 08:00-08:30 | Kolla Facebook-grupper (tips från Scout) | Facebook |
| 08:30-11:00 | Kalla samtal via Byggfakta | Telefon |
| 11:00-11:30 | Svara på inkommande leads (FormSubmit → mail) | Email |
| 13:00-14:00 | Uppföljning pågående konversationer | Telefon/Email |
| 14:00-14:30 | 1 social media-inlägg (copy från Marknadsstrateg) | LinkedIn/FB |

### Fredag: Reflektion & Signal/Beslutslogg (30-45 min)

| Tid | Aktivitet |
|-----|-----------|
| 14:00-14:15 | **Signallogg:** Vilka triggers/signaler dök upp denna vecka? Vilka ledde till samtal? Vilka missade vi? |
| 14:15-14:30 | **Beslutslogg:** Vilka beslut fattades? Vad var resonemanget? Vilka antaganden testades? |
| 14:30-14:45 | **Nästa vecka:** Uppdatera Notion-CRM med nya leads. Sätt 3 prioriteringar för nästa vecka. |

**Signal & Beslutslogg** (fyll i i Notion eller i standups/):
```
## Signallogg v[XX]
| Signal | Källa | Agerade vi? | Resultat |
|--------|-------|-------------|----------|
| [beskrivning] | Trigger Scanner / Byggfakta / Tips | Ja/Nej | Samtal / Lead / Inget |

## Beslutslogg v[XX]
| Beslut | Varför | Antagande | Uppföljning |
|--------|--------|-----------|-------------|
| [vad vi bestämde] | [resonemang] | [vad vi tror] | [hur vi verifierar] |
```

---

## Kanaler & Verktyg

### Hitta bostäder (utbud)

| Kanal | Strategi | Kostnad | Prioritet |
|-------|----------|---------|-----------|
| **Facebook-grupper** | Bevaka "Lägenheter uthyres i [stad]" via Devi AI | ~400 kr/mån | HÖG |
| **Facebook Ads** | Rikta mot husägare 35-65, "0% avgift"-budskap | 500-1000 kr/dag | MEDEL |
| **Direktkontakt** | Ringa husägare som annonserar på Blocket/FB | Gratis | HÖG |
| **Sajten** | SEO-optimera /for-husagare för "hyra ut lägenhet" | Gratis | HÖG |

### Hitta kunder (efterfrågan)

| Kanal | Strategi | Kostnad | Prioritet |
|-------|----------|---------|-----------|
| **Byggfakta** | Kalla samtal till byggbolag med pågående projekt | Befintlig licens | HÖG |
| **Google Ads** | "Företagsboende", "personalboende", "montörboende" | 200-500 kr/dag | MEDEL |
| **LinkedIn** | Kontakta projektledare/HR på byggbolag | Gratis | MEDEL |
| **Trafikverket** | Bevaka infrastrukturprojekt → proaktiv kontakt | Gratis | HÖG |
| **Sajten** | SEO + InquiryForm → leads direkt till kajsa@stayonsite.se | Gratis | HÖG |

---

## Projekt & Branscher att bevaka (2026)

### Bygg & Infrastruktur
| Projekt | Stad | Status | Boendeefterfrågan |
|---------|------|--------|-------------------|
| Västlänken | Göteborg | Pågår | Hög (1000-2000 arbetare) |
| Nya Slussen | Stockholm | Pågår | Medel-Hög (500-1000) |
| Ostlänken | Sthlm→Linköping | Uppstart | Hög (2000-3000) |
| Stockholm Wood City | Stockholm | Pågår | Medel (1000+) |

### Skog & Maskin (NY PRIORITET)
- Skogsbolag med mobila maskinlag — BS Logistics som modell
- Avverkningssäsong, spridda projekt, behöver boende nära skogen
- Kontakter: Mats Johansson (BS Logistics) kan ge intros

### Energi & Kärnkraft
- +18% investeringsökning 2024-2026 (Byggföretagen)
- Vindkraftsparker, kärnkraft, datacenter (Norrbotten/Västerbotten hetast)

**Bevakningskällor:**
- Trafikverket projektsida
- Kommunala bygglovsregister
- LinkedIn-jobbannonser hos NCC, Skanska, Peab, Implenia, Veidekke
- Skogsindustrierna / Skogsägarna Norrland (ny kanal för skog)

---

## Automationsplan (steg-för-steg)

### Fas 1 - Nu (vecka 1-2)
- [x] `/standup` skill installerad
- [ ] Skapa Devi AI-konto (~400 kr/mån) för FB-gruppbevakning
- [ ] Google Alerts: "byggprojekt" + städer
- [ ] Verifiera FormSubmit-formulär (kajsa@stayonsite.se)

### Fas 2 - Månad 1
- [ ] Facebook Ads test-kampanj (200 kr/dag, 2 veckor)
- [ ] robots.txt skapad
- [ ] SEO: Meta descriptions på stadssidor
- [ ] Notion: Strukturerad lead-pipeline

### Fas 3 - Månad 2-3
- [ ] Google Ads test-kampanj (företagsboende-sökord)
- [ ] Blogg/resurs-sektion på sajten (SEO-auktoritet)
- [ ] Jämförelsesida: StayOnSite vs Samtrygg vs Qasa
- [ ] n8n-automation: FormSubmit → Notion automatiskt

### Fas 4 - Månad 4-6
- [ ] Rental management-system utvärderat
- [ ] Husägar-kalkylator på sajten
- [ ] Video-testimonials från nöjda husägare
- [ ] Utöka till fler städer baserat på efterfrågan

---

## Nyckeltal att följa

| KPI | Mål (Mån 1) | Mål (Mån 3) | Mål (Mån 6) |
|-----|-------------|-------------|-------------|
| Nya bostäder i portfoljen | 2-3 | 8-12 | 20-30 |
| Inkommande leads/vecka | 5 | 15 | 30 |
| Kalla samtal/dag | 10-15 | 15-20 | 20+ |
| Sajt-besökare/mån | 500 | 1500 | 3000 |
| Google-ranking "företagsboende" | Top 20 | Top 10 | Top 5 |

---

## Budget

| Post | Kostnad/mån | Prioritet | Start |
|------|------------|-----------|-------|
| Devi AI (FB-bevakning) | 400 kr | Hög | Vecka 1 |
| Facebook Ads (husägare) | 6 000-15 000 kr | Medel | Vecka 3 |
| Google Ads (företagskunder) | 4 000-10 000 kr | Medel | Månad 2 |
| Notion (CRM) | Gratis/250 kr | Redan igång | - |
| Vercel (hosting) | Gratis | Redan igång | - |
| **Total uppskattat** | **10 000-25 000 kr** | | |

---

## Kontaktuppgifter

- **Sajt:** stayonsite.se
- **Email:** kajsa@stayonsite.se
- **Tel:** +46 76-249 84 86
- **Facebook:** facebook.com/stayonsite
- **LinkedIn:** linkedin.com/company/stayonsite
