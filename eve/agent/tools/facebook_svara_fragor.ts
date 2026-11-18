import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { arKajsa } from "../lib/config.ts";
import { blobLagring, gruppUrl, skapaUppdrag } from "../lib/facebook-uppdrag.ts";

export default defineTool({
  description:
    "Ber Facebook-datorn svara på en grupps medlemsfrågor och skicka förfrågan om att gå med. Visa först " +
    "Kajsa varje fråga med ditt svar och om gruppens regler godkänns; anropa bara när hon har sagt ja till " +
    "exakt de svaren. Hon får sedan en Godkänn-knapp, och först då skickas svaren. Frågorna ska vara " +
    "ordagrant som datorn skickade dem. Vid flervalsfrågor ska svaret vara exakt ett av alternativen " +
    "(flera alternativ skiljs med ' | ').",
  approval: {
    request: always(),
    // Godkännandet får komma från Kajsa även om frågan uppstod i en tur som Mac:en startade.
    response: ({ response }) =>
      arKajsa(response.principal)
        ? { status: "allowed" }
        : { status: "rejected", reason: "Bara Kajsa kan godkänna svar till Facebook-grupper." },
  },
  inputSchema: z.object({
    ort: z.string().min(2).max(60),
    grupp: z.object({ namn: z.string().min(1).max(200), url: z.string().url() }),
    svar: z
      .array(z.object({ fraga: z.string().min(1).max(600), svar: z.string().min(1).max(1000) }))
      .min(1)
      .max(10),
    godkannRegler: z.boolean().describe("Sant om Kajsa har godkänt att gruppens regler accepteras"),
  }),
  async execute({ ort, grupp, svar, godkannRegler }) {
    const url = gruppUrl(grupp.url);
    if (!url) throw new Error("Inte en Facebook-grupplänk.");
    const u = await skapaUppdrag(blobLagring(), { typ: "svara", ort, grupp: { namn: grupp.namn, url }, svar, godkannRegler });
    return { skickat: true, uppdrag: u.id };
  },
});
