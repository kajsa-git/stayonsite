# Meta Ads – anslutning och budget

Verifierat 2026-11-18. Meta-åtkomsten är konfigurerad och testad med ett läsanrop. Agenten styr annonserna sedan 2026-11-18 (se Integrationen nedan).

## Konton och åtkomst

| Del | Värde |
| --- | --- |
| Företagsportfölj | StayonSite, `734541046028153` |
| Annonskonto | StayOnSite, `2039871773310483` |
| App | Kajsas agent, `1507321954581287` |
| Systemanvändare | KajsasAgent, `61596319427108`, Admin |
| Valuta och tidszon | SEK, Europe/Stockholm |

Appen är opublicerad och har användningsfallet **Create & manage ads with Marketing API**. Systemanvändaren har fullständig åtkomst till appen och annonskontot.

`META_ADS_TOKEN` finns som **Secret / sensitive**, endast **Production**, i Vercel-projektet **kajsas-agent** under **kajsa-gits-projects**. Token saknar utgångsdatum och har `ads_management`; Meta inkluderar även `public_profile`. Tokenvärdet ska aldrig läggas i Git, dokumentation eller loggar. Vercel tar med variabeln i nya driftsättningar.

Läsanrop mot `act_2039871773310483` med **Marketing API v27.0** bekräftade aktivt konto, rätt valuta och tidszon samt kontots beloppsgräns. Behörigheterna kontrollerades separat. Ingen annons skapades eller startades under uppsättningen.

## Budget före automatisk annonsering

Kajsas gräns är **högst 1 000 kr per ort och vecka**, sammanlagt över alla kampanjer och annonsuppsättningar för orten.

Metas befintliga kontotak är **5 000 kr**, med återställning den första varje månad enligt faktureringsvyn. Det är ett separat tak för hela kontot och ersätter inte gränsen per ort.

## Integrationen

- `annonser_oversikt`: per ort kostnaden den här veckan, löpande dagsbudget och prognos; per kampanj kostnad och leads; Meta-kontots månadstak. Ändrar inget.
- `annonser_andra`: pausa går direkt. Starta och ny dagsbudget kräver Kajsas Godkänn i Telegram och nekas av koden om någon ort skulle gå över taket för veckan (veckans kostnad + löpande dagsbudget × dagar kvar). Sänkningar och pauser är alltid tillåtna.
- `annonser_tak`: ändrar kronor per ort och vecka (standard 1 000 kr, sparas i agentens Blob-butik). Kräver Godkänn.
- **Annonsvakten** (`agent/schedules/annonsvakt.ts`, varje timme, utan modell): varnar vid 90 % och pausar en orts aktiva annonsuppsättningar när orten når taket. En ny vecka frågar agenten Kajsa om det som pausades ska startas igen. Kan vakten inte läsa kostnaden säger den till en gång per dag.
- `GET /annonser/status` med `ANNONS_STATUS_SECRET` visar läget för felsökning och ändrar inget.

Hur orten räknas: orten är första staden (eller platsen/regionen) i annonsuppsättningens målgrupp. En kampanjbudget räknas fullt mot varje ort som kampanjen når, eftersom Meta kan lägga allt på en ort. Annonsuppsättningar utan stad i målgruppen kan inte startas eller höjas av agenten. Livstidsbudgetar ändras i Ads Manager. Metas kostnadssiffror kan släpa någon timme, så en ort kan hamna något över taket innan vakten pausar.

## Administration

- [Meta-appen](https://developers.facebook.com/apps/1507321954581287/dashboard/?business_id=734541046028153)
- [Systemanvändaren](https://business.facebook.com/latest/settings/system_users/?business_id=734541046028153&selected_user_id=61596319427108)
- [Vercels miljövariabler för kajsas-agent](https://vercel.com/kajsa-gits-projects/kajsas-agent/settings/environment-variables)
