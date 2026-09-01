# Meta-strategi: privata bostadsägare → företagsboende

**Version:** 2026-08-31
**Primärt mål:** Kvalificerade registreringar från privatpersoner som äger bostad
**Slutkund:** Endast företag och deras personal
**Primär kanal:** Meta (Facebook och Instagram)
**Planeringsbudget:** 10 000 kr/mån tills faktisk budget är beslutad

## Rekommendation i en mening

Behåll ett Meta-annonskonto men dela verksamheten i två tydliga kampanjfamiljer: **Bostadsägare** nu och **Företagskunder** senare. Dela inte upp dem i två annonskonton; det skulle fragmentera spårning, administration och lärdata.

## Kontoindelning

| Del | Status | Målgrupp | Konvertering | Landningssida |
|---|---|---|---|---|
| Bostadsägare / utbud | Aktiv nu | Privatpersoner som äger bostad | Godkänd formulärregistrering | `/lp/husagare` |
| Företagskunder / efterfrågan | Förbereds, ej aktiv | Företag som behöver personalboende | Projektförfrågan | Separat företags-LP |

Samma Pixel och framtida Conversions API kan användas, men kampanjer, annonser, mål och CRM-status ska hållas separata.

## Positionering

### Huvudlöfte

> Privat bostadsägare? Hyr ut ditt boende för företagspersonal – utan avgifter.

### Förtydligande

- Målgruppen är privatpersoner som äger bostad.
- Prioriterade objekt är ägarlägenheter, villor, radhus och separata uthyrningsdelar.
- Bostadsrätter är relevanta när andrahandsuthyrningen är godkänd av föreningen eller Hyresnämnden. Formulera aldrig annonsen som att ägaren kan hoppa över ett tillstånd som krävs.
- Bostaden ägs och registreras av en privatperson; den används som boende av företagspersonal.
- Bostadsägaren betalar ingen avgift till StayOnSite.
- Registreringen är första steget; matchning och villkor bekräftas innan avtal.

### CTA

**Registrera din bostad**

Använd en CTA i hela flödet. Undvik att blanda “mejla”, “kontakta”, “få offert” och “registrera” i samma annons.

## Meta-inställningar

- **Kampanjmål:** Leads.
- **Konverteringsplats:** Webbplats.
- **Primär händelse:** `Lead` efter att formuläret har skickats utan fel.
- **Special Ad Category:** Housing/Bostäder. De granskade svenska konkurrentannonserna klassificeras som bostadsannonser i Meta Ads Library.
- **Budstrategi:** Highest volume/Lowest cost under inlärningen.
- **Attribution:** 7 dagars klick och 1 dags visning.
- **Placeringar:** Advantage+ placements.
- **Målgrupp:** Bred inom tillåtna geografier; inga demografiska genvägar.
- **Språk:** Låt språket vara öppet om Meta kräver räckvidd; svensk copy sköter självselekteringen.
- **Advantage+ creative:** Tillåt säkra beskärnings- och ljusjusteringar efter förhandsgranskning. Stäng av automatiskt genererade påståenden och bakgrunder i första lanseringen.

Meta rekommenderar Advantage+ placements för att låta leveranssystemet fördela visningar över Facebook, Instagram, Messenger och Audience Network. Vertikala 9:16-resurser bör finnas för Reels/Stories, med text och ansikten i säker zon. Se [Metas officiella Reels-guide](https://www.facebook.com/business/ads/facebook-instagram-reels-ads).

## Självlärande upplägg

Metas AI behöver både bredd och en tydlig kvalitetsignal. Lösningen ska därför vara enkel:

1. Två geografiska annonsuppsättningar, inte sex separata stadsuppsättningar.
2. Tre kreativa hypoteser per annonsuppsättning.
3. Samma konverteringshändelse och samma landningssida.
4. Advantage+ placements och bred målgrupp inom geografin.
5. CAPI + Pixel med deduplicering så snart serverkopplingen är på plats.
6. Kvalificeringsstatus från CRM matas tillbaka när volymen räcker.

Det Meta ska lära sig är inte bara vem som klickar, utan vem som faktiskt registrerar ett relevant boende.

## Geografisk struktur

### Prioriterade projektstäder

Jönköping, Kiruna, Gävle och Linköping hålls ihop i en uppsättning. Det skyddar affärskritiska mindre marknader från att bli utkonkurrerade av billigare storstadsklick.

### Volymstäder

Göteborg och Stockholm hålls i en separat uppsättning. De ger större räckvidd och fungerar som benchmark, men ska inte få äta upp hela budgeten.

## Kreativa hypoteser

1. **Privatägare → företagspersonal:** Privatpersonen äger och registrerar bostaden; företagspersonal använder den som boende.
2. **0 % avgift:** Bostadsägaren betalar ingen avgift till StayOnSite.
3. **Vi söker i din stad:** Konkret efterfrågan i de städer där StayOnSite behöver fler boenden.

Varje hypotes får både 4:5 och 9:16. Kör dem samtidigt; låt resultatet avgöra vinnare.

## Landningssida

Rekommenderad destination är `https://www.stayonsite.se/lp/husagare` eftersom den redan:

- laddar Meta Pixel när miljövariabeln finns;
- skickar `Lead` efter godkänt formulär;
- sparar UTM-parametrar och `fbclid`;
- skapar ett `lp-homeowner`-lead i CRM.

Före lansering behöver första skärmen justeras så att den matchar annonsen. Nuvarande huvudbudskap “Tjäna 10 000–30 000 kr/mån” och “gratis intäktsbedömning” bör ersättas eller kompletteras med:

- “Privat bostadsägare? Hyr ut för företagspersonal – utan avgifter”;
- “Du äger bostaden. Boendet används av företagspersonal”;
- CTA “Registrera din bostad”.

Det minskar avhopp, gör erbjudandet mer trovärdigt och ger Meta renare konverteringsdata.

Formuläret bör dessutom fråga efter bostadstyp och, för bostadsrätt, om tillstånd för andrahandsuthyrning redan finns. Det gör att CRM kan skilja vanliga klickleads från matchningsbara bostäder och senare ge Meta en bättre kvalitetssignal.

## Beslutsregler efter lansering

- Gör inga större ändringar de första 7 dagarna om spårningen fungerar.
- Bedöm kreativer först när varje annons har fått meningsfull räckvidd och spenderat nära den framväxande mål-CPA:n.
- Pausa en annons som spenderat 3× mål-CPA utan lead.
- Skala vinnare högst cirka 20 % åt gången och vänta 3–5 dagar.
- Följ kvalificerade boenden och godkända matchningar i CRM, inte bara Metas rapporterade leads.
- Skapa retargeting först när målgruppen är tillräckligt stor; vid liten startbudget är prospektering viktigare.

## Vad som inte ska göras

- Skapa sex små annonsuppsättningar, en per stad.
- Använda privatuthyrnings-, student- eller hotellvinklar.
- Optimera för länkklick när `Lead` kan mätas.
- Lova specifik hyra, kontraktslängd eller “garanti” i annonser utan att villkoret gäller generellt.
- Låta automatiska textförslag hitta på nya ekonomiska påståenden.
