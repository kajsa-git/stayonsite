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

### Fredag: Reflektion

- Notera vad som funkade / inte funkade
- Uppdatera Notion-CRM med nya leads
- Förbereda nästa veckas focus

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
