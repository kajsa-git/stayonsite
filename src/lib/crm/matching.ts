import type { Property, Request } from "./schema";

export function matchScore(request: Request, property: Property): number {
  let score = 0;

  // City match (highest weight)
  if (
    request.city &&
    property.city &&
    request.city.toLowerCase() === property.city.toLowerCase()
  ) {
    score += 40;
  }

  // Beds vs persons
  if (request.persons && property.beds) {
    if (property.beds >= request.persons) {
      score += 30;
      // Bonus for exact or near-exact fit
      if (property.beds === request.persons || property.beds === request.persons + 1) {
        score += 10;
      }
    }
  }

  // Availability overlap
  if (request.startDate && property.moveInFrom) {
    const reqStart = new Date(request.startDate);
    const propAvail = new Date(property.moveInFrom);
    if (propAvail <= reqStart) {
      score += 20;
    }
  }

  // Property available (not booked)
  if (property.status === "available") {
    score += 10;
  }

  // Price within budget (rentOut = customer price vs request budgetMax)
  if (request.budgetMax && property.rentOut) {
    if (property.rentOut <= request.budgetMax) {
      score += 10;
    } else {
      // Penalty grows with how far over budget, capped at -20
      const over = (property.rentOut - request.budgetMax) / request.budgetMax;
      score -= Math.min(Math.round(over * 40), 20);
    }
  }

  // Furnished requirement
  if (request.furnishedRequired) {
    if (property.furnished) score += 10;
    else score -= 15;
  }

  // Garage requirement
  if (request.garageRequired) {
    if (property.garage) score += 5;
    else score -= 10;
  }

  return Math.max(0, Math.min(score, 100));
}
