// Kalenderdatum i svensk tid (Europe/Stockholm) som "YYYY-MM-DD".
//
// new Date().toISOString() ger UTC-datumet. Sverige är UTC+1/+2, så mellan midnatt
// och 01/02 lokal tid pekar UTC-datumet på *gårdagen* — en återkomst som förfaller
// "idag" flaggades då felaktigt som försenad, och server-filtret lte(followUpDate, today)
// tappade dagens poster. Använd detta överallt en kalenderdag jämförs mot ett datumfält.
const TZ = "Europe/Stockholm";

// en-CA formaterar som YYYY-MM-DD, vilket matchar hur datum lagras i databasen.
export function todayStockholm(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

// Ett YYYY-MM-DD-datum + n dagar. Räknas på en UTC-midnatt av datumet så att
// själva additionen är DST-/tidszonsoberoende.
export function addDaysYmd(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  base.setUTCDate(base.getUTCDate() + n);
  return base.toISOString().slice(0, 10);
}

// Dagens svenska datum + n dagar.
export function plusDaysStockholm(n: number): string {
  return addDaysYmd(todayStockholm(), n);
}
