import type { Request } from "./schema";

type RequestSearchAreaFields = Pick<Request, "city" | "postalCode" | "addressQuery">;

function normalize(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || null;
}

export function formatRequestSearchAreas(request: RequestSearchAreaFields): string | null {
  const parts = [request.city, request.postalCode, request.addressQuery]
    .map(normalize)
    .filter((value): value is string => !!value);

  const seen = new Set<string>();
  const unique = parts.filter((value) => {
    const key = value.toLocaleLowerCase("sv-SE");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.length ? unique.join(" · ") : null;
}
