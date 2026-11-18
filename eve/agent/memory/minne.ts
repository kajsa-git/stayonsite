import { defineMemory } from "eve/memory";
import { fileMemory } from "eve/memory/file";
import { kajsasTelegramIds } from "../lib/config.ts";

// Ett gemensamt minne för Kajsa: hennes preferenser och arbetssätt, sparat i en privat
// Vercel Blob-butik. Samma minne gäller när hon skriver själv och när CRM:et eller Facebook-
// datorn startar en tur. Alla andra får inget minne alls.
export default defineMemory({
  description:
    "Kom ihåg Kajsas preferenser och arbetssätt som gäller framåt: hur uthyrare ska kontakta henne i " +
    "Facebook-inlägg, grupper hon vill hoppa över, orter och kunder hon prioriterar, hur hon vill ha " +
    "sammanfattningar. Spara inte enskilda förfrågningar, priser eller kontaktuppgifter; de finns i CRM:et.",
  provider: fileMemory({ maxCharacters: 6_000 }),
  scope(ctx) {
    const caller = ctx.session.auth.current;
    if (!caller) return null;
    if (caller.authenticator === "crm" && caller.principalId === "stayonsite-crm") return "kajsa";
    // Facebook-datorn: agenten behöver Kajsas sparade svar och preferenser när den skriver förslag.
    if (caller.authenticator === "mac" && caller.principalId === "kajsas-mac") return "kajsa";
    // Scheman (annonsvakten) kör som appen och behöver också Kajsas preferenser.
    if (caller.authenticator === "app" && caller.principalId === "eve:app") return "kajsa";
    const telegramId = caller.principalId?.startsWith("telegram:") ? caller.principalId.slice(9) : null;
    return telegramId && kajsasTelegramIds().has(telegramId) ? "kajsa" : null;
  },
});
