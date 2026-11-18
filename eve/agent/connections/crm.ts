import { defineMcpClientConnection } from "eve/connections";
import { crmMcpUrl, kravs } from "../lib/config.ts";

// Stayonsites CRM via dess MCP-server (/api/mcp). Skrivverktygen är interna:
// anteckningar, uppföljningsdatum, statusbyte och SMS-utkast som väntar på att en
// människa godkänner dem i CRM:et. Inget skickas till någon utanför. Raderingar
// finns inte i MCP-servern. Statusbyte på en förfrågan kräver ändå Kajsas ja.
export default defineMcpClientConnection({
  url: crmMcpUrl(),
  description:
    "Stayonsites CRM: förfrågningar, kunder, kontakter, uthyrare, objekt, inkorg med SMS-svar, dagens " +
    "att göra, matchning mot förfrågningar, uthyrare med sökorter och Qasa-sökning. Kan skriva " +
    "anteckningar, sätta uppföljningsdatum och skapa SMS-utkast (utkast skickas aldrig automatiskt).",
  auth: { principalType: "app", getToken: async () => ({ token: kravs("CRM_MCP_WRITE_TOKEN") }) },
  approval: ({ toolName }) => (toolName.endsWith("crm_update_request_status") ? "user-approval" : "not-applicable"),
});
