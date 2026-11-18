// Direktanrop till CRM:ets MCP-server, för kod som körs utanför ett samtal med
// modellen (knapptryck i Telegram). I samtal använder agenten connections/crm.ts.
// Servern är tillståndslös (Streamable HTTP utan sessioner) och kan svara med
// antingen JSON eller en SSE-ström; båda hanteras.
import { crmMcpUrl, kravs } from "./config.ts";

interface ToolResult {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

export function lasJsonRpcSvar(text: string, contentType: string | null): { result?: ToolResult; error?: { message?: string } } {
  if (contentType?.includes("text/event-stream")) {
    const data = text
      .split(/\r?\n/)
      .filter((rad) => rad.startsWith("data:"))
      .map((rad) => rad.slice(5).trim())
      .filter(Boolean)
      .pop();
    if (!data) throw new Error("Tomt svar från CRM:et.");
    return JSON.parse(data);
  }
  return JSON.parse(text);
}

export async function anropaCrm<T = unknown>(
  namn: string,
  args: Record<string, unknown>,
  opts: { fetchImpl?: typeof fetch; env?: Record<string, string | undefined> } = {},
): Promise<T> {
  const env = opts.env ?? process.env;
  const res = await (opts.fetchImpl ?? fetch)(crmMcpUrl(env), {
    method: "POST",
    headers: {
      authorization: `Bearer ${kravs("CRM_MCP_WRITE_TOKEN", env)}`,
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params: { name: namn, arguments: args } }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`CRM:et svarade ${res.status} på ${namn}.`);
  const svar = lasJsonRpcSvar(await res.text(), res.headers.get("content-type"));
  if (svar.error) throw new Error(svar.error.message ?? `CRM-fel i ${namn}.`);
  const text = svar.result?.content?.find((c) => c.type === "text")?.text ?? "";
  if (svar.result?.isError) throw new Error(text || `CRM-fel i ${namn}.`);
  return (text ? JSON.parse(text) : null) as T;
}
