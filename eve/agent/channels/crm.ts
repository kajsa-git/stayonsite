import { timingSafeEqual } from "node:crypto";
import { defineChannel, POST } from "eve/channels";
import { kajsasChatId } from "../lib/config.ts";
import telegram from "./telegram.ts";

// CRM:et anropar den här när en ny förfrågan skapas (src/lib/crm/agent-notify.ts).
// Agenten gör källsökningen och skriver till Kajsa i Telegram. Själva förfrågan
// läses ur CRM:et, så bara id:t behöver litas på.
function behorig(req: Request): boolean {
  const hemlis = process.env.KAJSA_AGENT_SECRET?.trim();
  const header = req.headers.get("authorization") ?? "";
  if (!hemlis || !header.startsWith("Bearer ")) return false;
  const a = Buffer.from(header.slice(7));
  const b = Buffer.from(hemlis);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default defineChannel({
  routes: [
    POST("/crm/ny-forfragan", async (req, ctx) => {
      if (!behorig(req)) return new Response("unauthorized", { status: 401 });
      const body = (await req.json().catch(() => null)) as { requestId?: unknown; source?: unknown } | null;
      const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";
      if (!/^[A-Za-z0-9_-]{4,40}$/.test(requestId)) return new Response("bad request", { status: 400 });
      const kalla = body?.source === "crm" ? "lagts in i CRM:et" : "kommit in via webben";

      ctx.waitUntil(
        ctx.to(telegram, { chatId: kajsasChatId() }).send(
          `[Från CRM:et] En ny förfrågan har ${kalla}: requestId ${requestId}. ` +
            "Gör källsökningen enligt instruktionerna och skicka sammanfattningen till Kajsa.",
          {
            auth: { authenticator: "crm", principalType: "service", principalId: "stayonsite-crm", attributes: {} },
            idempotencyKey: `crm:ny-forfragan:${requestId}`,
          },
        ),
      );
      return Response.json({ ok: true }, { status: 202 });
    }),
  ],
});
