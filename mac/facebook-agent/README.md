# Facebook-agenten på Kajsas Mac

Läser nya kommentarer på Kajsas inlägg och nya Messenger-trådar i ett eget Chrome-fönster där hon är inloggad, och skickar texten till Kajsas agent i Telegram. Agenten sorterar ut uthyrarna, matchar dem mot förfrågningarna och föreslår svar.

Den söker också nya Facebook-grupper, går med i dem och svarar på gruppernas medlemsfrågor, men bara på uppdrag som Kajsa har sagt ja till i Telegram. **Den postar, kommenterar och skickar aldrig meddelanden på Facebook.**

## Så beter den sig

- **Bara jobb lämnar datorn.** Kontot är Kajsas privata, så ett filter på datorn släpper bara igenom kommentarer i bostadsgrupper, meddelanden som handlar om boende och meddelanden från personer som har svarat på hennes bostadsinlägg. Privata notiser och samtal med vänner och familj skickas aldrig; loggen visar bara hur många som hoppades över.
- Kör bara **dagtid (08–21)** och när datorn har varit **orörd i minst 3 minuter**. Rör Kajsa musen väntar den.
- Högst en körning var **20:e minut**, några få sidladdningar med pauser emellan.
- Använder Kajsas vanliga Google Chrome men en **egen profil**, så hennes egna flikar och inloggningar påverkas inte.
- Vill Facebook att någon loggar in eller verifierar kontot **pausar den i två timmar och säger till i Telegram**. Den försöker aldrig ta sig förbi en kontroll.
- Första körningen markerar allt som redan finns som sett, så Kajsa får bara det som kommer efteråt.
- Är datorn avstängd händer inget; den fortsätter när datorn är igång igen.

### Grupper

- Söker grupper när agenten ber om det (Kajsa ber om fler grupper, eller en förfrågan gäller en ort med få grupper). Sökningen ändrar ingenting.
- Går med bara i de grupper Kajsa har sagt ja till, **högst 5 per dag** och högst 2 per körning med pauser emellan. Den trycker bara på Gå med-knappen högst upp på gruppens sida.
- Har gruppen medlemsfrågor stänger den rutan utan att skicka och lämnar frågorna till agenten, som skriver förslag på svar. Kajsa ser varje fråga och svar, säger ja och trycker Godkänn. Först då fyller datorn i och skickar.
- Har frågorna ändrats sedan Kajsa godkände svaren skickas ingenting.

### Uppdateringar och larm

Programmet består av en liten startdel (`agent.mjs`, den som launchd kör) och huvuddelen (`huvud.mjs`).

- Startdelen hämtar själv nya versioner från GitHub vid start och var 30:e minut, när något i den här mappen har ändrats, och startar om. Ingen behöver göra något. Lokala ändringar skrivs aldrig över; då står det "kunde inte uppdatera" i loggen.
- Startdelen hålls liten och ändras sällan, så den fungerar även om en ny huvuddel är trasig. Den installerar paket som saknas, startar om huvuddelen när den kraschar och letar då efter en rättad version var 5:e minut.
- Kraschar huvuddelen tre gånger i rad får Kajsa ett meddelande i Telegram, en gång per version.
- Har datorn inte hört av sig på tre timmar dagtid (10-20) säger agenten till i Telegram, en gång. Är datorn avstängd är det lugnt.

## Installera (en gång, på Kajsas Mac)

Kräver Google Chrome och Node (finns redan för iMessage-agenten).

1. Hämta senaste koden:
   ```bash
   cd ~/Projects/stayonsite && git pull
   ```
2. Installera:
   ```bash
   cd mac/facebook-agent && npm install
   ```
3. Lägg till två rader i `~/Projects/stayonsite/.env.local` (värdet för `MAC_AGENT_SECRET` får du av David):
   ```
   KAJSA_AGENT_URL=https://kajsas-agent.vercel.app
   MAC_AGENT_SECRET=...
   ```
4. Logga in på Facebook i agentens fönster:
   ```bash
   npm run login
   ```
   Ett Chrome-fönster öppnas. Logga in som vanligt (bocka gärna i "kom ihåg mig"), och stäng sedan fönstret.
5. Provkör en gång:
   ```bash
   npm run once
   ```
   Första gången står det "första körningen: … markerade som sedda" i terminalen. Det är rätt.
6. Starta automatiskt:
   ```bash
   cp se.stayonsite.facebook-agent.plist ~/Library/LaunchAgents/
   launchctl load -w ~/Library/LaunchAgents/se.stayonsite.facebook-agent.plist
   ```

## Byt till versionen som uppdaterar sig själv (en gång)

Den första installationen (18 november) uppdaterar sig inte själv. Kör det här en gång, sedan sker det automatiskt:

```bash
cd ~/Projects/stayonsite && git pull && cd mac/facebook-agent && npm install
launchctl unload ~/Library/LaunchAgents/se.stayonsite.facebook-agent.plist
launchctl load -w ~/Library/LaunchAgents/se.stayonsite.facebook-agent.plist
```

## Vardag

- **Logg:** `tail -f ~/Library/Logs/stayonsite-facebook-agent.log`
- **Stoppa:** `launchctl unload -w ~/Library/LaunchAgents/se.stayonsite.facebook-agent.plist`
- **Facebook har loggat ut:** `cd ~/Projects/stayonsite/mac/facebook-agent && npm run login`
- **Ny version:** sker automatiskt (se Uppdateringar och larm).
- **Felsöka grupper** (klickar och skickar inget): `npm run grupp -- https://www.facebook.com/groups/...` visar medlemskap, `npm run sok -- "bostad Gävle"` visar sökträffarna.

## Tester

```bash
npm test
```
