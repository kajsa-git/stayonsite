import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { z } from "zod";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { billingPeriods, billingPlans, companies, matches, properties, requests, type BillingPeriod, type BillingPlan } from "./schema";
import { addBillingDays, billingMonthBounds, isBillingDate, isBillingMonth, nextBillingMonth } from "./billing-calendar";
import type { BillingPreview, BillingSnapshot } from "./billing-types";
import { FortnoxApiError, FortnoxSetupError, fortnoxInvoiceUrl, fortnoxRequest, getFortnoxConnectionStatus, normalizeOrgNr } from "./fortnox";
import { hasSignedMoveInContract } from "./move-checklists";

type DB = LibSQLDatabase<typeof schema>;

export class BillingError extends Error {
  constructor(message: string, public status = 400) { super(message); this.name = "BillingError"; }
}

const date = z.string().refine(isBillingDate, "Ange ett giltigt datum.");
const month = z.string().refine(isBillingMonth, "Ange en giltig månad.");
const amount = z.number().int().positive().max(100_000_000_00);

export const billingPlanInput = z.object({
  companyId: z.string().min(1),
  requestId: z.string().min(1).nullable().default(null),
  propertyId: z.string().min(1).nullable().default(null),
  accommodation: z.string().trim().min(1, "Ange boende/adress.").max(150),
  customerNumber: z.string().trim().min(1, "Ange kundnummer i Fortnox.").max(30),
  monthlyAmountMinor: amount,
  vatRate: z.union([z.literal(0), z.literal(6), z.literal(12), z.literal(25)]),
  vatIncluded: z.boolean(),
  startDate: date,
  endDate: date.nullable(),
  firstBillingMonth: month,
  paymentTermsDays: z.number().int().min(0).max(365),
  reference: z.string().trim().max(100).default(""),
  active: z.boolean().default(true),
  version: z.number().int().positive().optional(),
}).strict().superRefine((v, ctx) => {
  if (v.endDate && v.endDate < v.startDate) ctx.addIssue({ code: "custom", path: ["endDate"], message: "Slutdatum är före startdatum." });
  if (v.firstBillingMonth < v.startDate.slice(0, 7)) ctx.addIssue({ code: "custom", path: ["firstBillingMonth"], message: "Första faktureringsmånaden är före hyresperioden." });
  if (v.endDate && v.firstBillingMonth > v.endDate.slice(0, 7)) ctx.addIssue({ code: "custom", path: ["firstBillingMonth"], message: "Första faktureringsmånaden är efter hyresperioden." });
});

export const billingPreviewInput = z.object({
  planId: z.string().min(1), month, invoiceDate: date, amountMinor: amount.optional(),
}).strict();

export const billingDraftInput = z.object({
  periodId: z.string().min(1), reviewId: z.string().min(1),
}).strict();

export async function saveBillingPlan(input: unknown, id?: string, db: DB = defaultDb) {
  // Projektet kör utan strictNullChecks, vilket annars gör alla Zod-fält
  // valfria i TS trots att parse ovan/under validerar dem vid runtime.
  const { version, ...data } = billingPlanInput.parse(input) as Omit<Required<z.infer<typeof billingPlanInput>>, "version"> & { version?: number };
  const [company] = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, data.companyId));
  if (!company) throw new BillingError("Företaget finns inte längre.", 404);
  if (data.propertyId) {
    const [property] = await db.select({ id: properties.id }).from(properties).where(eq(properties.id, data.propertyId));
    if (!property) throw new BillingError("Boendet finns inte längre.", 404);
  }
  if (data.requestId) {
    const [request] = await db.select().from(requests).where(eq(requests.id, data.requestId));
    if (!request || request.companyId !== data.companyId) throw new BillingError("Bokningen hör inte till företaget.");
    if (!["won", "invoiced"].includes(request.status)) throw new BillingError("Bokningen är inte vunnen eller fakturerad.");
    if (data.propertyId && data.propertyId !== request.wonPropertyId) {
      const [match] = await db.select().from(matches).where(and(eq(matches.requestId, request.id), eq(matches.propertyId, data.propertyId), eq(matches.status, "accepted")));
      if (!match) throw new BillingError("Boendet hör inte till den bekräftade bokningen.");
    }
  }
  const sourceKey = data.requestId ? `${data.requestId}:${data.propertyId ?? "booking"}` : null;
  if (sourceKey) {
    const [duplicate] = await db.select({ id: billingPlans.id }).from(billingPlans).where(eq(billingPlans.sourceKey, sourceKey));
    if (duplicate && duplicate.id !== id) throw new BillingError("Bokningen har redan en fakturaplan.", 409);
  }
  const now = new Date().toISOString();
  if (!id) {
    const [row] = await db.insert(billingPlans).values({ ...data, sourceKey, id: nanoid(), createdAt: now, updatedAt: now }).returning();
    return row;
  }
  const [existing] = await db.select().from(billingPlans).where(eq(billingPlans.id, id));
  if (!existing) throw new BillingError("Uthyrningen finns inte längre.", 404);
  // En fakturaplan får inte flyttas till en annan kund/bokning när den har historik.
  if (existing.companyId !== data.companyId || existing.requestId !== data.requestId || existing.propertyId !== data.propertyId) {
    throw new BillingError("Kund och bokning kan inte ändras på en sparad uthyrning. Lägg upp en ny uthyrning.");
  }
  if (existing.customerNumber !== data.customerNumber || existing.firstBillingMonth !== data.firstBillingMonth) {
    const [issued] = await db.select({ id: billingPeriods.id }).from(billingPeriods).where(and(eq(billingPeriods.planId, id), inArray(billingPeriods.status, ["creating", "draft", "uncertain"])));
    if (issued) throw new BillingError("Kundnummer och första faktureringsmånad kan inte ändras efter att ett utkast har börjat skapas.");
  }
  const [row] = await db.update(billingPlans).set({ ...data, sourceKey, version: sql`${billingPlans.version} + 1`, updatedAt: now })
    .where(and(eq(billingPlans.id, id), eq(billingPlans.version, version ?? -1))).returning();
  if (!row) throw new BillingError("Uthyrningen har ändrats. Ladda om innan du sparar.", 409);
  return row;
}

export async function getBillingOverview(db: DB = defaultDb) {
  const [plans, periods, customers, bookings, connection] = await Promise.all([
    db.select({ plan: billingPlans, companyName: companies.name }).from(billingPlans).innerJoin(companies, eq(billingPlans.companyId, companies.id)).orderBy(asc(companies.name), asc(billingPlans.accommodation)),
    db.select({ id: billingPeriods.id, planId: billingPeriods.planId, month: billingPeriods.month, status: billingPeriods.status, invoiceNumber: billingPeriods.invoiceNumber, invoiceUrl: billingPeriods.invoiceUrl, invoiceTotalMinor: billingPeriods.invoiceTotalMinor, lastError: billingPeriods.lastError }).from(billingPeriods).orderBy(desc(billingPeriods.month)),
    db.select({ id: companies.id, name: companies.name, customerNumber: companies.customerNumber }).from(companies).orderBy(asc(companies.name)),
    db.select({ request: requests, companyName: companies.name, property: properties, match: matches }).from(requests)
      .innerJoin(companies, eq(requests.companyId, companies.id))
      .leftJoin(matches, and(eq(matches.requestId, requests.id), eq(matches.status, "accepted")))
      .leftJoin(properties, eq(properties.id, sql`coalesce(${matches.propertyId}, ${requests.wonPropertyId})`))
      .where(inArray(requests.status, ["won", "invoiced"])),
    getFortnoxConnectionStatus(db),
  ]);
  const sourceKeys = new Set(plans.map(({ plan }) => plan.sourceKey));
  const candidates = bookings.map(({ request, companyName, property, match }) => ({
    sourceKey: `${request.id}:${property?.id ?? "booking"}`,
    requestId: request.id, requestNumber: request.requestNumber, companyId: request.companyId, companyName,
    propertyId: property?.id ?? null,
    accommodation: [property?.address, property?.city ?? request.city].filter(Boolean).join(", "),
    monthlyAmountMinor: Math.round((match?.offerRentOut ?? request.monthlyValue ?? 0) * 100),
    startDate: match?.offerStartDate ?? request.startDate,
    endDate: (match?.offerOngoing ?? request.endDateOngoing) ? null : (match?.offerEndDate ?? request.endDate),
    reference: request.billingProjectId ?? request.requestNumber?.toString() ?? "",
    contractSigned: hasSignedMoveInContract(request.moveInChecklist),
  })).filter((candidate, index, all) => !sourceKeys.has(candidate.sourceKey) && all.findIndex((c) => c.sourceKey === candidate.sourceKey) === index);
  return {
    plans: plans.map(({ plan, companyName }) => ({ ...plan, companyName })), periods, customers, candidates,
    connection: { connected: connection.connected, configured: !!process.env.FORTNOX_CLIENT_ID && !!process.env.FORTNOX_CLIENT_SECRET },
    defaultMonth: nextBillingMonth(),
  };
}

export type BillingOverview = Awaited<ReturnType<typeof getBillingOverview>>;
export type BillingPlanRow = BillingOverview["plans"][number];
export type BillingCandidate = BillingOverview["candidates"][number];

function assertBillable(plan: BillingPlan, monthValue: string) {
  if (!plan.active) throw new BillingError("Uthyrningens fakturering är pausad.");
  if (monthValue < plan.firstBillingMonth) throw new BillingError("Månaden ligger före den första faktureringsmånaden i CRM.");
  const bounds = billingMonthBounds(monthValue);
  if (plan.startDate > bounds.end || (plan.endDate && plan.endDate < bounds.start)) throw new BillingError("Månaden ligger utanför hyresperioden.");
  return bounds;
}

async function assertBooking(plan: BillingPlan, db: DB) {
  if (!plan.requestId) return;
  const [request] = await db.select().from(requests).where(eq(requests.id, plan.requestId));
  if (!request || !["won", "invoiced"].includes(request.status)) throw new BillingError("Bokningen är inte längre aktiv.");
  if (!hasSignedMoveInContract(request.moveInChecklist)) throw new BillingError("Markera signerat avtal på bokningen innan ett fakturautkast skapas.");
  if (request.moveOutDoneAt && !plan.endDate) throw new BillingError("Avflytt är klarmarkerad. Ange uthyrningens slutdatum innan du fakturerar.");
}

type FortnoxCustomer = { CustomerNumber: string; Name: string; OrganisationNumber?: string; Active?: boolean };
type FortnoxInvoice = { DocumentNumber: string; CustomerNumber: string; ExternalInvoiceReference1: string; Booked?: boolean; Sent?: boolean; Cancelled?: boolean; Total?: number };

export async function previewBillingPeriod(input: unknown, userId: string, db: DB = defaultDb): Promise<BillingPreview> {
  const data = billingPreviewInput.parse(input);
  const [plan] = await db.select().from(billingPlans).where(eq(billingPlans.id, data.planId));
  if (!plan) throw new BillingError("Uthyrningen finns inte längre.", 404);
  const bounds = assertBillable(plan, data.month);
  await assertBooking(plan, db);
  const [company] = await db.select().from(companies).where(eq(companies.id, plan.companyId));
  if (!company) throw new BillingError("Företaget finns inte längre.", 404);
  const [existing] = await db.select().from(billingPeriods).where(and(eq(billingPeriods.planId, plan.id), eq(billingPeriods.month, data.month)));
  if (existing && ["creating", "draft", "uncertain"].includes(existing.status)) throw new BillingError("Perioden har redan hanterats. Öppna eller kontrollera det befintliga Fortnoxutkastet.", 409);
  const start = plan.startDate > bounds.start ? plan.startDate : bounds.start;
  const end = plan.endDate && plan.endDate < bounds.end ? plan.endDate : bounds.end;
  const partialMonth = start !== bounds.start || end !== bounds.end;
  const blockers: string[] = [];
  if (partialMonth && data.amountMinor === undefined) blockers.push("Delmånad: ange och granska beloppet för just den här perioden.");
  const amountMinor = data.amountMinor ?? plan.monthlyAmountMinor;
  const netMinor = plan.vatIncluded ? Math.round(amountMinor * 100 / (100 + plan.vatRate)) : amountMinor;
  const vatMinor = plan.vatIncluded ? amountMinor - netMinor : Math.round(netMinor * plan.vatRate / 100);
  const connection = await getFortnoxConnectionStatus(db);
  if (!connection.connected || !process.env.FORTNOX_CLIENT_ID || !process.env.FORTNOX_CLIENT_SECRET) blockers.push("Koppla Fortnox innan du skapar utkast. Underlaget kan granskas här under tiden.");
  const articleNumber = process.env.FORTNOX_INVOICE_ARTICLE_NUMBER || null;
  const rawAccount = process.env.FORTNOX_INVOICE_ACCOUNT_NUMBER;
  const accountNumber = rawAccount && /^\d{4}$/.test(rawAccount) ? Number(rawAccount) : null;
  if (!accountNumber) blockers.push("Fakturakopplingen behöver ett försäljningskonto i Fortnox innan utkast kan skapas.");
  let fortnoxCustomerName: string | null = null;
  if (connection.connected && process.env.FORTNOX_CLIENT_ID && process.env.FORTNOX_CLIENT_SECRET) {
    const response = await fortnoxRequest<{ Customer: FortnoxCustomer }>(`/customers/${encodeURIComponent(plan.customerNumber)}`, {}, db);
    const customer = response.Customer;
    if (!customer || String(customer.CustomerNumber) !== plan.customerNumber || !customer.Name) throw new BillingError("Kundnumret kunde inte verifieras i Fortnox.");
    if (customer.Active === false) blockers.push("Kunden är inaktiv i Fortnox.");
    if (normalizeOrgNr(company.orgNr) && normalizeOrgNr(customer.OrganisationNumber) && normalizeOrgNr(company.orgNr) !== normalizeOrgNr(customer.OrganisationNumber)) blockers.push("Organisationsnumret i Fortnox stämmer inte med kunden i CRM. Kontrollera kundnumret.");
    fortnoxCustomerName = customer.Name;
  }
  const snapshot: BillingSnapshot = {
    planId: plan.id, planVersion: plan.version, month: data.month, companyName: company.name,
    customerNumber: plan.customerNumber, fortnoxCustomerName, accommodation: plan.accommodation,
    periodStart: start, periodEnd: end, partialMonth, amountMinor, vatRate: plan.vatRate, vatIncluded: plan.vatIncluded,
    netMinor, vatMinor, totalMinor: netMinor + vatMinor, invoiceDate: data.invoiceDate,
    dueDate: addBillingDays(data.invoiceDate, plan.paymentTermsDays), reference: plan.reference,
    externalReference: `sos:${plan.id}:${data.month}`, articleNumber, accountNumber,
  };
  if (blockers.length) return { snapshot, blockers, periodId: null, reviewId: null };
  const now = new Date().toISOString();
  const values = { snapshot, reviewId: nanoid(), reviewedBy: userId, reviewExpiresAt: new Date(Date.now() + 30 * 60_000).toISOString(), status: "review" as const, lastError: null, updatedAt: now };
  const sameReview = sql`${billingPeriods.status} = 'review' AND ${billingPeriods.reviewedBy} = ${userId} AND ${billingPeriods.reviewExpiresAt} > ${now} AND ${billingPeriods.snapshot} = ${JSON.stringify(snapshot)}`;
  const [period] = await db.insert(billingPeriods).values({ ...values, id: nanoid(), planId: plan.id, month: data.month, externalReference: snapshot.externalReference, createdAt: now })
    .onConflictDoUpdate({ target: [billingPeriods.planId, billingPeriods.month], set: {
      ...values,
      // Samma underlag/användare är idempotent, även när två läsningar startar
      // samtidigt (t.ex. React Strict Mode). Ett ändrat underlag får ny nyckel.
      reviewId: sql`CASE WHEN ${sameReview} THEN ${billingPeriods.reviewId} ELSE ${values.reviewId} END`,
    }, setWhere: inArray(billingPeriods.status, ["review", "failed"]) }).returning();
  if (!period) throw new BillingError("Perioden håller redan på att skapas. Ladda om listan.", 409);
  return { snapshot, blockers, periodId: period.id, reviewId: period.reviewId };
}

// Exakt referens, alla sidor. En orelaterad första träff får aldrig användas som faktura.
async function findBillingInvoice(reference: string, db: DB): Promise<FortnoxInvoice | null> {
  let found: FortnoxInvoice | null = null;
  for (let page = 1; page <= 20; page++) {
    const response = await fortnoxRequest<{ Invoices?: FortnoxInvoice[]; MetaInformation?: { "@TotalPages"?: number } }>(`/invoices?externalinvoicereference1=${encodeURIComponent(reference)}&limit=100&page=${page}`, {}, db);
    if (!Array.isArray(response.Invoices)) throw new BillingError("Fortnoxs fakturasökning gav ett oväntat svar. Inget nytt utkast skapas.", 502);
    for (const summary of response.Invoices) {
      if (!summary?.DocumentNumber) throw new BillingError("Fortnoxs fakturasökning saknade fakturanummer.", 502);
      const item = typeof summary.ExternalInvoiceReference1 === "string" ? summary : (await fortnoxRequest<{ Invoice: FortnoxInvoice }>(`/invoices/${encodeURIComponent(String(summary.DocumentNumber))}`, {}, db)).Invoice;
      if (!item) throw new BillingError("Fakturareferensen kunde inte verifieras i Fortnox.", 502);
      if (item.ExternalInvoiceReference1 !== reference) continue;
      if (found && String(found.DocumentNumber) !== String(item.DocumentNumber)) throw new BillingError("Flera fakturor har samma periodreferens. Kontrollera dem i Fortnox.", 409);
      found = item;
    }
    const pages = Number(response.MetaInformation?.["@TotalPages"] ?? 1);
    if (!Number.isFinite(pages) || pages > 20) throw new BillingError("Fortnoxs fakturasökning kunde inte verifieras fullständigt.", 502);
    if (page >= pages) return found;
  }
  throw new BillingError("Fortnoxs fakturasökning kunde inte slutföras.", 502);
}

export function billingInvoicePayload(snapshot: BillingSnapshot) {
  return { Invoice: {
    CustomerNumber: snapshot.customerNumber, InvoiceDate: snapshot.invoiceDate, DueDate: snapshot.dueDate,
    Currency: "SEK", VATIncluded: snapshot.vatIncluded, YourReference: snapshot.reference,
    ExternalInvoiceReference1: snapshot.externalReference, NotCompleted: true,
    AdministrationFee: 0, Freight: 0, InvoiceDiscount: 0,
    Remarks: `${snapshot.accommodation}. Hyra ${snapshot.periodStart}–${snapshot.periodEnd}.`,
    InvoiceRows: [{
      ...(snapshot.articleNumber ? { ArticleNumber: snapshot.articleNumber } : {}),
      AccountNumber: snapshot.accountNumber,
      Description: `Hyra ${snapshot.accommodation}, ${snapshot.periodStart}–${snapshot.periodEnd}`,
      DeliveredQuantity: "1", Unit: "mån", Price: snapshot.amountMinor / 100, VAT: snapshot.vatRate,
    }],
  } };
}

async function saveInvoiceResult(period: BillingPeriod, found: FortnoxInvoice, db: DB, requireDraft = false) {
  if (!found?.DocumentNumber) throw new BillingError("Fortnox returnerade inget fakturanummer.", 502);
  const response = await fortnoxRequest<{ Invoice: FortnoxInvoice }>(`/invoices/${encodeURIComponent(String(found.DocumentNumber))}`, {}, db);
  const invoice = response.Invoice;
  if (!invoice) throw new BillingError("Fortnoxfakturan kunde inte läsas tillbaka.", 502);
  if (!invoice.DocumentNumber || String(invoice.CustomerNumber) !== period.snapshot.customerNumber || invoice.ExternalInvoiceReference1 !== period.externalReference) throw new BillingError("Fortnoxfakturan stämmer inte med det granskade underlaget. Kontrollera den i Fortnox.", 409);
  if (invoice.Cancelled) throw new BillingError("Periodens faktura är makulerad i Fortnox. Granska den manuellt innan någon ersättning skapas.", 409);
  if (requireDraft && (invoice.Booked !== false || invoice.Sent !== false)) throw new BillingError("Fakturan har en oväntad status i Fortnox. Kontrollera den manuellt.", 409);
  const invoiceTotalMinor = invoice.Total == null ? null : Math.round(Number(invoice.Total) * 100);
  if (invoiceTotalMinor == null || !Number.isSafeInteger(invoiceTotalMinor) || invoiceTotalMinor <= 0) throw new BillingError("Fakturan skapades men totalsumman kunde inte bekräftas i Fortnox.", 502);
  const lastError = invoiceTotalMinor !== period.snapshot.totalMinor
    ? "Totalsumman i Fortnox avviker från underlaget. Kontrollera avrundning, moms och eventuella avgifter innan du skickar fakturan."
    : null;
  const [saved] = await db.update(billingPeriods).set({ status: "draft", invoiceNumber: String(invoice.DocumentNumber), invoiceUrl: fortnoxInvoiceUrl(String(invoice.DocumentNumber)), invoiceTotalMinor, lastError, updatedAt: new Date().toISOString() })
    .where(eq(billingPeriods.id, period.id)).returning();
  return saved;
}

export async function createBillingDraft(input: unknown, userId: string, db: DB = defaultDb) {
  const data = billingDraftInput.parse(input);
  const [period] = await db.select().from(billingPeriods).where(eq(billingPeriods.id, data.periodId));
  if (!period) throw new BillingError("Underlaget finns inte längre. Granska perioden igen.", 404);
  if (period.reviewedBy !== userId || period.reviewId !== data.reviewId) throw new BillingError("Underlaget har ändrats eller granskats av någon annan. Granska det igen.", 409);
  if (period.status === "draft") return period;
  // Osäkert POST-resultat återhämtas enbart genom läsning, aldrig genom nytt POST.
  if (period.status === "creating" || period.status === "uncertain") return reconcileBillingDraft(period.id, db);
  if (period.status !== "review" || period.reviewExpiresAt <= new Date().toISOString()) throw new BillingError("Granskningen har gått ut. Öppna underlaget igen.", 409);
  const [plan] = await db.select().from(billingPlans).where(eq(billingPlans.id, period.planId));
  if (!plan || plan.version !== period.snapshot.planVersion) throw new BillingError("Fakturaplanen har ändrats. Granska underlaget igen.", 409);
  assertBillable(plan, period.month);
  await assertBooking(plan, db);
  const [locked] = await db.update(billingPeriods).set({ status: "creating", updatedAt: new Date().toISOString() })
    .where(and(eq(billingPeriods.id, period.id), eq(billingPeriods.status, "review"), eq(billingPeriods.reviewId, data.reviewId))).returning();
  if (!locked) throw new BillingError("Perioden håller redan på att skapas. Ladda om listan.", 409);
  let postStarted = false;
  let postRejected = false;
  try {
    const existing = await findBillingInvoice(period.externalReference, db);
    if (existing) {
      postStarted = true; // Det finns redan belägg för en faktura: bara återhämtning får ske.
      return await saveInvoiceResult(period, existing, db);
    }
    postStarted = true;
    const response = await fortnoxRequest<{ Invoice: FortnoxInvoice }>("/invoices", { method: "POST", body: JSON.stringify(billingInvoicePayload(period.snapshot)) }, db).catch((error) => {
      // Bara ett uttryckligt avvisat SKAPANDE-anrop kan återförsökas.
      // En 404/401 vid efterföljande återläsning innebär fortfarande att
      // fakturan kan finnas, och får aldrig öppna för ett nytt skapande.
      postRejected = error instanceof FortnoxApiError && error.status >= 400 && error.status < 500 && error.status !== 408;
      throw error;
    });
    const invoice = response.Invoice;
    if (!invoice?.DocumentNumber) throw new BillingError("Fortnox returnerade inget fakturanummer. Kontrollera perioden i Fortnox.", 502);
    // Läs tillbaka resultatet. Inga bokförings- eller utskicksanrop finns i flödet.
    return await saveInvoiceResult(period, invoice, db, true);
  } catch (error) {
    const uncertain = postStarted && !postRejected;
    const message = uncertain
      ? "Fortnoxsvaret kunde inte bekräftas. Kontrollera befintligt utkast; ett nytt skapas inte automatiskt."
      : error instanceof Error ? error.message : "Kunde inte skapa utkastet i Fortnox.";
    await db.update(billingPeriods).set({ status: uncertain ? "uncertain" : "failed", lastError: message, updatedAt: new Date().toISOString() }).where(and(eq(billingPeriods.id, period.id), eq(billingPeriods.status, "creating")));
    throw new BillingError(message, 502);
  }
}

export async function reconcileBillingDraft(periodId: string, db: DB = defaultDb) {
  const [period] = await db.select().from(billingPeriods).where(eq(billingPeriods.id, periodId));
  if (!period) throw new BillingError("Perioden finns inte längre.", 404);
  if (period.status === "draft") return period;
  if (!["creating", "uncertain"].includes(period.status)) throw new BillingError("Perioden behöver granskas innan ett utkast kan skapas.", 409);
  const invoice = await findBillingInvoice(period.externalReference, db);
  if (!invoice) throw new BillingError("Ingen faktura med periodens referens kunde bekräftas. Kontrollera i Fortnox innan perioden hanteras manuellt.", 409);
  return saveInvoiceResult(period, invoice, db);
}

export function billingErrorResponse(error: unknown) {
  if (error instanceof z.ZodError) return { status: 400, body: { error: error.issues[0]?.message ?? "Kontrollera underlaget." } };
  if (error instanceof BillingError || error instanceof FortnoxSetupError) return { status: error.status, body: { error: error.message } };
  if (error instanceof FortnoxApiError) return { status: 502, body: { error: "Fortnox kunde inte verifiera underlaget. Kontrollera anslutning, kundnummer och behörigheter." } };
  console.error("billing:", error instanceof Error ? error.message : "Unknown error");
  return { status: 500, body: { error: "Kunde inte läsa eller spara faktureringen. Försök igen." } };
}
