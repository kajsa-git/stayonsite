// MCP-servern: AI-agenter (Claude Code, Codex m.fl.) chattar med CRM:et via
// Streamable HTTP på /api/mcp/mcp. Auth är statisk bearer-token (samma mönster
// som Mac-agenten): CRM_MCP_TOKEN ger läsverktygen, CRM_MCP_WRITE_TOKEN ger
// läs + icke-destruktiva skrivverktyg. Fail-closed: utan tokens i miljön är
// endpointen avstängd (Vercel preview saknar dem med flit).
//
// Middleware täcker inte /api/mcp — den här grinden är hela auth-lagret.
// 401 skickas MEDVETET utan WWW-Authenticate: vissa MCP-klienter tolkar den
// headern som "kör OAuth-discovery" och fastnar i ett trasigt inloggningsflöde.
import { bearerAuthorized } from "@/lib/crm/bearer-auth";
import { registerCrmTools } from "@/lib/crm/mcp";
import { createMcpHandler } from "mcp-handler";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const HANDLER_CONFIG = {
  basePath: "/api/mcp",
  maxDuration: 60,
  disableSse: true, // stateless Streamable HTTP — SSE-vägen (kräver Redis) kan aldrig nås
  verboseLogs: false,
} as const;

const SERVER_INFO = { serverInfo: { name: "stayonsite-crm", version: "1.0.0" } };

const readHandler = createMcpHandler(
  (server) => registerCrmTools(server, { includeWrites: false }),
  SERVER_INFO,
  HANDLER_CONFIG,
);

const writeHandler = createMcpHandler(
  (server) => registerCrmTools(server, { includeWrites: true }),
  SERVER_INFO,
  HANDLER_CONFIG,
);

const guarded = (req: Request): Promise<Response> | Response =>
  bearerAuthorized(req, process.env.CRM_MCP_WRITE_TOKEN)
    ? writeHandler(req)
    : bearerAuthorized(req, process.env.CRM_MCP_TOKEN)
      ? readHandler(req)
      : Response.json({ error: "Unauthorized" }, { status: 401 });

export { guarded as GET, guarded as POST, guarded as DELETE };
