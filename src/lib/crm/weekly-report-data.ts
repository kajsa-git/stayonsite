import { addDaysYmd } from "./date";

export const REPORT_TIME_ZONE = "Europe/Stockholm";
export const REPORT_WEEK_COUNT = 12;
export const UNKNOWN_AREA_ID = "unknown";

export type ReportKind = "properties" | "requests" | "landlordLeads";
export type ReportCounts = Record<ReportKind, number>;

export interface ReportWeek extends ReportCounts {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ReportArea {
  id: string;
  name: string;
  weeks: ReportCounts[];
  totals: ReportCounts;
}

export interface ReportRecord {
  id: string;
  kind: ReportKind;
  weekId: string;
  registeredDate: string;
  areaIds: string[];
  areaNames: string[];
  title: string;
  href: string;
}

export interface WeeklyReport {
  generatedAt: string;
  timeZone: string;
  weeks: ReportWeek[];
  areas: ReportArea[];
  totals: ReportCounts;
  records: ReportRecord[];
  multiAreaRequests: number;
}

export interface PropertyReportInput {
  id: string;
  createdAt: string | null;
  city: string | null;
  address: string | null;
  ownerName?: string | null;
}

export interface RequestReportInput {
  id: string;
  createdAt: string | null;
  city: string | null;
  requestNumber: number | null;
  companyName: string | null;
}

const emptyCounts = (): ReportCounts => ({ properties: 0, requests: 0, landlordLeads: 0 });
const dateFormatter = new Intl.DateTimeFormat("en-CA", { timeZone: REPORT_TIME_ZONE });

function areaKey(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sv-SE").trim();
}

// Canonical spelling for common cities; other locations remain separate places.
// In particular, boroughs such as Hisingen and Kista are not silently moved into a city.
const cityNames = [
  "Angered", "Boden", "Borås", "Eskilstuna", "Eksjö", "Falun", "Gävle", "Göteborg",
  "Halmstad", "Haparanda", "Helsingborg", "Hässelby", "Jönköping", "Järvsö", "Kiruna",
  "Linköping", "Ludvika", "Luleå", "Lund", "Malmö", "Märsta", "Mönsterås", "Norrköping",
  "Nyköping", "Oskarshamn", "Skellefteå", "Stockholm", "Säffle", "Umeå", "Uppsala",
  "Västerås", "Växjö", "Örebro", "Örnsköldsvik", "Östersund", "Övertorneå",
];
const canonicalCities = new Map(cityNames.map((name) => [areaKey(name), name]));
canonicalCities.set("ovik", "Örnsköldsvik");
canonicalCities.set("gothenburg", "Göteborg");
canonicalCities.set("goreborg", "Göteborg");
canonicalCities.set("malmoe", "Malmö");

export function normalizeReportAreas(value: string | null): { id: string; name: string }[] {
  const cleaned = (value ?? "")
    .replace(/\r?\n/g, ";")
    .replace(/\s+/g, " ")
    .trim()
    // A county suffix describes the preceding place, rather than a second city.
    .replace(/,\s*[^,;/|]*\blän\s*$/iu, "")
    .replace(/(?:\s*[,/]\s*|\s+)(?:near\s*by|nearby|med omnejd|och omnejd|area|centralt)\s*$/iu, "");
  if (/^(?:-|—|okänd|okänt|unknown|n\/a|saknas)$/iu.test(cleaned)) {
    return [{ id: UNKNOWN_AREA_ID, name: "Saknar område" }];
  }
  const unique = new Map<string, { id: string; name: string }>();
  for (const part of cleaned.split(/[,;/|]|\s+(?:och|eller|&)\s+/iu)) {
    const raw = part.trim();
    const key = areaKey(raw);
    if (!key || /^(?:-|—|okand|okant|unknown|n\/a|saknas)$/.test(key)) continue;
    const name = canonicalCities.get(key) ?? raw.toLocaleLowerCase("sv-SE")
      .replace(/(^|[\s-])(\p{L})/gu, (_, separator: string, letter: string) => separator + letter.toLocaleUpperCase("sv-SE"))
      .replace(/\bLän$/u, "län");
    // Use the canonical key too, so aliases and repeats in one request count once.
    const id = `area:${areaKey(name)}`;
    unique.set(id, { id, name });
  }
  return unique.size ? [...unique.values()] : [{ id: UNKNOWN_AREA_ID, name: "Saknar område" }];
}

export function registeredDayStockholm(value: string | null): string | null {
  if (!value) return null;
  const raw = value.trim();
  const datePart = raw.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}(?:$|[ T])/.test(raw)) return null;
  const calendarDate = new Date(`${datePart}T12:00:00Z`);
  if (!Number.isFinite(+calendarDate) || calendarDate.toISOString().slice(0, 10) !== datePart) return null;
  if (raw.length === 10) return datePart;
  // SQLite datetime('now') is UTC even though it has no timezone suffix.
  let timestamp = raw.replace(" ", "T");
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/iu.test(timestamp)) timestamp += "Z";
  const date = new Date(timestamp);
  return Number.isFinite(+date) ? dateFormatter.format(date) : null;
}

function mondayOf(day: string): string {
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  return addDaysYmd(day, -((weekday + 6) % 7));
}

export function reportWeeks(now: Date, includeCurrent = true): ReportWeek[] {
  const currentMonday = mondayOf(dateFormatter.format(now));
  const lastMonday = includeCurrent ? currentMonday : addDaysYmd(currentMonday, -7);
  return Array.from({ length: REPORT_WEEK_COUNT }, (_, index) => {
    const startDate = addDaysYmd(lastMonday, (index - REPORT_WEEK_COUNT + 1) * 7);
    // ISO week-year belongs to Thursday; week 1 is the week containing Jan 4.
    const thursday = addDaysYmd(startDate, 3);
    const year = Number(thursday.slice(0, 4));
    const firstMonday = mondayOf(`${year}-01-04`);
    const weekNumber = Math.round((Date.parse(startDate) - Date.parse(firstMonday)) / 604800000) + 1;
    return { id: startDate, startDate, endDate: addDaysYmd(startDate, 6), weekNumber, year,
      isCurrent: startDate === currentMonday, ...emptyCounts() };
  });
}

export function buildWeeklyReport(input: {
  properties: PropertyReportInput[];
  requests: RequestReportInput[];
  now: Date;
  includeCurrent?: boolean;
}): WeeklyReport {
  const weeks = reportWeeks(input.now, input.includeCurrent);
  const weekIndexes = new Map(weeks.map((week, index) => [week.id, index]));
  const areas = new Map<string, ReportArea>();
  const records: ReportRecord[] = [];
  const seen = new Set<string>();
  const totals = emptyCounts();
  let multiAreaRequests = 0;

  function add(row: PropertyReportInput | RequestReportInput, kind: ReportKind, title: string, href: string) {
    const date = registeredDayStockholm(row.createdAt);
    if (!date) return;
    // Do not accept future-dated registrations, including later on the current day.
    let timestamp = row.createdAt!.trim().replace(" ", "T");
    if (timestamp.length > 10 && !/(?:Z|[+-]\d{2}:?\d{2})$/iu.test(timestamp)) timestamp += "Z";
    if (Date.parse(timestamp) > +input.now) return;
    const weekId = mondayOf(date);
    const index = weekIndexes.get(weekId);
    const recordKey = `${kind}:${row.id}`;
    if (index === undefined || seen.has(recordKey)) return;
    seen.add(recordKey);
    const places = normalizeReportAreas(row.city);
    weeks[index][kind]++;
    totals[kind]++;
    if (kind === "requests" && places.length > 1) multiAreaRequests++;
    for (const place of places) {
      let area = areas.get(place.id);
      if (!area) {
        area = { ...place, weeks: weeks.map(emptyCounts), totals: emptyCounts() };
        areas.set(place.id, area);
      }
      area.weeks[index][kind]++;
      area.totals[kind]++;
    }
    records.push({ id: row.id, kind, weekId, registeredDate: date, areaIds: places.map((p) => p.id),
      areaNames: places.map((p) => p.name), title, href });
  }

  for (const property of input.properties) {
    const address = property.address?.trim();
    add(property, address ? "properties" : "landlordLeads", address || property.ownerName || "Uthyrarintresse utan adress",
      `/crm/properties?id=${encodeURIComponent(property.id)}`);
  }
  for (const request of input.requests) {
    const number = request.requestNumber == null ? "Förfrågan" : `#${request.requestNumber}`;
    add(request, "requests", `${number} · ${request.companyName || "Företag saknas"}`,
      `/crm/matching/${encodeURIComponent(request.id)}`);
  }

  records.sort((a, b) => b.registeredDate.localeCompare(a.registeredDate) || a.title.localeCompare(b.title, "sv"));
  return { generatedAt: input.now.toISOString(), timeZone: REPORT_TIME_ZONE, weeks,
    areas: [...areas.values()].sort((a, b) => a.name.localeCompare(b.name, "sv")),
    totals, records, multiAreaRequests };
}
