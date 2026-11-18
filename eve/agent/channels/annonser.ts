import { timingSafeEqual } from "node:crypto";
import { defineChannel, GET } from "eve/channels";
import { lasInstallningar } from "../lib/annons-installningar.ts";
import { blobLagring } from "../lib/facebook-uppdrag.ts";
import { annonskonton, valtKonto, veckolage } from "../lib/meta-annonser.ts";

// Statusadress för felsökning: visar om nyckeln fungerar, vilket konto som styrs och
// månadens siffror. Ändrar ingenting. Kräver ANNONS_STATUS_SECRET.
function behorig(req: Request): boolean {
  const hemlis = process.env.ANNONS_STATUS_SECRET?.trim();
  const header = req.headers.get("authorization") ?? "";
  if (!hemlis || !header.startsWith("Bearer ")) return false;
  const a = Buffer.from(header.slice(7));
  const b = Buffer.from(hemlis);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default defineChannel({
  routes: [
    GET("/annonser/status", async (req) => {
      if (!behorig(req)) return new Response("unauthorized", { status: 401 });
      try {
        const konton = await annonskonton();
        const konto = await valtKonto().catch((e) => e as Error);
        if (konto instanceof Error) return Response.json({ ok: false, fel: konto.message, konton });
        const [v, inst] = await Promise.all([veckolage(konto), lasInstallningar(blobLagring())]);
        return Response.json({
          ok: true,
          konto,
          takPerOrtOchVeckaKr: inst.krPerOrtOchVecka,
          dagarKvarAvVeckan: v.dagar,
          orter: [...new Set([...v.kostnad.keys(), ...v.lopande.keys()])].map((k) => ({
            ort: v.visa(k),
            kostnadVeckanKr: v.kostnad.get(k) ?? 0,
            lopandeKrPerDag: v.lopande.get(k) ?? 0,
          })),
          kampanjer: v.objekt.filter((o) => o.niva === "kampanj").map((o) => ({ namn: o.namn, status: o.status, dagsbudgetKr: o.dagsbudgetKr })),
          annonsgrupper: v.objekt.filter((o) => o.niva === "annonsgrupp").map((o) => ({ namn: o.namn, ort: o.ort, status: o.status, dagsbudgetKr: o.dagsbudgetKr })),
        });
      } catch (e) {
        return Response.json({ ok: false, fel: e instanceof Error ? e.message : String(e) }, { status: 502 });
      }
    }),
  ],
});
