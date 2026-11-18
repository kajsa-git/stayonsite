import { defineSchedule } from "eve/schedules";
import { borLarma, lasKontakt, sparaKontakt, tidSverige } from "../lib/datorkontakt.ts";
import { blobLagring } from "../lib/facebook-uppdrag.ts";
import { skickaTillKajsa } from "../lib/telegram-api.ts";

// Varje timme: har Facebook-datorn inte hört av sig på tre timmar dagtid säger agenten
// till en gång. Datorn hör av sig var tredje minut 08-21 när den är igång.
export default defineSchedule({
  cron: "37 * * * *",
  timezone: "Europe/Stockholm",
  async run({ waitUntil }) {
    waitUntil(
      (async () => {
        const l = blobLagring();
        const k = await lasKontakt(l);
        if (!k || !borLarma(k)) return;
        await sparaKontakt(l, { ...k, larmat: true });
        await skickaTillKajsa({
          text:
            `Facebook-datorn har inte hört av sig sedan ${tidSverige(k.senast)}. ` +
            "Är datorn avstängd eller stängd är det lugnt. Är den igång: säg till David.",
        });
      })().catch((e) => console.error("kajsas-agent: datorvakten", e instanceof Error ? e.message : e)),
    );
  },
});
