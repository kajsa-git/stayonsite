import { defaultTelegramAuth, telegramChannel } from "eve/channels/telegram";
import { kajsasTelegramIds } from "../lib/config.ts";
import { anropaCrm } from "../lib/crm-mcp.ts";
import { lasTangentbord, markeraLoggad, postadeGrupper, tolkaTryck, vaxla } from "../lib/postningslista.ts";

// Kajsas privata chatt med boten. Alla andra (grupper, okända användare) ignoreras.
export default telegramChannel({
  uploadPolicy: { allowedMediaTypes: ["image/*", "application/pdf"], maxBytes: 15 * 1024 * 1024 },

  async onMessage(_ctx, message) {
    if (message.chat.type !== "private") return null;
    if (!message.from || !kajsasTelegramIds().has(message.from.id)) return null;
    return { auth: defaultTelegramAuth(message) };
  },

  // Knapparna i postningslistan. Körs utan modellen: knappsatsen i meddelandet är
  // listans läge, och "Klar" skriver en anteckning på kunden i CRM:et.
  async onCallbackQuery(ctx, query) {
    const svara = (text?: string) => ctx.telegram.answerCallbackQuery({ callbackQueryId: query.id, text });
    if (!kajsasTelegramIds().has(query.from.id)) return void (await svara("Inte behörig."));

    const tryck = tolkaTryck(query.data);
    const kb = lasTangentbord(query.raw);
    const messageId = query.message?.messageId;
    if (!tryck || !kb || !messageId) return void (await svara());

    if (tryck.typ === "klar") {
      const grupper = postadeGrupper(kb);
      if (!grupper.length) return void (await svara("Inga grupper är markerade som postade än."));
      try {
        const forfragan = await anropaCrm<{ companyId?: string; requestNumber?: number; city?: string }>("crm_get_request", {
          id: tryck.requestId,
        });
        if (!forfragan?.companyId) throw new Error("Förfrågan hittades inte i CRM:et.");
        const datum = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
        const vilken = forfragan.requestNumber ? `#${forfragan.requestNumber}` : tryck.requestId;
        await anropaCrm("crm_add_note", {
          companyId: forfragan.companyId,
          channel: "övrigt",
          content:
            `Facebook ${datum}, förfrågan ${vilken}${forfragan.city ? ` (${forfragan.city})` : ""}: ` +
            `postat i ${grupper.length} grupper.\n${grupper.map((g) => `- ${g}`).join("\n")}`,
        });
        await ctx.telegram.editMessageReplyMarkup({ messageId, replyMarkup: { inline_keyboard: markeraLoggad(kb, grupper.length) } });
        return void (await svara(`Loggat i CRM:et: ${grupper.length} grupper.`));
      } catch (error) {
        console.error("kajsas-agent: postningslistan kunde inte loggas", error instanceof Error ? error.message : error);
        return void (await svara("Kunde inte logga i CRM:et just nu. Försök igen om en stund."));
      }
    }

    const ny = vaxla(kb, tryck);
    if (ny) await ctx.telegram.editMessageReplyMarkup({ messageId, replyMarkup: { inline_keyboard: ny } });
    await svara(tryck.typ === "postad" ? "Markerad som postad" : "Ångrat");
  },
});
