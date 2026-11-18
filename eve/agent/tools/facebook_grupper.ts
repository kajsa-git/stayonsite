import { defineTool } from "eve/tools";
import { z } from "zod";
import { gruppLank, grupperFor, normalisera, type FacebookGrupp } from "../lib/facebook-grupper.ts";
import { blobLagring, nyaGrupper } from "../lib/facebook-uppdrag.ts";

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
    "Grupper som väntar på godkännande kan inte postas i ännu. nyaGrupper är grupper som Facebook-datorn " +
    "har gått med i för orten.",
  inputSchema: z.object({
    ort: z.string().min(1).describe("Ort, t.ex. Gävle"),
    lan: z.string().optional().describe("Län utan ordet län, t.ex. Gävleborg"),
  }),
  async execute({ ort, lan }) {
    const u = grupperFor(ort, lan);
    const nya = await nyaGrupper(blobLagring()).catch(() => []);
    const iOrten = nya.filter((g) => normalisera(g.ort) === normalisera(ort));
    return {
      ort: u.ort,
      lan: u.lan,
      iOrten: u.iOrten.map(kort),
      lokalaIOrten: u.lokalaIOrten.map(kort),
      helaLanet: u.helaLanet.map(kort),
      narliggande: u.narliggande.map(kort),
      rikstackande: u.rikstackande.map(kort),
      nyaGrupper: iOrten.length
        ? iOrten.map((g) => ({ namn: g.namn, lank: g.url, vantarPaGodkannande: g.status === "vantar" || undefined }))
        : undefined,
      tips:
        u.iOrten.length + u.helaLanet.length + iOrten.length === 0
          ? "Inga bostadsgrupper för orten eller länet i listan. Fråga Kajsa vilket län orten ligger i, eller om datorn ska söka efter nya grupper (facebook_sok_grupper)."
          : undefined,
    };
  },
});
