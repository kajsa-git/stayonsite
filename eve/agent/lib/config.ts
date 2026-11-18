// Miljövariabler som agenten läser. Alla sätts i agentens Vercel-projekt.
//   KAJSA_TELEGRAM_ID     Kajsas Telegram-användar-id (= chatt-id i hennes privata chatt
//                         med boten). Flera id kan anges kommaseparerat.
//   TELEGRAM_BOT_TOKEN    från BotFather
//   TELEGRAM_WEBHOOK_SECRET_TOKEN  slumpad hemlighet som registreras med setWebhook
//   CRM_MCP_URL           standard https://www.stayonsite.se/api/mcp/mcp
//   CRM_MCP_WRITE_TOKEN   samma värde som i CRM:ets Vercel-projekt
//   KAJSA_AGENT_SECRET    delad hemlighet med CRM:et för "ny förfrågan"-anropet
//   MAC_AGENT_SECRET      delad hemlighet med Facebook-agenten på Kajsas Mac (mac/facebook-agent)

export function kajsasTelegramIds(env: Record<string, string | undefined> = process.env): Set<string> {
  return new Set(
    (env.KAJSA_TELEGRAM_ID ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/** Chatten dit agenten skriver själv: Kajsas privata chatt med boten. */
export function kajsasChatId(env: Record<string, string | undefined> = process.env): string {
  const [forsta] = kajsasTelegramIds(env);
  if (!forsta) throw new Error("KAJSA_TELEGRAM_ID saknas i miljön.");
  return forsta;
}

export function crmMcpUrl(env: Record<string, string | undefined> = process.env): string {
  return env.CRM_MCP_URL?.trim() || "https://www.stayonsite.se/api/mcp/mcp";
}

export function kravs(namn: string, env: Record<string, string | undefined> = process.env): string {
  const v = env[namn]?.trim();
  if (!v) throw new Error(`${namn} saknas i miljön.`);
  return v;
}
