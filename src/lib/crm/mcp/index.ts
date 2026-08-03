// MCP-verktygen för CRM:et. Läsverktygen registreras alltid; skrivverktygen bara
// med includeWrites (dvs. när anropet autentiserats med CRM_MCP_WRITE_TOKEN).
// Raderingar exponeras aldrig via MCP — de görs av en människa i CRM-UI:t.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDashboardTools } from "./tools-dashboards";
import { registerEntityTools } from "./tools-entities";
import { registerSearchTools } from "./tools-search";
import { registerWorkTools } from "./tools-work";
import { registerWriteTools } from "./tools-write";
import type { DB } from "./shape";

export interface RegisterCrmToolsOpts {
  includeWrites?: boolean;
  db?: DB; // injicerbar för tester — default är den lata produktions-klienten
}

export function registerCrmTools(server: McpServer, opts?: RegisterCrmToolsOpts) {
  registerSearchTools(server, opts);
  registerEntityTools(server, opts);
  registerDashboardTools(server, opts);
  registerWorkTools(server, opts);
  if (opts?.includeWrites) registerWriteTools(server, opts);
}
