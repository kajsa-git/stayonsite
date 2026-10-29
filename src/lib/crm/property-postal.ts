export const PROPERTY_POSTAL_REQUIRED_ERROR = "Postnummer krävs för alla objekt.";

export function hasPropertyPostalCode(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
