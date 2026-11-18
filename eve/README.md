# Kajsas agent

Kajsas assistent i Telegram, byggd på Vercels ramverk [eve](https://eve.dev/docs). Den läser och skriver i CRM:et via CRM:ets MCP-server, söker boende när en ny förfrågan kommer in och håller ordning på Facebook-postningar. Den skickar aldrig något till någon annan än Kajsa: sms blir utkast i CRM:et, och Facebook postar Kajsa själv.

## Delar

- `agent/channels/telegram.ts`: Kajsas privata chatt med boten. Alla andra ignoreras. Knapparna i postningslistan hanteras här utan modellen.
- `agent/channels/crm.ts`: `POST /crm/ny-forfragan`, som CRM:et anropar när en förfrågan skapas (`src/lib/crm/agent-notify.ts`).
- `agent/connections/crm.ts`: CRM:ets MCP-server, med verktygen för matchning, uthyrare med sökorter och Qasa-sökning (`src/lib/crm/mcp/tools-sourcing.ts`).
- `agent/tools/facebook_grupper.ts` och `agent/lib/facebook-grupper.ts`: Kajsas Facebook-grupper per län och ort. Lägg till nya grupper i listan.
- `agent/tools/postningslista.ts`: skickar inläggstexter och en lista med en knapp per grupp till Kajsa.
- `agent/skills/`: processerna för ny förfrågan och Facebook-inlägg.
- `agent/agent.ts`: Opus 5.5 via AI Gateway och ett kostnadstak.

## Komma igång (en gång)

1. **Bot:** skriv `/newbot` till @BotFather i Telegram. Spara token.
2. **Kajsas id:** Kajsa skriver till @userinfobot och får sitt id.
3. **Vercel:** nytt projekt i Kajsas team, kopplat till `kajsa-git/stayonsite`, med rotmapp `eve`. AI Gateway autentiseras automatiskt med projektets OIDC-token.
4. **Miljövariabler i agentprojektet:**
   - `TELEGRAM_BOT_TOKEN`: från steg 1
   - `TELEGRAM_WEBHOOK_SECRET_TOKEN`: slumpa, t.ex. `openssl rand -hex 32`
   - `KAJSA_TELEGRAM_ID`: från steg 2
   - `CRM_MCP_WRITE_TOKEN`: samma värde som `CRM_MCP_AGENT_TOKEN` i CRM-projektet `stayonsite` (agentens egen nyckel)
   - `KAJSA_AGENT_SECRET`: slumpa
5. **Webhook:** när agenten är driftsatt:
   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://<agentens-domän>/eve/v1/telegram","secret_token":"'"$TELEGRAM_WEBHOOK_SECRET_TOKEN"'","allowed_updates":["message","callback_query"]}'
   ```
6. **CRM-projektet `stayonsite`:** sätt `KAJSA_AGENT_URL=https://<agentens-domän>` och `KAJSA_AGENT_SECRET` (samma som ovan). Utan dem gör CRM:et ingenting med nya förfrågningar.

## Lokalt

```bash
pnpm install --ignore-workspace
pnpm test         # grupplistan, postningslistan, CRM-svaren
pnpm typecheck
pnpm build        # eve build
pnpm dev          # eve dev, kräver .env.local med variablerna ovan
```

## Kostnad

Varje meddelande från Kajsa och varje ny förfrågan kör modellen. Taket i `agent/agent.ts` gör att agenten frågar om den ska fortsätta när ett samtal har kostat ca 3 USD sedan förra godkännandet.

## Meta Ads

Meta-åtkomsten är konfigurerad med `META_ADS_TOKEN` i Vercel-projektet `kajsas-agent`. Annonsintegrationen och den tekniska gränsen på **1 000 kr per ort och vecka** återstår att implementera. Konton, verifiering och budgetkrav finns i [Meta Ads-uppsättningen](META_ADS.md).
