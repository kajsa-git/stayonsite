import { defineTool } from "eve/tools";
import { z } from "zod";
import { gruppLank, grupperFor, type FacebookGrupp } from "../lib/facebook-grupper.ts";

const kort = (g: FacebookGrupp) => ({
  namn: g.namn,
  orter: g.orter.length ? g.orter : undefined,
  vantarPaGodkannande: g.vantar || undefined,
  flerMedSammaNamn: g.antal && g.antal > 1 ? g.antal : undefined,
  lank: gruppLank(g.namn),
});

export default defineTool({
  description:
    "Kajsas Facebook-grupper för en ort: bostadsgrupper i orten, lokala anslagstavlor i orten, " +
    "grupper för hela länet, bostadsgrupper i närliggande orter i samma län och rikstäckande grupper. " +
    "Ange länet om orten kan finnas i flera län eller saknas i listan (t.ex. 'Gävleborg'). " +
    "Grupper som väntar på godkännande kan inte postas i ännu.",
  inputSchema: z.object({
    ort: z.string().min(1).describe("Ort, t.ex. Gävle"),
    lan: z.string().optional().describe("Län utan ordet län, t.ex. Gävleborg"),
  }),
  async execute({ ort, lan }) {
    const u = grupperFor(ort, lan);
    return {
      ort: u.ort,
      lan: u.lan,
      iOrten: u.iOrten.map(kort),
      lokalaIOrten: u.lokalaIOrten.map(kort),
      helaLanet: u.helaLanet.map(kort),
      narliggande: u.narliggande.map(kort),
      rikstackande: u.rikstackande.map(kort),
      tips:
        u.iOrten.length + u.helaLanet.length === 0
          ? "Inga bostadsgrupper för orten eller länet i listan. Fråga Kajsa vilket län orten ligger i, eller om hon vill gå med i nya grupper."
          : undefined,
    };
  },
});
