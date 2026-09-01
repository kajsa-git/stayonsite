# Implementeringsplan

## Fas 1: grund, 1–3 arbetsdagar

- Bekräfta startbudget.
- Skapa eller verifiera Meta Business Portfolio, annonskonto, betalmetod och tvåfaktorsautentisering.
- Koppla StayOnSites Facebook-sida och Instagramkonto.
- Verifiera domänen `stayonsite.se`.
- Kontrollera Pixel-ID och `Lead`-event.
- Anpassa `/lp/husagare` till exakt annonslöfte och CTA.
- Lägg till bostadstyp och villkorad fråga om godkänd andrahandsuthyrning för bostadsrätt.
- Rätta Meta consent-gating och lägg till integritetslänk.

## Fas 2: kampanjbygge, 1 arbetsdag

- Skapa `META_LEADS_OWNER_SE_2026Q3`.
- Markera Special Ad Category: Housing.
- Skapa de två geografiska annonsuppsättningarna.
- Lägg in 60/40-budget.
- Aktivera Advantage+ placements.
- Ladda upp tre koncept i 4:5 och 9:16.
- Lägg in UTM-mallen och rätt `Lead`-event.

## Fas 3: QA före publicering

- Kontrollera text mot bild och landningssida.
- Förhandsgranska Feed, Stories och Reels.
- Säkerställ att ingen automatisk variation lägger till ekonomiska garantier.
- Skicka ett testlead och verifiera CRM.
- Kontrollera mobil laddningstid och formulärfel.
- Publicera först när Events Manager visar rätt händelser.

## Fas 4: första 14 dagarna

- Kontrollera leverans, avslag och spårning dagligen.
- Tagga leads som relevanta/irrelevanta i CRM.
- Undvik frekventa ändringar under inlärningen.
- Dokumentera CPL, kvalificeringsgrad och stad per koncept.

## Fas 5: dag 15–30

- Pausa tydliga förlorare enligt 3×-regeln.
- Skapa ny variant av vinnande vinkel, inte bara ny färg.
- Behåll budgetskyddet för prioriterade projektstäder.
- Bedöm om ett High Intent Instant Form-test är motiverat.

## Fas 6: månad 2–3

- Implementera eller färdigställ CAPI med `event_id`-deduplicering.
- Skicka CRM-kvalitetsstatus tillbaka till Meta för analys.
- Lägg 10 % på nya kreativa format.
- Skapa retargeting först när målgruppen har tillräcklig storlek.
- Förbered företagskundskampanjen som en separat kampanjfamilj.

## Ägare och kontrollpunkter

| Område | Kontrollpunkt |
|---|---|
| Affär | Endast företagsboende kommuniceras |
| Copy | Inga obestyrkta hyres- eller garantilöften |
| Kreativ | Privatägd svensk bostad, inte hotell eller studentboende |
| Tracking | Exakt en `Lead` per formulär |
| CRM | Stad och kvalificering registreras |
| Budget | Mindre projektstäder skyddas från storstadsdominans |
