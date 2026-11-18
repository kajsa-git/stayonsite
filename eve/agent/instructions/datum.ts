import { defineDynamic, defineInstructions } from "eve/instructions";

// Dagens datum i Sverige. Som användarinstruktion läggs den bara till när datumet
// ändras, så den fasta prompten är densamma hela tiden och kan återanvändas.
export default defineDynamic((ctx) => {
  const idag = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(ctx.now);
  return defineInstructions({ role: "user", content: `Dagens datum: ${idag}.` });
});
