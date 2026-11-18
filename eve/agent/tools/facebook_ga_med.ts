import { defineTool } from "eve/tools";
import { z } from "zod";
import { arKajsa } from "../lib/config.ts";
import { blobLagring, gruppUrl, skapaUppdrag } from "../lib/facebook-uppdrag.ts";

export default defineTool({
  description:
    "Ber Facebook-datorn gå med i Facebook-grupper åt Kajsa. Bara när Kajsa själv har sagt ja till just " +
    "de här grupperna. Datorn går med i högst 5 grupper per dag, i lugn takt när datorn står orörd. " +
    "Grupper som har medlemsfrågor eller regler att godkänna kommer tillbaka med frågorna, så att du " +
    "kan föreslå svar.",
  inputSchema: z.object({
    ort: z.string().min(2).max(60).describe("Orten grupperna gäller"),
    grupper: z
      .array(z.object({ namn: z.string().min(1).max(200), url: z.string().url() }))
      .min(1)
      .max(10)
      .describe("Grupperna, med länkarna från sökresultatet"),
  }),
  async execute({ ort, grupper }, ctx) {
    if (!arKajsa(ctx.session.auth.current)) {
      throw new Error("Datorn går bara med i grupper när Kajsa själv har bett om det i chatten.");
    }
    const rena = grupper.map((g) => ({ namn: g.namn, url: gruppUrl(g.url) }));
    const fel = rena.filter((g) => !g.url).map((g) => g.namn);
    if (fel.length) throw new Error(`Inte en Facebook-grupplänk: ${fel.join(", ")}`);
    const u = await skapaUppdrag(blobLagring(), {
      typ: "ga_med",
      ort,
      grupper: rena as { namn: string; url: string }[],
    });
    return { skickat: true, uppdrag: u.id, grupper: rena.length };
  },
});
