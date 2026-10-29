import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addBillingDays, billingMonthBounds, isBillingDate, nextBillingMonth, parseBillingAmount } from "./billing-calendar";
import { billingInvoicePayload, createBillingDraft, getBillingOverview, previewBillingPeriod, reconcileBillingDraft, saveBillingPlan } from "./billing";
import { billingPeriods, billingPlans, companies, integrations, properties, requests, type BillingPlan } from "./schema";
import { createTestDb, type TestDB } from "./test-db";

describe("billing calendar", () => {
  it("föreslår nästa svenska kalendermånad, även vid årsskifte", () => {
    expect(nextBillingMonth(new Date("2026-10-21T12:00:00Z"))).toBe("2026-11");
    expect(nextBillingMonth(new Date("2026-12-31T23:30:00Z"))).toBe("2027-02");
    expect(billingMonthBounds("2028-02")).toEqual({ start: "2028-02-01", end: "2028-02-29" });
    expect(addBillingDays("2026-10-25", 10)).toBe("2026-11-04");
    expect(isBillingDate("2026-02-30")).toBe(false);
  });

  it("räknar pengar i ören och nekar tvetydiga belopp", () => {
    expect(parseBillingAmount("25 000,50")).toBe(2_500_050);
    expect(parseBillingAmount("0,01")).toBe(1);
    expect(parseBillingAmount("-25")).toBeNull();
    expect(parseBillingAmount("1.234")).toBeNull();
    expect(parseBillingAmount("1e6")).toBeNull();
  });
});

describe("monthly billing with Fortnox drafts", () => {
  let db: TestDB;
  let cleanup: () => void;
  let plan: BillingPlan;
  let invoices: Record<string, unknown>[];
  let posts: Record<string, unknown>[];
  let calls: { path: string; method: string }[];
  let failPost: "timeout-before" | "timeout-after" | "rejected" | null;
  let failReadback: boolean;
  const input = {
    companyId: "c1", requestId: "r1", propertyId: "p1", accommodation: "Gatan 1, Boden",
    customerNumber: "77", monthlyAmountMinor: 2_500_000, vatRate: 12 as const, vatIncluded: false,
    startDate: "2026-09-01", endDate: null, firstBillingMonth: "2026-11", paymentTermsDays: 10,
    reference: "PROJ-7", active: true,
  };

  beforeEach(async () => {
    ({ db, cleanup } = await createTestDb("crm-billing"));
    vi.stubEnv("FORTNOX_CLIENT_ID", "test-client");
    vi.stubEnv("FORTNOX_CLIENT_SECRET", "test-secret");
    vi.stubEnv("FORTNOX_INVOICE_ACCOUNT_NUMBER", "3001");
    vi.stubEnv("FORTNOX_INVOICE_ARTICLE_NUMBER", "");
    await db.insert(companies).values({ id: "c1", name: "Bygg AB", orgNr: "559213-7102", customerNumber: "77" });
    await db.insert(properties).values({ id: "p1", address: "Gatan 1", city: "Boden", status: "rented" });
    await db.insert(requests).values({ id: "r1", companyId: "c1", status: "won", wonPropertyId: "p1", startDate: "2026-09-01", endDateOngoing: true, moveInChecklist: ["contract"] });
    await db.insert(integrations).values({ provider: "fortnox", accessToken: "test-access", refreshToken: "test-refresh", expiresAt: new Date(Date.now() + 3_600_000) });
    plan = await saveBillingPlan(input, undefined, db);
    invoices = []; posts = []; calls = []; failPost = null; failReadback = false;
    vi.stubGlobal("fetch", vi.fn(async (value: string | URL, init?: RequestInit) => {
      const url = new URL(value.toString());
      const method = init?.method ?? "GET";
      calls.push({ path: url.pathname, method });
      if (url.pathname === "/3/customers/77") return Response.json({ Customer: { CustomerNumber: "77", Name: "Bygg AB", OrganisationNumber: "5592137102", Active: true } });
      if (url.pathname === "/3/invoices" && method === "GET") return Response.json({ Invoices: invoices.filter((i) => i.ExternalInvoiceReference1 === url.searchParams.get("externalinvoicereference1")), MetaInformation: { "@TotalPages": 1 } });
      if (url.pathname === "/3/invoices" && method === "POST") {
        const payload = JSON.parse(String(init?.body)).Invoice;
        posts.push(payload);
        if (failPost === "rejected") return Response.json({ ErrorInformation: { Message: "Fel konto" } }, { status: 400 });
        if (failPost === "timeout-before") throw new Error("network timeout");
        const invoice = { ...payload, DocumentNumber: String(1001 + invoices.length), Booked: false, Sent: false, Cancelled: false, Total: 28000 };
        invoices.push(invoice);
        if (failPost === "timeout-after") throw new Error("network timeout");
        return Response.json({ Invoice: invoice });
      }
      if (/^\/3\/invoices\/\d+$/.test(url.pathname)) {
        if (failReadback) return Response.json({}, { status: 404 });
        return Response.json({ Invoice: invoices.find((i) => String(i.DocumentNumber) === url.pathname.split("/").at(-1)) });
      }
      throw new Error(`Oväntat externt anrop: ${method} ${url.pathname}`);
    }));
  });

  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); cleanup(); });

  async function review(month = "2026-11", extra: Record<string, unknown> = {}) {
    return previewBillingPeriod({ planId: plan.id, month, invoiceDate: "2026-10-21", ...extra }, "u1", db);
  }
  async function create(month = "2026-11") {
    const preview = await review(month);
    return createBillingDraft({ periodId: preview.periodId, reviewId: preview.reviewId }, "u1", db);
  }

  it("återanvänder priset men fakturerar november och december som två olika perioder", async () => {
    const november = await create("2026-11");
    const december = await create("2026-12");
    expect(posts).toHaveLength(2);
    expect(november.snapshot).toMatchObject({ periodStart: "2026-11-01", periodEnd: "2026-11-30", amountMinor: 2_500_000, totalMinor: 2_800_000, dueDate: "2026-10-31" });
    expect(december.snapshot).toMatchObject({ periodStart: "2026-12-01", periodEnd: "2026-12-31", amountMinor: 2_500_000 });
    expect(november.externalReference).not.toBe(december.externalReference);
    expect(posts[0]).toMatchObject({ NotCompleted: true, VATIncluded: false, CustomerNumber: "77" });
    expect(calls.every((call) => call.method === "GET" || (call.method === "POST" && call.path === "/3/invoices"))).toBe(true);
    const [request] = await db.select().from(requests).where(eq(requests.id, "r1"));
    expect(request.status).toBe("won"); // Utkast är inte skickat/fakturerat.
    expect(request.fortnoxInvoiceNumber).toBeNull();
  });

  it("sparar samma utkast vid upprepat klick och spärrar ny förhandsgranskning", async () => {
    const preview = await review();
    const body = { periodId: preview.periodId, reviewId: preview.reviewId };
    const first = await createBillingDraft(body, "u1", db);
    const again = await createBillingDraft(body, "u1", db);
    expect(again.invoiceNumber).toBe(first.invoiceNumber);
    expect(posts).toHaveLength(1);
    await expect(review()).rejects.toThrow("redan hanterats");
  });

  it("två samtidiga klick kan bara göra ett skapandeanrop", async () => {
    const preview = await review();
    const body = { periodId: preview.periodId, reviewId: preview.reviewId };
    const results = await Promise.allSettled([createBillingDraft(body, "u1", db), createBillingDraft(body, "u1", db)]);
    expect(results.some((r) => r.status === "fulfilled")).toBe(true);
    expect(posts).toHaveLength(1);
  });

  it("återhämtar ett förlorat POST-svar genom läsning utan dubbelfaktura", async () => {
    failPost = "timeout-after";
    const preview = await review();
    const body = { periodId: preview.periodId, reviewId: preview.reviewId };
    await expect(createBillingDraft(body, "u1", db)).rejects.toThrow("kunde inte bekräftas");
    const recovered = await createBillingDraft(body, "u1", db);
    expect(recovered.invoiceNumber).toBe("1001");
    expect(posts).toHaveLength(1);
  });

  it("skapar aldrig igen när ett osäkert anrop inte kan hittas i Fortnox", async () => {
    failPost = "timeout-before";
    const preview = await review();
    const body = { periodId: preview.periodId, reviewId: preview.reviewId };
    await expect(createBillingDraft(body, "u1", db)).rejects.toThrow();
    await expect(createBillingDraft(body, "u1", db)).rejects.toThrow("Ingen faktura");
    await expect(review()).rejects.toThrow("redan hanterats");
    expect(posts).toHaveLength(1);
    const [period] = await db.select().from(billingPeriods);
    expect(period.status).toBe("uncertain");
  });

  it("ett 404 vid återläsning efter POST ger osäker status, aldrig fritt återförsök", async () => {
    failReadback = true;
    await expect(create()).rejects.toThrow("kunde inte bekräftas");
    await expect(review()).rejects.toThrow("redan hanterats");
    const [period] = await db.select().from(billingPeriods);
    expect(period.status).toBe("uncertain");
    failReadback = false;
    await reconcileBillingDraft(period.id, db);
    expect(posts).toHaveLength(1);
  });

  it("ett uttryckligt avvisat POST får provas igen efter ny granskning", async () => {
    failPost = "rejected";
    await expect(create()).rejects.toThrow();
    failPost = null;
    const saved = await create();
    expect(saved.invoiceNumber).toBe("1001");
    expect(invoices).toHaveLength(1);
    expect(posts).toHaveLength(2);
  });

  it("en orelaterad fakturaträff får inte tas som bevis på skapad faktura", async () => {
    const originalFetch = fetch;
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url).includes("/invoices?")) return Response.json({ Invoices: [{ DocumentNumber: "999", ExternalInvoiceReference1: "annan-bokning", CustomerNumber: "77" }] });
      return originalFetch(url, init);
    }));
    expect((await create()).invoiceNumber).toBe("1001");
    expect(posts).toHaveLength(1);
  });

  it("prisändring efter granskning kräver ett nytt underlag", async () => {
    const preview = await review();
    await saveBillingPlan({ ...input, version: plan.version, monthlyAmountMinor: 3_000_000 }, plan.id, db);
    await expect(createBillingDraft({ periodId: preview.periodId, reviewId: preview.reviewId }, "u1", db)).rejects.toThrow("ändrats");
    expect(posts).toHaveLength(0);
  });

  it("ett ersatt underlag eller en annan användare får inte skapa faktura", async () => {
    const old = await review();
    const fresh = await review("2026-11", { invoiceDate: "2026-10-22" });
    await expect(createBillingDraft({ periodId: old.periodId, reviewId: old.reviewId }, "u1", db)).rejects.toThrow("ändrats");
    await expect(createBillingDraft({ periodId: fresh.periodId, reviewId: fresh.reviewId }, "u2", db)).rejects.toThrow("någon annan");
    expect(posts).toHaveLength(0);
  });

  it("samtidiga identiska granskningar behåller samma giltiga underlag", async () => {
    const [first, second] = await Promise.all([review(), review()]);
    expect(first.periodId).toBe(second.periodId);
    expect(first.reviewId).toBe(second.reviewId);
    await createBillingDraft({ periodId: first.periodId, reviewId: first.reviewId }, "u1", db);
    expect(posts).toHaveLength(1);
  });

  it("ett ofullständigt söksvar får inte tolkas som att inga fakturor finns", async () => {
    const originalFetch = fetch;
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url).includes("/invoices?")) return Response.json({});
      return originalFetch(url, init);
    }));
    await expect(create()).rejects.toThrow("oväntat svar");
    expect(posts).toHaveLength(0);
  });

  it("en utgången granskning får inte skapa ett utkast", async () => {
    const preview = await review();
    await db.update(billingPeriods).set({ reviewExpiresAt: "2000-01-01T00:00:00.000Z" }).where(eq(billingPeriods.id, preview.periodId));
    await expect(createBillingDraft({ periodId: preview.periodId, reviewId: preview.reviewId }, "u1", db)).rejects.toThrow("gått ut");
    expect(posts).toHaveLength(0);
  });

  it("skillnad mellan Fortnoxsumma och underlag visas utan en ny faktura", async () => {
    const originalFetch = fetch;
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL, init?: RequestInit) => {
      const response = await originalFetch(url, init);
      if (/\/invoices\/\d+$/.test(String(url))) {
        const data = await response.json();
        data.Invoice.Total = 28001;
        return Response.json(data);
      }
      return response;
    }));
    const saved = await create();
    expect(saved.invoiceTotalMinor).toBe(2_800_100);
    expect(saved.lastError).toContain("avviker");
    expect(saved.status).toBe("draft");
    expect(posts).toHaveLength(1);
  });

  it("fel organisationsnummer i Fortnox spärrar skapandet", async () => {
    const originalFetch = fetch;
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL, init?: RequestInit) => {
      if (String(url).endsWith("/customers/77")) return Response.json({ Customer: { CustomerNumber: "77", Name: "Fel kund AB", OrganisationNumber: "5569990000" } });
      return originalFetch(url, init);
    }));
    const preview = await review();
    expect(preview.blockers.join(" ")).toContain("Organisationsnumret");
    expect(preview.reviewId).toBeNull();
    expect(posts).toHaveLength(0);
  });

  it("delmånad behöver ett uttryckligt belopp och moms inkluderas korrekt", async () => {
    await saveBillingPlan({ ...input, startDate: "2026-11-15", vatIncluded: true, version: plan.version }, plan.id, db);
    const blocked = await review();
    expect(blocked.blockers).toContain("Delmånad: ange och granska beloppet för just den här perioden.");
    expect(blocked.reviewId).toBeNull();
    const preview = await review("2026-11", { amountMinor: 1_400_000 });
    expect(preview.snapshot).toMatchObject({ partialMonth: true, periodStart: "2026-11-15", periodEnd: "2026-11-30", netMinor: 1_250_000, vatMinor: 150_000, totalMinor: 1_400_000 });
    expect(billingInvoicePayload(preview.snapshot).Invoice).toMatchObject({ VATIncluded: true, InvoiceRows: [{ Price: 14000, VAT: 12 }] });
  });

  it("tidigare fakturerade månader, pausade och avslutade uthyrningar spärras", async () => {
    await expect(review("2026-10")).rejects.toThrow("före den första");
    await saveBillingPlan({ ...input, active: false, version: plan.version }, plan.id, db);
    await expect(review()).rejects.toThrow("pausad");
    await db.update(billingPlans).set({ active: true, endDate: "2026-11-30" }).where(eq(billingPlans.id, plan.id));
    await expect(review("2026-12")).rejects.toThrow("utanför hyresperioden");
    expect(posts).toHaveLength(0);
  });

  it("en bokning utan signerat avtal får inget fakturautkast", async () => {
    await db.update(requests).set({ moveInChecklist: [] }).where(eq(requests.id, "r1"));
    await expect(review()).rejects.toThrow("signerat avtal");
    expect(posts).toHaveLength(0);
  });

  it("saknad Fortnoxkoppling tillåter lokal granskning men inget skapande", async () => {
    await db.delete(integrations);
    const preview = await review();
    expect(preview.snapshot.amountMinor).toBe(2_500_000);
    expect(preview.blockers.join(" ")).toContain("Koppla Fortnox");
    expect(preview.periodId).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it("dubbel fakturaplan för samma bokning nekas och historiken skyddas", async () => {
    await expect(saveBillingPlan(input, undefined, db)).rejects.toThrow("redan en fakturaplan");
    const created = await create();
    await expect(saveBillingPlan({ ...input, firstBillingMonth: "2026-12", version: plan.version }, plan.id, db)).rejects.toThrow("kan inte ändras");
    await saveBillingPlan({ ...input, monthlyAmountMinor: 3_000_000, version: plan.version }, plan.id, db);
    const [period] = await db.select().from(billingPeriods).where(eq(billingPeriods.id, created.id));
    expect(period.snapshot.amountMinor).toBe(2_500_000);
    const overview = await getBillingOverview(db);
    expect(overview.candidates).toHaveLength(0);
    expect(overview.periods[0].invoiceNumber).toBe("1001");
  });
});
