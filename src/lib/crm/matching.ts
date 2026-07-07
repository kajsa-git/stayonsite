import type { Property, Request } from "./schema";

export type MatchTone = "good" | "warn" | "bad";
export interface MatchChip {
  label: string;
  tone: MatchTone;
}
export interface MatchResult {
  score: number;
  chips: MatchChip[];
}

// Ortjämförelse tål stavningsvarianter ("Mönsterås"/"Monsteras", "västerås"/"Västerås"):
// gemener + å/ä→a, ö→o + övriga diakritiska tecken bort. Samma förenkling som slugify.
function normalizeCityName(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
}

/** true=inom spann, false=utanför, null=okänt/inget spann angivet. */
function inRange(val: number | null, from: number | null | undefined, to: number | null | undefined): boolean | null {
  if (from == null && to == null) return null;
  if (val == null) return null;
  if (from != null && val < from) return false;
  if (to != null && val > to) return false;
  return true;
}

function rangeText(from: number | null | undefined, to: number | null | undefined): string {
  return `${from ?? "?"}–${to ?? "?"}`;
}

/** Full breakdown: numeric score (0–100) + colored criteria chips for the UI. */
export function matchDetails(request: Request, property: Property): MatchResult {
  let score = 0;
  const chips: MatchChip[] = [];

  // Location (highest weight)
  if (request.city && property.city) {
    if (normalizeCityName(request.city) === normalizeCityName(property.city)) {
      score += 35;
      chips.push({ label: "Rätt ort", tone: "good" });
    } else {
      chips.push({ label: `Annan ort (${property.city})`, tone: "bad" });
    }
  }
  if (request.postalCode && property.postalCode) {
    const reqPost = request.postalCode.replace(/\s/g, "");
    const propPost = property.postalCode.replace(/\s/g, "");
    if (reqPost === propPost) {
      score += 15;
      chips.push({ label: "Postnr ✓", tone: "good" });
    } else if (reqPost.slice(0, 3) === propPost.slice(0, 3)) {
      score += 8;
      chips.push({ label: "Postnr i närheten", tone: "warn" });
    }
  }
  if (request.street && property.address && property.address.toLowerCase().includes(request.street.toLowerCase())) {
    score += 10;
    chips.push({ label: "Gata matchar", tone: "good" });
  }

  // Beds vs persons
  if (request.persons) {
    if (property.beds) {
      if (property.beds >= request.persons) {
        score += 30;
        if (property.beds === request.persons || property.beds === request.persons + 1) score += 10;
        chips.push({ label: `${property.beds} bäddar ✓`, tone: "good" });
      } else {
        chips.push({ label: `För få bäddar (${property.beds}/${request.persons})`, tone: "bad" });
      }
    } else {
      chips.push({ label: "Bäddar okänt", tone: "warn" });
    }
  }

  // Sovrum-spann (bedrooms)
  if (request.bedroomsFrom != null || request.bedroomsTo != null) {
    const r = inRange(property.bedrooms, request.bedroomsFrom, request.bedroomsTo);
    if (r === true) { score += 10; chips.push({ label: `${property.bedrooms} sovrum ✓`, tone: "good" }); }
    else if (r === false) chips.push({ label: `${property.bedrooms} sovrum (vill ${rangeText(request.bedroomsFrom, request.bedroomsTo)})`, tone: "bad" });
    else chips.push({ label: "Sovrum okänt", tone: "warn" });
  }

  // Bädd-spann (beds) — endast när personantal INTE angetts. Annars poängsätter
  // "Beds vs persons"-blocket ovan redan samma property.beds och vi skulle dubbelräkna.
  if (!request.persons && (request.bedsFrom != null || request.bedsTo != null)) {
    const r = inRange(property.beds, request.bedsFrom, request.bedsTo);
    if (r === true) { score += 10; chips.push({ label: `${property.beds} bäddar ✓`, tone: "good" }); }
    else if (r === false) chips.push({ label: `${property.beds} bäddar (vill ${rangeText(request.bedsFrom, request.bedsTo)})`, tone: "bad" });
    else chips.push({ label: "Bäddar okänt", tone: "warn" });
  }

  // Availability overlap
  if (request.startDate && property.moveInFrom) {
    const reqStart = new Date(request.startDate);
    const propAvail = new Date(property.moveInFrom);
    if (propAvail <= reqStart) {
      score += 20;
      chips.push({ label: "Ledig i tid", tone: "good" });
    } else {
      chips.push({ label: `Ledig först ${property.moveInFrom}`, tone: "warn" });
    }
  }

  // Property available (not booked)
  if (property.status === "available") {
    score += 10;
  } else if (property.status) {
    chips.push({ label: "Inte ledig", tone: "bad" });
  }

  // Price within budget (rentOut = customer price vs request budgetMax)
  if (request.budgetMax && property.rentOut) {
    if (property.rentOut <= request.budgetMax) {
      score += 10;
      chips.push({ label: "Inom budget", tone: "good" });
    } else {
      const over = (property.rentOut - request.budgetMax) / request.budgetMax;
      score -= Math.min(Math.round(over * 40), 20);
      const diff = property.rentOut - request.budgetMax;
      chips.push({ label: `Över budget (+${diff.toLocaleString("sv-SE")} kr)`, tone: "bad" });
    }
  }

  // Furnished requirement
  if (request.furnishedRequired) {
    if (property.furnished) {
      score += 10;
      chips.push({ label: "Möblerat ✓", tone: "good" });
    } else {
      score -= 15;
      chips.push({ label: "Ej möblerat", tone: "bad" });
    }
  }

  // Garage requirement
  if (request.garageRequired) {
    if (property.garage) {
      score += 5;
      chips.push({ label: "Garage ✓", tone: "good" });
    } else {
      score -= 10;
      chips.push({ label: "Inget garage", tone: "bad" });
    }
  }

  return { score: Math.max(0, Math.min(score, 100)), chips };
}

export function matchScore(request: Request, property: Property): number {
  return matchDetails(request, property).score;
}

/** True if the property's availability window covers the requested period. */
export function availableForRequest(request: Request, property: Property): boolean {
  if (!request.startDate) return true; // inget datumkrav
  const reqStart = new Date(request.startDate);
  const reqEnd = request.endDate ? new Date(request.endDate) : reqStart;
  if (property.moveInFrom && new Date(property.moveInFrom) > reqStart) return false;
  if (property.availableTo && new Date(property.availableTo) < reqEnd) return false;
  return true;
}
