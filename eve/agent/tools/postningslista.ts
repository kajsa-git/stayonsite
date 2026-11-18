import { defineTool } from "eve/tools";
import { z } from "zod";
import { delaLista } from "../lib/postningslista.ts";
import { skickaTillKajsa } from "../lib/telegram-api.ts";

const BOKSTAVER = ["A", "B", "C"];

export default defineTool({
  description:
    "Skickar en postningslista till Kajsa i Telegram: först inläggstexterna (en per variant, så hon kan " +
    "kopiera), sedan en lista med en rad per Facebook-grupp där gruppnamnet öppnar gruppen och ✅ " +
    "markerar att hon har postat. När hon trycker Klar loggas grupperna som en anteckning på kunden i " +
    "CRM:et. Använd 2-3 varianter av texten när det är fler än 10 grupper, så att inläggen inte ser " +
    "ut som spam. Varje grupp får en variant (A, B eller C). Agenten postar aldrig själv på Facebook.",
  inputSchema: z.object({
    requestId: z.string().min(1).describe("Förfrågans id i CRM:et"),
    rubrik: z.string().min(1).max(120).describe("Kort rubrik, t.ex. '#128 Gävle, 4 pers, v.12-24'"),
    texter: z.array(z.string().min(20).max(3000)).min(1).max(3).describe("Inläggstexter, variant A, B, C"),
    grupper: z
      .array(z.object({ namn: z.string().min(1), variant: z.number().int().min(0).max(2).optional() }))
      .min(1)
      .max(120)
      .describe("Grupperna i den ordning Kajsa ska posta; variant är index i texter"),
  }),
  async execute({ requestId, rubrik, texter, grupper }) {
    if (new TextEncoder().encode(`p|${requestId}|999`).length > 64) {
      throw new Error("Förfrågans id är för långt för Telegrams knappar.");
    }
    for (const [i, text] of texter.entries()) {
      await skickaTillKajsa({ text: `Text ${BOKSTAVER[i]} (håll inne för att kopiera):\n\n${text}`, disable_notification: i > 0 });
    }
    const rader = grupper.map((g) => ({
      namn: g.namn,
      variant: texter.length > 1 ? BOKSTAVER[Math.min(g.variant ?? 0, texter.length - 1)] : undefined,
    }));
    const delar = delaLista(requestId, rader);
    const ids: number[] = [];
    for (const [i, kb] of delar.entries()) {
      const del = delar.length > 1 ? ` (del ${i + 1} av ${delar.length})` : "";
      const { messageId } = await skickaTillKajsa({
        text: `Postningslista ${rubrik}${del}\nTryck på gruppen för att öppna den, och ✅ när du har postat.`,
        reply_markup: { inline_keyboard: kb },
      });
      ids.push(messageId);
    }
    return { skickat: true, grupper: grupper.length, meddelanden: ids.length };
  },
});
