# Meta-lansering: bostadsägare

**Status:** Förbereds som utkast – får inte publiceras utan Kajsas slutgodkännande  
**Destination:** `https://www.stayonsite.se/registrera-bostad`  
**Mål:** Slutförd bostadsregistrering (`Lead`)  
**Målgrupp:** Privatpersoner med villa, radhus, ägarlägenhet, separat uthyrningsdel eller bostadsrätt där uthyrning är tillåten  
**Slutkund:** Endast företag; bostaden används av deras personal

## Kampanjinställningar

- Kampanjmål: Leads
- Konverteringsplats: Webbplats
- Specialkategori: Bostäder
- Konverteringshändelse: Lead
- Budgetförslag: 300 kr per dag i 14 dagar
- Struktur: en kampanj, en annonsuppsättning, fyra annonser
- Placeringar: Advantage+
- Budstrategi: högsta volym/lägsta kostnad
- Status: utkast/avstängd fram till manuell publicering
- Första geografi: Sunne, Arvika och Charlottenberg enligt aktuell efterfrågan

## Gemensamt

**CTA-knapp:** Registrera dig  
**URL-parametrar:** `utm_source=meta&utm_medium=paid_social&utm_campaign=uthyrare_varmland_sep2026`

Registreringen är kostnadsfri och inte bindande. Det är ett stödargument, inte huvudbudskapet. Annonserna lovar inte viss hyra, beläggning, hyrestid eller garanterad uthyrning.

## Annons 1 – Villa

**Namn:** Uthyrare | Villa | Få betalt  
**Primärtext:** Har du en möblerad villa i Sunne, Arvika eller Charlottenberg? Företag söker boende åt sin personal. Du får betalt när bostaden hyrs ut. Registrera bostaden – kostnadsfritt och utan bindning.  
**Rubrik:** Företag söker villor  
**Beskrivning:** Registrera din bostad  
**Bild:** `ad-assets/meta/property-types/villa/feed-1080x1350.png`  
**Vertikal bild:** `ad-assets/meta/property-types/villa/vertical-1080x1920.png`  
**UTM content:** `villa`

## Annons 2 – Radhus

**Namn:** Uthyrare | Radhus | Få betalt  
**Primärtext:** Äger du ett möblerat radhus i Sunne, Arvika eller Charlottenberg? StayOnSite hyr bara ut till företag. Du får betalt när bostaden hyrs ut. Registreringen är kostnadsfri och inte bindande.  
**Rubrik:** Hyr ut ditt radhus till företag  
**Beskrivning:** Registrera din bostad  
**Bild:** `ad-assets/meta/property-types/radhus/feed-1080x1350.png`  
**Vertikal bild:** `ad-assets/meta/property-types/radhus/vertical-1080x1920.png`  
**UTM content:** `radhus`

## Annons 3 – Flera bostadstyper

**Namn:** Uthyrare | Bostadstyper | Företag  
**Primärtext:** Villa, radhus, ägarlägenhet eller separat uthyrningsdel? Vi söker boenden för företag och deras personal i Sunne, Arvika och Charlottenberg. Registrera bostaden så återkommer vi när den passar ett behov.  
**Rubrik:** Har du ett boende att hyra ut?  
**Beskrivning:** Endast företagsuthyrning  
**Bild:** `ad-assets/meta/company-only/feed-1080x1350.png`  
**Vertikal bild:** `ad-assets/meta/company-only/vertical-1080x1920.png`  
**UTM content:** `bostadstyper`

## Annons 4 – Aktiv lokal efterfrågan

**Namn:** Uthyrare | Lokal efterfrågan | Värmland  
**Primärtext:** Företag söker möblerade boenden i Sunne, Arvika och Charlottenberg. Har du en bostad med ledig kapacitet? Registrera den så gör vi en första bedömning.  
**Rubrik:** Företag söker boenden lokalt  
**Beskrivning:** Kostnadsfri registrering  
**Bild:** `ad-assets/meta/zero-fee/feed-1080x1350.png`  
**Vertikal bild:** `ad-assets/meta/zero-fee/vertical-1080x1920.png`  
**UTM content:** `lokal_efterfragan`

## Mätning

- PageView skickas efter cookiesamtycke.
- Slutförd `/registrera-bostad` skickar samma `Lead`-händelse från Pixel och Conversions API med gemensamt `event_id` för deduplicering.
- Primärt verksamhetsmått: kostnad per verifierad, användbar bostad – inte bara kostnad per Lead.

