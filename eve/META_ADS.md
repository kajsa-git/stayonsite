# Meta Ads – anslutning och budget

Verifierat 2026-11-18. Meta-åtkomsten är konfigurerad och testad med ett läsanrop. Agenten har ännu ingen Meta Ads-integration som använder nyckeln.

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

Kontouppsättningen och denna dokumentation inför ingen teknisk veckospärr. Innan agenten får starta eller ändra annonser behöver Meta Ads-integrationen och en gemensam budgetkontroll per ort implementeras och verifieras.

## Administration

- [Meta-appen](https://developers.facebook.com/apps/1507321954581287/dashboard/?business_id=734541046028153)
- [Systemanvändaren](https://business.facebook.com/latest/settings/system_users/?business_id=734541046028153&selected_user_id=61596319427108)
- [Vercels miljövariabler för kajsas-agent](https://vercel.com/kajsa-gits-projects/kajsas-agent/settings/environment-variables)
