import { defineTool } from "eve/tools";
import { z } from "zod";
import { lasInstallningar } from "../lib/annons-installningar.ts";
import { arKajsa } from "../lib/config.ts";
import { blobLagring } from "../lib/facebook-uppdrag.ts";
import { bedomAndring, sattDagsbudget, sattStatus, simulera, valtKonto, veckolage } from "../lib/meta-annonser.ts";

export default defineTool({
  description:
    "Pausar eller startar en kampanj eller annonsgrupp, eller ändrar dess dagsbudget i Kajsas Meta-konto. " +
    "Pausa går direkt. Starta och ny dagsbudget kräver Kajsas Godkänn, och nekas av koden om någon ort " +
    "skulle gå över taket per ort och vecka. Använd id från annonser_oversikt.",
  approval: {
    request: (ctx) => ((ctx.toolInput as { atgard?: string } | undefined)?.atgard === "pausa" ? "not-applicable" : "user-approval"),
    response: ({ response }) =>
      arKajsa(response.principal) ? { status: "allowed" } : { status: "rejected", reason: "Bara Kajsa kan ändra annonserna." },
  },
  inputSchema: z.object({
    id: z.string().regex(/^\d{5,25}$/).describe("Kampanjens eller annonsgruppens id"),
    namn: z.string().min(1).max(200).describe("Namnet, så att Kajsa ser vad hon godkänner"),
    atgard: z.enum(["pausa", "starta", "dagsbudget"]),
    dagsbudgetKr: z.number().int().min(10).max(100_000).optional().describe("Ny dagsbudget i kronor, bara för atgard dagsbudget"),
  }),
  async execute({ id, atgard, dagsbudgetKr }, ctx) {
    if (!arKajsa(ctx.session.auth.current)) throw new Error("Annonserna ändras bara när Kajsa själv ber om det i chatten.");
    const konto = await valtKonto();
    const v = await veckolage(konto);
    const mal = v.objekt.find((o) => o.id === id);
    if (!mal) throw new Error(`Hittar ingen kampanj eller annonsgrupp med id ${id} i ${konto.namn}.`);

    if (atgard === "pausa") {
      await sattStatus(id, "PAUSED");
      return { klart: true, pausad: mal.namn };
    }

    const { krPerOrtOchVecka } = await lasInstallningar(blobLagring());
    let efter;
    if (atgard === "starta") {
      if (mal.status === "ACTIVE") return { klart: true, redanAktiv: mal.namn };
      efter = simulera(v.objekt, id, { status: "ACTIVE" });
    } else {
      if (dagsbudgetKr == null) throw new Error("Ange dagsbudgetKr.");
      if (!mal.dagsbudgetKr) {
        throw new Error(
          mal.livstidsbudgetKr
            ? `${mal.namn} har livstidsbudget. Ändra den i Ads Manager.`
            : `Budgeten för ${mal.namn} sitter på ${mal.niva === "kampanj" ? "annonsgrupperna" : "kampanjen"}, ändra den där.`,
        );
      }
      efter = simulera(v.objekt, id, { dagsbudgetKr });
    }
    const b = bedomAndring({ takKr: krPerOrtOchVecka, kostnadPerOrt: v.kostnad, fore: v.objekt, efter, dagar: v.dagar, visaOrt: v.visa });
    if (!b.ok) throw new Error(`Gör inte ändringen: ${b.skal}`);
    if (atgard === "starta") await sattStatus(id, "ACTIVE");
    else await sattDagsbudget(id, dagsbudgetKr!, konto);
    return { klart: true, namn: mal.namn, atgard, dagsbudgetKr, prognosForVeckanPerOrt: b.prognos, takPerOrtOchVeckaKr: krPerOrtOchVecka };
  },
});
