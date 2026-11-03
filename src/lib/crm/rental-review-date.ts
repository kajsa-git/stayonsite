export function validYmd(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

// Kalendermånader, med månadens sista dag som tak, inte ett fast antal dagar.
export function addMonthsYmd(ymd: string, months: number): string {
  if (!validYmd(ymd)) throw new Error("Ogiltigt datum");
  const [year, month, day] = ymd.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(day, last));
  return first.toISOString().slice(0, 10);
}

export function isRentalReviewDue(p: { status: string | null; rentalReviewCheckOn?: string | null }, today: string): boolean {
  return p.status === "rented" && validYmd(p.rentalReviewCheckOn) && p.rentalReviewCheckOn <= today;
}
