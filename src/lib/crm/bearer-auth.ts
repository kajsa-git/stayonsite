import { timingSafeEqual } from "node:crypto";

// Statisk bearer-token-jämförelse för headless klienter (Mac-agenten, MCP-servern).
// Fail-closed: är token inte konfigurerad i miljön är endpointen avstängd.
export function bearerAuthorized(req: Request, expected: string | undefined): boolean {
  if (!expected) return false;
  const got = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
