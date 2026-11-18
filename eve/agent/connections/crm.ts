import { defineMcpClientConnection } from "eve/connections";
import { crmMcpUrl, kravs } from "../lib/config.ts";

// Stayonsites CRM via dess MCP-server (/api/mcp). Skrivverktygen är anteckningar,
// uppföljningsdatum, statusbyte, SMS-utkast (godkänns i CRM:et) och mejl från Kajsas
// Gmail. Raderingar finns inte i MCP-servern.
export default defineMcpClientConnection({
  url: crmMcpUrl(),
  description:
    "Stayonsites CRM: förfrågningar, kunder, kontakter, uthyrare, objekt, inkorg med SMS-svar, dagens " +
    "att göra, matchning mot förfrågningar, uthyrare med sökorter och Qasa-sökning. Kan skriva " +
    "anteckningar, sätta uppföljningsdatum, skapa SMS-utkast och skicka mejl från Kajsas Gmail (kräver hennes godkännande).",
  auth: { principalType: "app", getToken: async () => ({ token: kravs("CRM_MCP_WRITE_TOKEN") }) },
  // Mejl går ut till riktiga mottagare och statusbyte ändrar affären: Kajsa trycker
  // Godkänn för varje anrop. Allt annat är läsning eller interna anteckningar och utkast.
  approval: ({ toolName }) =>
    toolName.endsWith("crm_send_email") || toolName.endsWith("crm_update_request_status") ? "user-approval" : "not-applicable",
});
