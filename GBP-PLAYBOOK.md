# Google Business Profile — StayOnSite

Senast inventerad: 2026-09-06. Profil: [Stay On Site AB på Google Maps](https://www.google.com/maps?cid=18205863167897061312).

## Mål

GBP ska ge mätbar trafik och fler relevanta företagsförfrågningar i hemregionen, samtidigt som profilen stärker varumärkessökningar och förtroende i hela Sverige. Stadssidorna ska fortsatt bära den organiska efterfrågan utanför profilens närområde.

Google garanterar inte bättre lokal ranking för att man publicerar fler inlägg. Arbetet nedan fokuserar därför på korrekt och komplett profilinformation, autentiska bilder, recensioner, relevanta tjänster och UTM-mätta klick.

## Nuläge och beslut

| Område | Nuläge 2026-09-06 | Åtgärd |
|---|---|---|
| Betyg | 4,8/5, 16 recensioner | Svara på allt och bygg en jämn, policyenlig recensionskadens |
| Visningar | 1 463 i Maps-vyn | Baslinje; följ månadsvis |
| Kundinteraktioner | 287 i ägarvyn | Baslinje; följ webbplatsklick, samtal och meddelanden separat |
| Primär kategori | Lägenhetsuthyrning | Behåll tills ett kategoritest har tydligt stöd |
| Sekundära kategorier | Företagstjänster, Möblerade hyreslägenheter | Behåll |
| Beskrivning | Relevant, saklig och nära full längd | Behåll |
| Tjänster | Inga tillagda | Lägg till tjänstelistan nedan |
| Webbplats | Startsidan utan UTM | Ändra till köparsidan med UTM |
| Adress | Fogdevreten 14, Solna visas offentligt | Dölj adressen; platsen saknar permanent StayOnSite-skyltning och tar inte emot kunder |
| Serviceområde | Sverige | Hantera profilen som serviceområdesverksamhet; hela Sverige är inte en lokal rankinggenväg |
| Öppettider | Mån–fre 07:00–19:00 | Använd telefontillgänglighet/verksamhetstid, inte tider som antyder drop-in; stäm av mot webbplatsens schema 08:00–17:00 |
| Attribut | Nästan tomt | Lägg bara till verifierbara attribut; ignorera irrelevanta kategoriförslag |
| Inlägg | Inga tidigare inlägg | Starta två kvalitetssäkrade köer enligt automationen |

### Profiländringar att lägga in

**Webbplats**

`https://www.stayonsite.se/for-foretag?utm_source=google&utm_medium=organic&utm_campaign=gbp_profile`

**Anpassade tjänster**

1. **Företagsbostäder** — Möblerade hus och lägenheter för företag med personal på tillfälliga uppdrag. Urvalet anpassas efter projektort, period, antal personer och praktiska krav.
2. **Personalboende för arbetslag** — Samordnat boende för bygg-, industri-, energi-, infrastruktur- och montageprojekt. Vi går igenom bemanning, sovrum, fordon och avstånd till arbetsplatsen.
3. **Projektboende** — Boendeplanering för projekt med bestämda inflyttningsdatum, varierande bemanning eller längre hyresperioder.
4. **Montörboende** — Möblerade boenden för montörer och tekniska team på uppdrag i Sverige, även på mindre och medelstora projektorter.
5. **Möblerade hus för företag** — Hus och radhus med kök, gemensamma ytor och sovplatser för arbetslag. Exakt utrustning och vad som ingår avtalas per boende.
6. **Företagslägenheter** — Möblerade lägenheter för enskilda medarbetare eller mindre team under tidsbegränsade uppdrag.
7. **Boendesökning på mindre orter** — Sökning och samordning av projektboende där hotell- och lägenhetshotellsutbudet är begränsat.
8. **Hyra ut bostad till företag** — Genomgång och matchning för bostadsägare med möblerade hus eller lägenheter som passar längre företagsuthyrning.

Lägg inte in priser i tjänstefälten. Tillgänglighet, avtalsperiod och vad som ingår varierar per projekt.

### Adress och serviceområde — beslut 2026-09-06

Fogdevreten 14 saknar permanent StayOnSite-skyltning och kunder tas inte emot där. Adressen ska därför döljas och profilen hanteras som serviceområdesverksamhet. Gör ändringen samlat i GBP och kontrollera därefter om Google begär en ny verifiering. Lägg inte till en annan adress om den inte faktiskt uppfyller Googles krav för kundmottagning.

För en serviceområdesverksamhet tillåter Google högst 20 precisa områden och anger att det samlade området normalt inte bör vara mer än cirka två timmars bilresa från basen. Ändra därför inte `Sverige` till 20 spridda projektorter i landet; det strider mot hur Google avser att fältet ska användas och förbättrar inte nationell lokal ranking.

Källor: [Googles riktlinjer för verksamheter](https://support.google.com/business/answer/3038177), [serviceområden](https://support.google.com/business/answer/9157481).

## Bildbibliotek

Sex autentiska bilder från företagets egna Gävleboenden finns i `public/images/gbp/`. De är exporterade som 720 × 720 px JPG utan textöverlägg, filter, ansikten, registreringsskyltar eller synlig gatuadress. Filstorlekarna ligger mellan 60 och 176 KB.

Bildkällor och användningsregler finns i `content/gbp/image-manifest.json`. Bilderna ska beskrivas som **exempel på möblerat företagsboende i Gävle**. De får inte beskrivas som lediga utan en dagsaktuell kontroll.

Google rekommenderar JPG/PNG, 10 KB–5 MB, 720 × 720 px och verklighetstrogna, välbelysta bilder utan kraftig redigering eller överdriven AI. AI-genererat innehåll omfattas av samma Maps-policy, men profilbilder ska fortfarande spegla verkligheten. Därför används egna bostadsbilder i stället för syntetiska interiörer.

Källor: [Googles bildkrav](https://support.google.com/business/answer/6123536), [Maps-policy för mänskligt och AI-genererat innehåll](https://support.google.com/contributionpolicy/answer/7400113).

## Automationen

### Innehållsflöde

- `content/gbp/posts.json` är publiceringskön.
- Måndagar publiceras nästa förberedda lokal/evergreen-post från `campaign`-kön.
- Onsdagens artikelgenerator lägger automatiskt en kort GBP-version i `article`-kön.
- Fredagar publiceras nästa artikelpost, efter att artikeln hunnit deployas.
- Varje länk får `utm_source=google`, `utm_medium=organic`, `utm_campaign=gbp_posts` och ett unikt `utm_content`.
- Publiceraren läser befintliga Google-inlägg och använder `utm_content` som idempotensnyckel, så samma post inte publiceras två gånger.
- Telefonnummer blockeras i posttext eftersom Google varnar för att sådana inlägg kan avvisas.
- Bilder hämtas från en publik URL på `www.stayonsite.se`, vilket GBP:s Local Posts-API kräver.
- Före varje skrivning gör publiceraren en publik kontroll av både landningssidan och bilden. En 404, en ännu inte färdig Vercel-deploy eller fel innehållstyp stoppar körningen innan något skickas till Google.

Workflow: `.github/workflows/gbp-posts.yml`
Publicerare: `scripts/gbp/publish.mjs`

### Säkerhetsmodell

Schemalagd publicering är avstängd tills repo-variabeln `GBP_PUBLISH_ENABLED=true`. Innan dess går det att validera och förhandsgranska utan nätverksskrivning:

```bash
pnpm gbp:validate
pnpm gbp:dry-run --post-id campaign-gavle-personalboende
```

### Google API-aktivering

GBP API är inte öppet utan godkännande. Google kräver ett legitimt företag, en aktiv verifierad profil som normalt varit aktiv minst 60 dagar, en webbplats och ett Google Cloud-projekt.

**Aktuell status 2026-09-06**

- Cloud-projekt: `stayonsite-ads-cli` (`439444025288`).
- My Business Business Information API: aktiverat.
- My Business Account Management API: aktiverat.
- OAuth-scope `https://www.googleapis.com/auth/business.manage`: sparat.
- Separat desktop-klient `StayOnSite GBP Publisher`: skapad. Klientfilen ligger utanför repot med filrättighet `600` i `~/.config/stayonsite/gbp-oauth-client.json`.
- Begränsad refresh-token för endast `business.manage`: skapad i `~/.config/stayonsite/gbp-oauth-token.json` med filrättighet `600`.
- Basic API Access ansökt via profillägaren `kajsa@stayonsite.se`. Google-ärende: `6-9607000041098`; angiven handläggningstid 7–10 arbetsdagar.
- Ett riktigt `pnpm gbp:discover` når Google men svarar med `429 Quota exceeded`, vilket bekräftar nollkvot i väntan på godkännande. Google My Business API/Local Posts är ännu inte synligt för projektet och kan aktiveras först efter godkännande.
- Den publika Solna-adressen är borttagen; profilen visar `Ingen adress, bara leveranser och tjänster i hemmet` och behåller serviceområdet `Sverige`.
- Den spårbara webbplatslänken till `/for-foretag` är inskickad och väntar på Googles granskning.
- Åtta anpassade tjänster med fullständiga beskrivningar är inskickade och väntar på publicering.
- OAuth-klient-ID, klienthemlighet och refresh token är lagrade som GitHub Actions-secrets. Konto och plats hittas automatiskt efter API-godkännandet.
- En riktig GitHub Actions dry-run för `campaign-gavle-personalboende` lyckades 2026-09-06 och verifierade kö, bild samt landningssida från GitHub-miljön.
- Uppladdning av de sex Gävlebilderna och första manuella bildinlägget återstår tills Chrome-tillägget har fått `Allow access to file URLs`.

1. Skapa eller välj ett separat Google Cloud-projekt för StayOnSite GBP.
2. Ansök om **Basic API Access** för Business Profile APIs med ett Google-konto som är ägare/ansvarig för profilen.
3. Efter godkännande, aktivera minst Google My Business API, My Business Account Management API och My Business Business Information API.
4. Skapa en separat OAuth-klient och ge scope `https://www.googleapis.com/auth/business.manage`.
5. Skapa en refresh token för `kajsa@stayonsite.se` med `pnpm gbp:authorize`. Klient- och tokenfilerna sparas utanför repot med filrättighet `600`. Återanvänd inte webbplatsens vanliga Auth.js-klient.
6. Sätt lokalt: `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`, `GBP_REFRESH_TOKEN`.
7. Kör `pnpm gbp:discover` som kontroll. Vid publicering hittar skriptet automatiskt den unika profilen med namnet `Stay On Site AB`; `GBP_ACCOUNT_ID` och `GBP_LOCATION_ID` behövs bara om Google-kontot senare får flera profiler med exakt samma namn.
8. Lägg OAuth-klient-ID, OAuth-klienthemlighet och refresh token som GitHub Actions-secrets.
9. Kör workflow manuellt med `dry_run=true` och kontrollera payloaden. Dry-run verifierar även att landningssidan och bilden är publikt driftsatta med rätt innehållstyp.
10. Kör ett valt inlägg manuellt med `dry_run=false`. Kontrollera att Google godkänner text, bild och CTA.
11. Sätt repo-variabeln `GBP_PUBLISH_ENABLED=true` för schemalagd publicering.

Källor: [förutsättningar och API-ansökan](https://developers.google.com/my-business/content/prereqs), [grundkonfiguration och OAuth](https://developers.google.com/my-business/content/basic-setup), [Local Posts API](https://developers.google.com/my-business/content/posts-data).

## Redaktionella regler

- Ett inlägg ska svara på en konkret fråga eller leda till en relevant landningssida.
- Använd naturligt ett huvudbegrepp, till exempel `personalboende Gävle`; upprepa inte sökord.
- Skriv aldrig att ett boende är ledigt utan dagsaktuell kontroll.
- Publicera inte exakta bostadsadresser, hyresgäster, registreringsskyltar eller identifierbara personer utan samtycke.
- Använd inte telefonnummer i posttexten. Profilens telefonfält och CTA hanterar kontakten.
- Lovar inte svarstid, pris, garanti eller inkluderade tjänster om uppgiften inte är aktuell och verifierad.
- Använd endast länkar till relevanta landningssidor, aldrig startsidan av bekvämlighet.
- Om ett inlägg stoppas eller markeras av Google: pausa automationen, rätta orsaken och publicera inte om oförändrat.

## Mätning, 90 dagar

Följ följande per månad, med 2026-09-06 som baslinje:

- GBP-visningar och söktermer.
- Webbplatsklick från `utm_campaign=gbp_profile`.
- Inläggsklick per `utm_content`.
- Samtal, WhatsApp/SMS och formulärförfrågningar som kan kopplas till GBP.
- Nya recensioner, svarstid och betyg.
- Avvisade inlägg eller bilder.

Efter 8–12 veckor: behåll ämnen och landningssidor som ger relevanta klick eller leads. Minska eller byt ut inläggstyper som får visningar men ingen handling.
