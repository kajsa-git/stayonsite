# Automatisk granskning av objekt

Beskrivning, skick och vad som ingår språkgranskas till korta, faktiska kundtexter på svenska, engelska och polska. Alla bilder kontrolleras enkelt: de ska avse ett boende och vara lämpliga att visa. Granskningen bevisar inte vem som äger bostaden eller att bilderna visar rätt adress.

Priser, intern ekonomi, kontakter, exakt adress och olämpligt språk får inte finnas i kundtexten. Faktiska motsägelser och bilder som inte går att godkänna ger **Kajsa behöver granska** på objektkortet. Saknade valfria uppgifter utelämnas. Ingen information hittas på.

Godkänd kontroll gäller endast den granskade versionen av uppgifter och hela bildsamlingen. Ändringar stoppar externa vyer tills den nya versionen har granskats. Originaltexten sparas internt. Granskningsrapporter och originaltext skickas inte till kundvyer.

Publicering sker automatiskt för tillgängliga objekt med uthyrarens medgivande och godkänd kontroll. Tidigare publicering räknas som historiskt medgivande enligt befintlig regel. Manuellt avpublicerade objekt förblir pausade. Bokade, uthyrda och avpublicerade objekt ändrar inte tillgänglighetsstatus. Utgångna datum behöver uppdateras. Uppdragssignering är en separat handling.

Kontrollen startar efter intag, bildändring, ändrade bostadsuppgifter eller nytt medgivande. En daglig återhämtning försöker igen efter avbrott och upptäcker ändringar från direktimporter. CRM-knappen **Kontrollera igen** kan användas efter rättning.

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
