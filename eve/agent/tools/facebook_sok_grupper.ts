import { defineTool } from "eve/tools";
import { z } from "zod";
import { blobLagring, skapaUppdrag, standardSokord } from "../lib/facebook-uppdrag.ts";

export default defineTool({
  description:
    "Ber Facebook-datorn på Kajsas Mac söka efter Facebook-grupper för en ort (bostad, uthyrning, " +
    "lägenheter, köp och sälj). Datorn söker när den står orörd dagtid, oftast inom en halvtimme, och " +
    "svaret kommer som ett meddelande '[Från Facebook-datorn]'. Använd när orten har få grupper i " +
    "facebook_grupper eller när Kajsa ber om fler grupper. Sökningen ändrar ingenting på Facebook.",
  inputSchema: z.object({
    ort: z.string().min(2).max(60).describe("Ort, t.ex. Gävle"),
    sokord: z
      .array(z.string().min(2).max(60))
      .max(4)
      .optional()
      .describe("Egna sökord. Utelämna för standard: bostad/uthyrning/lägenheter/köp och sälj + ort"),
  }),
  async execute({ ort, sokord }) {
    const ord = sokord?.length ? sokord : standardSokord(ort);
    const u = await skapaUppdrag(blobLagring(), { typ: "sok_grupper", ort, sokord: ord });
    return { skickat: true, uppdrag: u.id, sokord: ord };
  },
});
