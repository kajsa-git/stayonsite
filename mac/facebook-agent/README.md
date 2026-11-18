# Facebook-agenten på Kajsas Mac

Läser nya kommentarer på Kajsas inlägg och nya Messenger-trådar i ett eget Chrome-fönster där hon är inloggad, och skickar texten till Kajsas agent i Telegram. Agenten sorterar ut uthyrarna, matchar dem mot förfrågningarna och föreslår svar. **Den här versionen läser bara. Den postar, kommenterar och skickar ingenting på Facebook.**

## Så beter den sig

- **Bara jobb lämnar datorn.** Kontot är Kajsas privata, så ett filter på datorn släpper bara igenom kommentarer i bostadsgrupper, meddelanden som handlar om boende och meddelanden från personer som har svarat på hennes bostadsinlägg. Privata notiser och samtal med vänner och familj skickas aldrig; loggen visar bara hur många som hoppades över.
- Kör bara **dagtid (08–21)** och när datorn har varit **orörd i minst 3 minuter**. Rör Kajsa musen väntar den.
- Högst en körning var **20:e minut**, några få sidladdningar med pauser emellan.
- Använder Kajsas vanliga Google Chrome men en **egen profil**, så hennes egna flikar och inloggningar påverkas inte.
- Vill Facebook att någon loggar in eller verifierar kontot **pausar den i två timmar och säger till i Telegram**. Den försöker aldrig ta sig förbi en kontroll.
- Första körningen markerar allt som redan finns som sett, så Kajsa får bara det som kommer efteråt.
- Är datorn avstängd händer inget; den fortsätter när datorn är igång igen.

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

## Vardag

- **Logg:** `tail -f ~/Library/Logs/stayonsite-facebook-agent.log`
- **Stoppa:** `launchctl unload -w ~/Library/LaunchAgents/se.stayonsite.facebook-agent.plist`
- **Facebook har loggat ut:** `cd ~/Projects/stayonsite/mac/facebook-agent && npm run login`
- **Ny version:** `cd ~/Projects/stayonsite && git pull`, sedan `launchctl unload` och `launchctl load` enligt ovan.

## Tester

```bash
npm test
```
