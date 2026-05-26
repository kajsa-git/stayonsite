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

/** Full breakdown: numeric score (0–100) + colored criteria chips for the UI. */
export function matchDetails(request: Request, property: Property): MatchResult {
  let score = 0;
  const chips: MatchChip[] = [];

  // Location (highest weight)
  if (request.city && property.city) {
    if (request.city.toLowerCase() === property.city.toLowerCase()) {
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

  // Requested number of units/homes.
  if (request.accommodationFrom && request.accommodationTo) {
    score += 5;
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
