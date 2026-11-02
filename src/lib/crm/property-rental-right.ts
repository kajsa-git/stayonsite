export type PropertyRentalRight = "ager" | "andrahand";

// Äldre HUS-intag lagrade det uttryckliga valet i den särskilda anteckningen.
// Ett sparat värde, även "okand", går alltid före den gamla anteckningen.
export function propertyRentalRight(value: string | null | undefined, specialNote: string | null | undefined): PropertyRentalRight | null {
  if (value === "ager" || value === "andrahand") return value;
  if (value != null) return null;
  const lines = (specialNote ?? "").split(/\r?\n/);
  if (lines.includes("Uthyrarens uppgift: Hyr ut i andra hand med godkännande från fastighetsägaren eller bostadsrättsföreningen.")) return "andrahand";
  if (lines.some((line) => /^Uthyrarens uppgift: (?:Privatpersonen|Företaget) äger bostaden\.$/.test(line))) return "ager";
  return null;
}

export function propertyRentalRightLabel(value: PropertyRentalRight | null): string | null {
  return value === "andrahand" ? "Andrahandsuthyrning" : value === "ager" ? "Äger bostaden" : null;
}
