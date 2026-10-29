// Kalenderdatum är datumsträngar, aldrig användarens/servrarnas lokala midnatt.
export function isBillingDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isBillingMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && isBillingDate(`${value}-01`);
}

export function billingToday(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

export function followingBillingMonth(month: string): string {
  if (!isBillingMonth(month)) throw new Error("Ogiltig faktureringsmånad.");
  const [year, part] = month.split("-").map(Number);
  return `${part === 12 ? year + 1 : year}-${String(part === 12 ? 1 : part + 1).padStart(2, "0")}`;
}

export function nextBillingMonth(now = new Date()): string {
  return followingBillingMonth(billingToday(now).slice(0, 7));
}

export function billingMonthBounds(month: string) {
  if (!isBillingMonth(month)) throw new Error("Ogiltig faktureringsmånad.");
  const lastDay = new Date(`${followingBillingMonth(month)}-01T12:00:00Z`);
  lastDay.setUTCDate(0);
  return { start: `${month}-01`, end: lastDay.toISOString().slice(0, 10) };
}

export function addBillingDays(date: string, days: number): string {
  if (!isBillingDate(date)) throw new Error("Ogiltigt fakturadatum.");
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export function billingMonthLabel(month: string): string {
  return new Intl.DateTimeFormat("sv-SE", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${month}-01T12:00:00Z`));
}

export function parseBillingAmount(value: string): number | null {
  const normalized = value.replace(/[\s\u00a0]/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const minor = Math.round(Number(normalized) * 100);
  return Number.isSafeInteger(minor) && minor > 0 && minor <= 100_000_000_00 ? minor : null;
}
