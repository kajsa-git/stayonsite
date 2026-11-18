// Svarsknappar i Telegram (reply keyboard). Ett tryck skickar knappens text som ett vanligt
// meddelande från Kajsa, så det blir en del av samtalet precis som om hon hade skrivit det.
// Hon kan alltid skriva något annat i stället.

export const MAX_KNAPPAR = 4;
export const MAX_KNAPPTEXT = 40;

export function svarsknappar(knappar: string[]) {
  const rena = [...new Set(knappar.map((k) => k.replace(/\s+/g, " ").trim()).filter(Boolean))];
  if (rena.length < 1) throw new Error("Minst en knapp behövs.");
  if (rena.length > MAX_KNAPPAR) throw new Error(`Högst ${MAX_KNAPPAR} knappar.`);
  const forLang = rena.find((k) => k.length > MAX_KNAPPTEXT);
  if (forLang) throw new Error(`Knapptexten är för lång (högst ${MAX_KNAPPTEXT} tecken): ${forLang}`);
  return {
    keyboard: rena.map((text) => [{ text }]),
    one_time_keyboard: true,
    resize_keyboard: true,
    input_field_placeholder: "Tryck på ett svar eller skriv själv",
  };
}
