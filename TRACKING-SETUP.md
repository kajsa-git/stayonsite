# Spårningsplan: Meta bostadsägare

## Nuvarande läge i koden

| Del | Status | Kommentar |
|---|---|---|
| Meta Pixel på `/lp/husagare` | Delvis klart | Laddas när `NEXT_PUBLIC_FB_PIXEL_ID` finns |
| `PageView` | Klart | Skickas när Pixel initieras |
| `Lead` | Klart | Skickas efter lyckat `lp-homeowner`-formulär |
| UTM + `fbclid` | Klart | Sparas lokalt och följer med formuläret till CRM |
| CRM-formtyp | Klart | `lp-homeowner` skiljer bostadsägare från företagsleads |
| Conversions API | Saknas | Pixel-only ger sämre signal och ingen serverdeduplicering |
| Gemensamt `event_id` | Saknas | Krävs för deduplicering mellan Pixel och CAPI |
| Meta consent-gating | Behöver åtgärdas | Meta Pixel laddas i dag oberoende av Google-consentflödet |
| Kvalificerat lead tillbaka till Meta | Saknas | Behövs senare för att optimera på bostadskvalitet |

## Måste vara klart före lansering

1. Sätt och verifiera `NEXT_PUBLIC_FB_PIXEL_ID` i Vercel.
2. Verifiera `stayonsite.se` i Meta Business Manager.
3. Testa `PageView` och `Lead` i Events Manager > Test Events.
4. Kontrollera att `Lead` bara skickas efter ett lyckat svar från kontakt-API:t.
5. Säkerställ att Pixel inte laddas innan relevant samtycke i EU/EEA.
6. Lägg en tydlig integritetslänk nära formuläret.
7. Verifiera att landningssidans URL, annonsdomän och Pixel-dataset hör till samma Business Portfolio.

## Rekommenderad CAPI-implementation

### Klient

- Skapa ett unikt `event_id` när formuläret skickas.
- Skicka Pixel-händelsen `Lead` med samma `event_id`.
- Skicka `event_id`, `fbclid`, `_fbp` och kontaktuppgifter till servern inom det redan godkända formuläranropet.

### Server

- Skicka `Lead` till Meta Conversions API efter att CRM-leadet har skapats.
- Använd samma `event_id` och `event_name` som klienten.
- Hasha normaliserat telefonnummer med SHA-256 innan det skickas.
- Skicka `fbc`, `fbp`, `client_user_agent`, `client_ip_address`, `event_source_url` och `action_source=website` när samtycke och dataskydd tillåter.
- Lägg token och Pixel-ID i servermiljövariabler; exponera aldrig access-token i klientkoden.

### Kvalitetsmål

- Dedupliceringsgrad: minst 90 %.
- Event Match Quality: minst 6, helst 8+.
- Pixel- och serverhändelser ska visas som deduplicerade, inte dubbla leads.

## CRM-loop för bättre AI

Meta lär sig först på alla formulärleads. När volymen räcker bör CRM skicka tillbaka senare status, exempelvis:

- relevant stad;
- bostaden uppfyller grundkrav;
- ägaren går att nå;
- boendet är tillgängligt;
- boendet blir godkänt/matchningsbart.

Börja inte optimera mot ett djupt kvalificeringsevent förrän det har tillräcklig och konsekvent volym. Använd det först för rapportering och jämför kvalitet per annons.

## Eventnamn och parametrar

| Händelse | Syfte | Primär för optimering |
|---|---|---:|
| `PageView` | Sidbesök | Nej |
| `Lead` | Lyckad registrering | Ja, fas 1 |
| CRM-kvalificering | Relevant bostad | Nej först; ja när volymen räcker |

Rekommenderade anpassade parametrar på `Lead`:

- `lead_type=homeowner`
- `form_type=lp-homeowner`
- `city`
- `property_type`
- `brf_permission_status` för bostadsrätt
- `separate_entrance` för uthyrningsdel
- `source=facebook-landing`

Skicka inte fritext, bilder eller fler personuppgifter än vad som behövs.

## Testprotokoll

1. Öppna landningssidan med test-UTM och `fbclid`-liknande parameter.
2. Neka cookies och verifiera att Meta Pixel inte laddas.
3. Godkänn cookies och verifiera en `PageView`.
4. Skicka formuläret med testtelefonnummer.
5. Verifiera exakt en `Lead` i Meta Test Events.
6. Verifiera `lp-homeowner`, stad, UTM och `fbclid` i CRM.
7. När CAPI är klart: verifiera Browser + Server och deduplicering via samma `event_id`.

## Integritet

StayOnSite annonserar i Sverige och behandlar telefonnummer och bostadsort. Samtycke, ändamål, lagring och eventuell delning med Meta ska beskrivas tydligt. Server-side tracking får inte användas för att kringgå ett nekat samtycke.
