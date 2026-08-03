import { describe, expect, it } from "vitest";
import { bearerAuthorized } from "./bearer-auth";

function reqWithAuth(header?: string): Request {
  return new Request("http://localhost/api/mcp/mcp", {
    headers: header ? { authorization: header } : {},
  });
}

describe("bearerAuthorized", () => {
  it("godkänner rätt token", () => {
    expect(bearerAuthorized(reqWithAuth("Bearer hemlig123"), "hemlig123")).toBe(true);
  });

  it("nekar fel token", () => {
    expect(bearerAuthorized(reqWithAuth("Bearer felfel"), "hemlig123")).toBe(false);
  });

  it("nekar utan Authorization-header", () => {
    expect(bearerAuthorized(reqWithAuth(), "hemlig123")).toBe(false);
  });

  it("nekar när token inte är konfigurerad (fail-closed) — även med korrekt gissning", () => {
    expect(bearerAuthorized(reqWithAuth("Bearer vadsomhelst"), undefined)).toBe(false);
    expect(bearerAuthorized(reqWithAuth("Bearer "), "")).toBe(false);
    expect(bearerAuthorized(reqWithAuth(), undefined)).toBe(false);
  });

  it("Bearer-prefixet är case-okänsligt", () => {
    expect(bearerAuthorized(reqWithAuth("bearer hemlig123"), "hemlig123")).toBe(true);
    expect(bearerAuthorized(reqWithAuth("BEARER hemlig123"), "hemlig123")).toBe(true);
  });

  it("nekar vid längdskillnad (timingSafeEqual kräver lika längd)", () => {
    expect(bearerAuthorized(reqWithAuth("Bearer hemlig1234"), "hemlig123")).toBe(false);
    expect(bearerAuthorized(reqWithAuth("Bearer hemlig12"), "hemlig123")).toBe(false);
  });
});
