import { defineTool } from "eve/tools";
import { z } from "zod";
import { lasInstallningar } from "../lib/annons-installningar.ts";
import { blobLagring } from "../lib/facebook-uppdrag.ts";
import { resultat, valtKonto, veckolage } from "../lib/meta-annonser.ts";

export default defineTool({
  description:
    "Kajsas Meta-annonser: per ort kostnaden den här veckan mot taket per ort och vecka, löpande dagsbudget och " +
    "prognos för veckan; per kampanj kostnad och leads för vald period; Meta-kontots månadstak. Ändrar ingenting.",
  inputSchema: z.object({
    period: z.enum(["idag", "7d", "manad"]).default("7d").describe("Perioden för kostnad och leads per kampanj"),
  }),
  async execute({ period }) {
    const konto = await valtKonto();
    const preset = period === "idag" ? "today" : period === "7d" ? "last_7d" : "this_month";
    const [v, res, inst] = await Promise.all([veckolage(konto), resultat(konto, preset), lasInstallningar(blobLagring())]);
    const orter = [...new Set([...v.kostnad.keys(), ...v.lopande.keys()])].map((k) => ({
      ort: v.visa(k),
      kostnadVeckanKr: Math.round(v.kostnad.get(k) ?? 0),
      lopandeKrPerDag: v.lopande.get(k) ?? 0,
      prognosVeckanKr: Math.round((v.kostnad.get(k) ?? 0) + (v.lopande.get(k) ?? 0) * v.dagar),
    }));
    const kampanjer = v.objekt
      .filter((o) => o.niva === "kampanj")
      .map((k) => {
        const r = res.perKampanj.find((x) => x.id === k.id);
        const grupper = v.objekt.filter((g) => g.niva === "annonsgrupp" && g.kampanjId === k.id);
        return {
          id: k.id,
          namn: k.namn,
          status: k.status,
          orter: [...new Set(grupper.map((g) => g.ort ?? "okänd ort"))],
          dagsbudgetKr: k.dagsbudgetKr ?? undefined,
          kostnadKr: Math.round(r?.spendKr ?? 0),
          leads: r?.leads ?? 0,
          krPerLead: r && r.leads ? Math.round(r.spendKr / r.leads) : undefined,
          annonsgrupper: grupper.map((g) => ({ id: g.id, namn: g.namn, ort: g.ort ?? "okänd ort", status: g.status, dagsbudgetKr: g.dagsbudgetKr ?? undefined, livstidsbudgetKr: g.livstidsbudgetKr ?? undefined })),
        };
      })
      .filter((k) => k.status === "ACTIVE" || k.kostnadKr > 0)
      .sort((a, b) => b.kostnadKr - a.kostnadKr)
      .slice(0, 20);
    return {
      takPerOrtOchVeckaKr: inst.krPerOrtOchVecka,
      dagarKvarAvVeckan: v.dagar,
      orter,
      period,
      kampanjer,
      metaKontotak: konto.kontotakKr ? { takKr: konto.kontotakKr, spenderatKr: konto.spenderatMotKontotakKr } : undefined,
    };
  },
});
