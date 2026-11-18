import { defineTool } from "eve/tools";
import { z } from "zod";
import { MAX_KNAPPAR, MAX_KNAPPTEXT, svarsknappar } from "../lib/knappar.ts";
import { skickaTillKajsa } from "../lib/telegram-api.ts";

export default defineTool({
  description:
    "Skickar ditt svar till Kajsa i Telegram med 2-3 svarsknappar under (högst 4). Ett tryck skickar knappens text " +
    "som hennes nästa meddelande; hon kan också skriva fritt. Använd när du avslutar en sammanfattning " +
    "eller ett förslag och nästa steg är ett val. Lägg hela svaret i text (det här ersätter ditt vanliga " +
    "svar, skriv inget mer efteråt). Knapptexterna ska vara korta och självklara, med förfrågans nummer " +
    "när det gäller en förfrågan, t.ex. 'Facebook-inlägg #128'.",
  endsTurn: true,
  inputSchema: z.object({
    text: z.string().min(1).max(3800).describe("Hela svaret till Kajsa, vanlig text utan Markdown"),
    knappar: z
      .array(z.string().min(1).max(MAX_KNAPPTEXT))
      .min(2)
      .max(MAX_KNAPPAR)
      .describe("2-4 korta svarsalternativ"),
  }),
  async execute({ text, knappar }) {
    const { messageId } = await skickaTillKajsa({ text, reply_markup: svarsknappar(knappar) });
    return { skickat: true, messageId, knappar };
  },
});
