import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildInvoicePeriods, createFortnoxInvoiceDraftPatch, normalizeOrgNr } from "./fortnox";
import { companies, integrations, matches, properties, requests } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

describe("Fortnox invoice helpers", () => {
  it("delar en tidsbestämd period per kalendermånad", () => {
    expect(buildInvoicePeriods("2026-07-15", "2026-09-03")).toEqual([
      { start: "2026-07-15", end: "2026-07-31" },
      { start: "2026-08-01", end: "2026-08-31" },
      { start: "2026-09-01", end: "2026-09-03" },
    ]);
  });

  it("skapar första månadsperioden för löpande uppdrag", () => {
    expect(buildInvoicePeriods("2026-02-10", null, true)).toEqual([
      { start: "2026-02-10", end: "2026-02-28", ongoing: true },
    ]);
  });

  it("normaliserar organisationsnummer för matchning", () => {
    expect(normalizeOrgNr("559213-7102")).toBe("5592137102");
  });
});

describe("createFortnoxInvoiceDraftPatch", () => {
  let db: TestDB;
  let cleanup: () => void;
  let invoicePayloads: unknown[];

  beforeEach(async () => {
    ({ db, cleanup } = await createTestDb("crm-fortnox"));
    invoicePayloads = [];
    await db.insert(integrations).values({
      provider: "fortnox",
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      if (url.includes("/invoices?externalinvoicereference1=")) {
        return new Response(JSON.stringify({ Invoices: [] }), { status: 200 });
      }
      if (url.endsWith("/invoices") && init?.method === "POST") {
        invoicePayloads.push(JSON.parse(String(init.body)));
        return new Response(JSON.stringify({ Invoice: { DocumentNumber: "1001" } }), { status: 200 });
      }
      throw new Error(`Unexpected Fortnox call: ${url}`);
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  it("skapar rader från accepterad matchs stämplade datum och offerRentOut", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme Bygg", customerNumber: "77" });
    await db.insert(properties).values({ id: "p1", address: "Gatan 1", city: "Boden" });
    await db.insert(requests).values({
      id: "r1",
      companyId: "c1",
      status: "won",
      city: "Boden",
      startDate: "2026-07-01",
      endDate: "2026-09-30",
      monthlyValue: 12000,
      billingProjectId: "PROJ-9",
      wonPropertyId: "p1",
    });
    await db.insert(matches).values({
      id: "m1",
      requestId: "r1",
      propertyId: "p1",
      status: "accepted",
      offerRentOut: 26000,
      offerStartDate: "2026-08-10",
      offerEndDate: "2026-09-05",
      offerOngoing: false,
    });

    const [request] = await db.select().from(requests).where(eq(requests.id, "r1"));
    const patch = await createFortnoxInvoiceDraftPatch("r1", request, { db });

    expect(patch.fortnoxInvoiceNumber).toBe("1001");
    expect(invoicePayloads).toHaveLength(1);
    const invoice = invoicePayloads[0] as {
      Invoice: {
        YourReference: string;
        InvoiceRows: { Description: string; Price: number }[];
      };
    };
    expect(invoice.Invoice.YourReference).toBe("PROJ-9");
    expect(invoice.Invoice.InvoiceRows.map((row) => ({ Description: row.Description, Price: row.Price }))).toEqual([
      { Description: "Projektboende Boden, 2026-08-10 - 2026-08-31", Price: 26000 },
      { Description: "Projektboende Boden, 2026-09-01 - 2026-09-05", Price: 26000 },
    ]);
  });
});
