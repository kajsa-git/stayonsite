import { defineSchedule } from "eve/schedules";
import telegram from "../channels/telegram.ts";
import { lasInstallningar, lasVakt, sparaVakt, type Vakt } from "../lib/annons-installningar.ts";
import { kajsasChatId } from "../lib/config.ts";
import { blobLagring } from "../lib/facebook-uppdrag.ts";
import { aktivaPerOrt, sattStatus, vaktBeslut, valtKonto, vecka, veckolage } from "../lib/meta-annonser.ts";
import { skickaTillKajsa } from "../lib/telegram-api.ts";

// Varje timme, utan modell: läser veckans kostnad per ort och pausar en orts annonser när
// orten når taket per ort och vecka. Varnar vid 90 %. Kan den inte läsa kostnaden säger
// den till en gång per dag (dagtid), så att taket aldrig står obevakat i tysthet. En ny vecka
// lämnar den det som pausades förra veckan till agenten, som frågar Kajsa om de ska igång.
type Skicka = (text: string) => Promise<unknown>;

async function vakta(tillAgenten: Skicka) {
  if (!process.env.META_ADS_TOKEN) return;
  const lagring = blobLagring();
  const { krPerOrtOchVecka } = await lasInstallningar(lagring);
  const nu = vecka();
  const sparad = await lasVakt(lagring);
  let lage: Vakt = sparad?.vecka === nu ? sparad : { vecka: nu, varnade: [], pausade: [], felDatum: sparad?.felDatum };
  const forraVeckan = sparad && sparad.vecka !== nu ? sparad.pausade : [];
  try {
    const konto = await valtKonto();
    const v = await veckolage(konto);
    const beslut = vaktBeslut({ takKr: krPerOrtOchVecka, kostnadPerOrt: v.kostnad, aktivaPerOrt: aktivaPerOrt(v.objekt), visaOrt: v.visa, lage });
    for (const g of beslut.pausa) await sattStatus(g.id, "PAUSED");
    lage = { ...lage, ...beslut.lage };
    await sparaVakt(lagring, lage);
    if (beslut.meddelande) await skickaTillKajsa({ text: beslut.meddelande });
    if (forraVeckan.length) {
      await tillAgenten(
        "[Från annonsvakten] Ny vecka. Förra veckan pausade vakten de här annonsuppsättningarna när orten nådde taket: " +
          forraVeckan.map((g) => `${g.namn} (${v.visa(g.ort)}, id ${g.id})`).join("; ") +
          ". Fråga Kajsa kort med fraga_kajsa om de ska startas igen (knappar: \"Starta dem igen\", \"Låt dem vara\"). Följ färdigheten annonser.",
      );
    }
  } catch (e) {
    const fel = e instanceof Error ? e.message : String(e);
    console.error("kajsas-agent: annonsvakten", fel);
    // En gång per svensk dag, och bara dagtid: Kajsa ska inte väckas av ett fel på natten.
    const klockan = new Date();
    const idag = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(klockan);
    const timme = Number(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", hour: "2-digit", hour12: false }).format(klockan));
    if (lage.felDatum !== idag && timme >= 8 && timme < 20) {
      await sparaVakt(lagring, { ...lage, felDatum: idag });
      await skickaTillKajsa({ text: `Annonsvakten kan inte läsa annonsernas kostnad just nu, så taket per ort bevakas inte. (${fel.slice(0, 120)})` }).catch(() => {});
    }
  }
}

export default defineSchedule({
  cron: "7 * * * *",
  timezone: "Europe/Stockholm",
  async run({ to, waitUntil, appAuth }) {
    waitUntil(
      vakta((text) =>
        to(telegram, { chatId: kajsasChatId() }).send(text, { auth: appAuth, idempotencyKey: `annonsvakt:${vecka()}` }),
      ),
    );
  },
});
