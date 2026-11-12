# Automatisk granskning av objekt

Beskrivning, skick och vad som ingår språkgranskas till korta, faktiska kundtexter på svenska, engelska och polska. Alla bilder kontrolleras enkelt: de ska avse ett boende och vara lämpliga att visa. Granskningen bevisar inte vem som äger bostaden eller att bilderna visar rätt adress.

Priser, intern ekonomi, kontakter, exakt adress och olämpligt språk får inte finnas i kundtexten. Faktiska motsägelser och bilder som inte går att godkänna ger **Kajsa behöver granska** på objektkortet. Saknade valfria uppgifter utelämnas. Ingen information hittas på.

Godkänd kontroll gäller endast den granskade versionen av uppgifter och hela bildsamlingen. Ändringar stoppar externa vyer tills den nya versionen har granskats. Originaltexten sparas internt. Granskningsrapporter och originaltext skickas inte till kundvyer.

Publicering kan ske automatiskt efter uthyrarens medgivande och godkänd kontroll när automatisk publicering är aktiverad. Tidigare publicerade objekt fortsätter hanteras enligt befintliga regler utan att ett nytt ja hittas på. Manuellt avpublicerade objekt förblir pausade. Bokade och uthyrda objekt behöver inte avpubliceras om uthyraren accepterar visningen och texten är korrekt. Publicering ändrar inte tillgänglighetsstatus.

Prospektlänkar för vanliga objekt kan aktiveras manuellt utan webbmedgivande, även när objektet inte är tillgängligt. För HyrUtSmart-objekt krävs dock medgivande även för prospektet. Godkänd kontroll av kundtext och bilder krävs. Aktivering innebär inte i sig ett medgivande till publicering på hemsidan.

Kontrollen startar efter intag, bildändring, ändrade bostadsuppgifter eller nytt medgivande. En daglig återhämtning försöker igen efter avbrott och upptäcker ändringar från direktimporter. CRM-knappen **Kontrollera igen** kan användas efter rättning.

## Publiceringsmedgivande

Ett tydligt ja till webbpublicering kan komma via sms, mejl, chatt, samtal eller uthyrarlänken. Registrera beskedet under **Publicering** på den berörda bostaden: vem som svarade, datum, kanal, vad som godkändes och var underlaget finns. Ett senare nej eller återkallande går också att registrera; det avpublicerar bostaden, stänger prospektlänken och bevarar underlaget i kontaktloggen. Uthyraren kan även själv ta bort bostaden via sin personliga länk.

I Objektsbanken finns filter för granskade bostäder som saknar registrerat medgivande och för opublicerade bostäder med medgivande. De är kandidater för genomgång, inte bevis för att publicering fortfarande är önskad. Kontrollera senare besked, rätt att använda bilderna och att kundtexten stämmer.

Den fristående uthyrarlänken begär enbart medgivande för de bostäder som visas och väljs. Förmedlingsvillkor hanteras separat när en konkret förfrågan är aktuell. Ett publiceringsja signerar inte förmedlingsavtalet; äldre avtal och deras versioner skrivs inte om.

## Befintliga objekt

1. Ta en lokal kopia av objekt, ägare och bildidentiteter.
2. Kör `scripts/audit-property-content.ts` mot kopian. `--local-cache` kan användas för lokal återupptagning.
3. Granska rapportens undantag; `scripts/refine-property-content-audit.ts` kontrollerar olösta lokala poster igen.
4. Kör den additiva migreringen `scripts/migrate-property-content-review.ts` före driftsättning.
5. `scripts/apply-property-content-audit.ts audit.json` förhandsvisar. `--apply` sparar enbart poster vars aktuella underlag fortfarande matchar rapporten och tar en lokal säkerhetskopia först.

Skriptens rapporter och säkerhetskopior innehåller interna uppgifter. De ska ligga i gitignorerad `tmp/`, inte checkas in. Ingen granskning skickar SMS eller mejl, och inga kontaktuppföljningar avslutas.

## Stilförslag

- Västervik: ”Möblerad bostad på 97 m² med tre sovrum och eget kök. Bostaden disponeras utan delade ytor.”
- Vaggeryd: ”Hus på 66 m² för fyra personer. Utrustat kök, tvättmaskin, torktumlare och parkering finns.”
- Vålberg: ”Boende med fyra sovrum och åtta bäddar. Kök, två badrum, tvättmaskin och parkering finns.”

Det är referenser för ton och struktur. Varje annons ska enbart använda sitt eget bekräftade underlag.
