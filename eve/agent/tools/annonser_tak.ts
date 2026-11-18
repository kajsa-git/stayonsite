import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";
import { sparaInstallningar } from "../lib/annons-installningar.ts";
import { arKajsa } from "../lib/config.ts";
import { blobLagring } from "../lib/facebook-uppdrag.ts";

export default defineTool({
  description:
    "Ändrar taket för Kajsas Meta-annonser: högsta kostnad per ort och vecka i kronor (standard 1 000 kr). " +
    "Kräver Kajsas Godkänn. Vakten kollar varje timme och pausar en orts annonser när orten når taket.",
  approval: {
    request: always(),
    response: ({ response }) =>
      arKajsa(response.principal) ? { status: "allowed" } : { status: "rejected", reason: "Bara Kajsa kan ändra taket." },
  },
  inputSchema: z.object({ krPerOrtOchVecka: z.number().int().min(100).max(100_000) }),
  async execute({ krPerOrtOchVecka }, ctx) {
    if (!arKajsa(ctx.session.auth.current)) throw new Error("Taket ändras bara när Kajsa själv ber om det i chatten.");
    await sparaInstallningar(blobLagring(), { krPerOrtOchVecka, andrad: new Date().toISOString() });
    return { klart: true, krPerOrtOchVecka };
  },
});
