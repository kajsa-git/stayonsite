import { and, eq, isNull, lt, or } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import * as schema from "./schema";
import { companies, contacts, integrations, matches, requests, type Company, type Request } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

const PROVIDER = "fortnox";
const TOKEN_URL = "https://apps.fortnox.se/oauth-v1/token";
const AUTH_URL = "https://apps.fortnox.se/oauth-v1/auth";
const API_BASE = "https://api.fortnox.se/3";
const DEFAULT_REDIRECT_URI = "https://www.stayonsite.se/api/crm/fortnox/callback";
const REFRESH_TOKEN_LIFETIME_MS = 45 * 24 * 60 * 60 * 1000;
const ACCESS_TOKEN_MARGIN_MS = 2 * 60 * 1000;

export class FortnoxSetupError extends Error {
  status: number;
  constructor(message: string, status = 409) {
    super(message);
    this.name = "FortnoxSetupError";
    this.status = status;
  }
}

class FortnoxApiError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "FortnoxApiError";
    this.status = status;
    this.body = body;
  }
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
};

type InvoiceDraftPatch = Pick<
  Request,
  "fortnoxInvoiceNumber" | "fortnoxInvoiceUrl" | "fortnoxInvoiceCreatedAt" | "fortnoxInvoiceError"
>;

type RequestForInvoice = Request & Partial<Pick<Request, "startDate" | "endDate" | "endDateOngoing">>;

function fortnoxCredentials() {
  const clientId = process.env.FORTNOX_CLIENT_ID;
  const clientSecret = process.env.FORTNOX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new FortnoxSetupError("Fortnox saknar Client ID/Secret i miljön.");
  }
  return { clientId, clientSecret };
}

export function fortnoxRedirectUri() {
  return process.env.FORTNOX_REDIRECT_URI ?? DEFAULT_REDIRECT_URI;
}

export function buildFortnoxAuthorizationUrl(state: string) {
  const { clientId } = fortnoxCredentials();
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", fortnoxRedirectUri());
  url.searchParams.set("scope", process.env.FORTNOX_SCOPES ?? "customer invoice");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("response_type", "code");
  if (process.env.FORTNOX_ACCOUNT_TYPE) url.searchParams.set("account_type", process.env.FORTNOX_ACCOUNT_TYPE);
  return url;
}

export async function exchangeFortnoxCode(code: string, db: DB = defaultDb) {
  const token = await requestToken(new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: fortnoxRedirectUri(),
  }));
  await storeTokenResponse(token, db);
}

export async function refreshFortnoxKeepAlive(db: DB = defaultDb) {
  await getFortnoxAccessToken(db, { forceRefresh: true });
}

export async function getFortnoxConnectionStatus(db: DB = defaultDb) {
  const [row] = await db.select().from(integrations).where(eq(integrations.provider, PROVIDER));
  return {
    connected: !!row?.refreshToken,
    scope: row?.scope ?? null,
    expiresAt: row?.expiresAt ? new Date(row.expiresAt).toISOString() : null,
    refreshTokenExpiresAt: row?.refreshTokenExpiresAt ? new Date(row.refreshTokenExpiresAt).toISOString() : null,
  };
}

async function requestToken(body: URLSearchParams): Promise<TokenResponse> {
  const { clientId, clientSecret } = fortnoxCredentials();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new FortnoxApiError("Fortnox nekade token-anropet.", res.status, text);
  return JSON.parse(text) as TokenResponse;
}

async function storeTokenResponse(token: TokenResponse, db: DB) {
  const now = Date.now();
  const row = {
    provider: PROVIDER,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenType: token.token_type ?? "bearer",
    scope: token.scope ?? null,
    expiresAt: new Date(now + token.expires_in * 1000),
    refreshTokenExpiresAt: new Date(now + REFRESH_TOKEN_LIFETIME_MS),
    refreshLockId: null,
    refreshLockedUntil: null,
    updatedAt: new Date().toISOString(),
  };
  await db
    .insert(integrations)
    .values({ ...row, connectedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: integrations.provider,
      set: row,
    });
}

async function getFortnoxAccessToken(db: DB, opts: { forceRefresh?: boolean } = {}): Promise<string> {
  const [row] = await db.select().from(integrations).where(eq(integrations.provider, PROVIDER));
  if (!row?.refreshToken) {
    throw new FortnoxSetupError("Fortnox är inte kopplat än. Öppna /api/crm/fortnox/connect som inloggad CRM-användare.");
  }
  if (!opts.forceRefresh && row.accessToken && row.expiresAt && row.expiresAt.getTime() > Date.now() + ACCESS_TOKEN_MARGIN_MS) {
    return row.accessToken;
  }

  const lockId = nanoid();
  for (let attempt = 0; attempt < 5; attempt++) {
    const nowIso = new Date().toISOString();
    const lockUntil = new Date(Date.now() + 60_000).toISOString();
    const locked = await db
      .update(integrations)
      .set({ refreshLockId: lockId, refreshLockedUntil: lockUntil, updatedAt: nowIso })
      .where(
        and(
          eq(integrations.provider, PROVIDER),
          or(isNull(integrations.refreshLockedUntil), lt(integrations.refreshLockedUntil, nowIso)),
        ),
      )
      .returning();

    if (locked.length) {
      try {
        const [fresh] = await db.select().from(integrations).where(eq(integrations.provider, PROVIDER));
        if (!fresh?.refreshToken) throw new FortnoxSetupError("Fortnox saknar refresh-token.");
        const token = await requestToken(new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: fresh.refreshToken,
        }));
        await storeTokenResponse(token, db);
        return token.access_token;
      } catch (e) {
        await db
          .update(integrations)
          .set({ refreshLockId: null, refreshLockedUntil: null, updatedAt: new Date().toISOString() })
          .where(and(eq(integrations.provider, PROVIDER), eq(integrations.refreshLockId, lockId)));
        throw e;
      }
    }

    await sleep(800 + attempt * 300);
    const [afterWait] = await db.select().from(integrations).where(eq(integrations.provider, PROVIDER));
    if (!opts.forceRefresh && afterWait?.accessToken && afterWait.expiresAt && afterWait.expiresAt.getTime() > Date.now() + ACCESS_TOKEN_MARGIN_MS) {
      return afterWait.accessToken;
    }
  }
  throw new FortnoxSetupError("Fortnox-token förnyas redan. Försök igen om några sekunder.", 423);
}

async function fortnoxRequest<T>(path: string, init: RequestInit = {}, db: DB = defaultDb): Promise<T> {
  const accessToken = await getFortnoxAccessToken(db);
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new FortnoxApiError(`Fortnox API-fel (${res.status}).`, res.status, text);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export function normalizeOrgNr(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

export function fortnoxInvoiceUrl(documentNumber: string) {
  const tenantId = process.env.FORTNOX_TENANT_ID;
  if (!tenantId) return `https://apps.fortnox.se/`;
  return `https://apps5.fortnox.se/app/${tenantId}/kf/invoicelist?documentnumber=${encodeURIComponent(documentNumber)}`;
}

export function buildInvoicePeriods(startDate: string, endDate: string | null | undefined, ongoing?: boolean | null) {
  const start = parseIsoDate(startDate);
  if (!start) throw new FortnoxSetupError("Förfrågan saknar giltigt startdatum.");
  const end = endDate ? parseIsoDate(endDate) : null;
  if (end && end.getTime() < start.getTime()) {
    throw new FortnoxSetupError("Slutdatum är före startdatum.");
  }

  if (!end) {
    if (!ongoing) throw new FortnoxSetupError("Förfrågan saknar slutdatum eller löpande markering.");
    return [{ start: toIsoDate(start), end: toIsoDate(endOfMonth(start)), ongoing: true }];
  }

  const periods: { start: string; end: string; ongoing?: boolean }[] = [];
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const finalMonth = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (cursor.getTime() <= finalMonth.getTime()) {
    const periodStart = cursor.getUTCFullYear() === start.getUTCFullYear() && cursor.getUTCMonth() === start.getUTCMonth()
      ? start
      : cursor;
    const monthEnd = endOfMonth(cursor);
    const periodEnd = cursor.getUTCFullYear() === end.getUTCFullYear() && cursor.getUTCMonth() === end.getUTCMonth()
      ? end
      : monthEnd;
    periods.push({ start: toIsoDate(periodStart), end: toIsoDate(periodEnd) });
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return periods;
}

export async function createFortnoxInvoiceDraftPatch(
  requestId: string,
  mergedRequest: RequestForInvoice,
  opts: { db?: DB } = {},
): Promise<Partial<InvoiceDraftPatch>> {
  const db = opts.db ?? defaultDb;
  const [savedRequest] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!savedRequest) throw new FortnoxSetupError("Förfrågan finns inte längre.", 404);
  if (savedRequest.fortnoxInvoiceNumber) {
    return { fortnoxInvoiceError: null };
  }

  const [company] = await db.select().from(companies).where(eq(companies.id, savedRequest.companyId));
  if (!company) throw new FortnoxSetupError("Företaget saknas på förfrågan.", 404);
  const companyContacts = await db.select().from(contacts).where(eq(contacts.companyId, company.id));
  const matchRows = await db.select().from(matches).where(eq(matches.requestId, requestId));
  const deal = matchRows.find((m) => m.status === "accepted")
    ?? matchRows.find((m) => m.propertyId === savedRequest.wonPropertyId && m.offerRentOut != null)
    ?? matchRows.find((m) => m.offerRentOut != null);
  const rentOut = deal?.offerRentOut ?? mergedRequest.monthlyValue ?? savedRequest.monthlyValue;
  if (!rentOut) throw new FortnoxSetupError("Saknar pris till kund (offerRentOut/monthlyValue) för fakturautkastet.");

  const customerNumber = await ensureFortnoxCustomer(db, company, companyContacts);
  const externalRef = `stayonsite:${requestId}`;
  const existing = await findInvoiceByExternalReference(db, externalRef);
  const now = new Date().toISOString();
  if (existing) {
    return {
      fortnoxInvoiceNumber: existing,
      fortnoxInvoiceUrl: fortnoxInvoiceUrl(existing),
      fortnoxInvoiceCreatedAt: now,
      fortnoxInvoiceError: null,
    };
  }

  const periods = buildInvoicePeriods(
    deal?.offerStartDate ?? mergedRequest.startDate ?? savedRequest.startDate ?? "",
    deal?.offerOngoing ? null : (deal?.offerEndDate ?? mergedRequest.endDate ?? savedRequest.endDate),
    deal?.offerOngoing ?? mergedRequest.endDateOngoing ?? savedRequest.endDateOngoing,
  );
  const invoice = await createInvoiceDraft(db, {
    customerNumber,
    request: { ...savedRequest, ...mergedRequest },
    rentOut,
    periods,
    externalRef,
  });

  return {
    fortnoxInvoiceNumber: invoice.documentNumber,
    fortnoxInvoiceUrl: fortnoxInvoiceUrl(invoice.documentNumber),
    fortnoxInvoiceCreatedAt: now,
    fortnoxInvoiceError: null,
  };
}

async function ensureFortnoxCustomer(
  db: DB,
  company: Company,
  companyContacts: (typeof contacts.$inferSelect)[],
): Promise<string> {
  if (company.customerNumber) return company.customerNumber;

  const orgNr = normalizeOrgNr(company.orgNr);
  if (orgNr) {
    const found = await findCustomerByOrgNr(db, company.orgNr ?? orgNr);
    if (found) {
      await db.update(companies).set({ customerNumber: found, updatedAt: new Date().toISOString() }).where(eq(companies.id, company.id));
      return found;
    }
  }

  const primary = companyContacts.find((c) => c.isPrimary) ?? companyContacts[0];
  const invoiceEmail = company.invoiceEmail ?? primary?.email ?? undefined;
  const payload = pruneUndefined({
    Customer: {
      Name: company.name,
      OrganisationNumber: company.orgNr ?? undefined,
      Address1: company.street ?? undefined,
      ZipCode: company.postalCode ?? undefined,
      City: company.city ?? undefined,
      CountryCode: countryCode(company.country),
      Email: primary?.email ?? invoiceEmail,
      EmailInvoice: invoiceEmail,
      Phone1: primary?.phone ?? undefined,
    },
  });
  const response = await fortnoxRequest<{ Customer?: { CustomerNumber?: string } }>("/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  }, db);
  const customerNumber = response.Customer?.CustomerNumber;
  if (!customerNumber) throw new FortnoxSetupError("Fortnox skapade kund men returnerade inget kundnummer.", 502);
  await db.update(companies).set({ customerNumber, updatedAt: new Date().toISOString() }).where(eq(companies.id, company.id));
  return customerNumber;
}

async function findCustomerByOrgNr(db: DB, orgNr: string): Promise<string | null> {
  const response = await fortnoxRequest<{ Customers?: { CustomerNumber?: string; OrganisationNumber?: string }[] }>(
    `/customers?organisationnumber=${encodeURIComponent(orgNr)}`,
    {},
    db,
  );
  const target = normalizeOrgNr(orgNr);
  const found = response.Customers?.find((c) => normalizeOrgNr(c.OrganisationNumber) === target) ?? response.Customers?.[0];
  return found?.CustomerNumber ?? null;
}

async function findInvoiceByExternalReference(db: DB, externalRef: string): Promise<string | null> {
  const response = await fortnoxRequest<{ Invoices?: { DocumentNumber?: string; ExternalInvoiceReference1?: string }[] }>(
    `/invoices?externalinvoicereference1=${encodeURIComponent(externalRef)}`,
    {},
    db,
  );
  const found = response.Invoices?.find((i) => i.ExternalInvoiceReference1 === externalRef) ?? response.Invoices?.[0];
  return found?.DocumentNumber ?? null;
}

async function createInvoiceDraft(
  db: DB,
  input: {
    customerNumber: string;
    request: RequestForInvoice;
    rentOut: number;
    periods: ReturnType<typeof buildInvoicePeriods>;
    externalRef: string;
  },
) {
  const articleNumber = process.env.FORTNOX_INVOICE_ARTICLE_NUMBER;
  const accountNumber = process.env.FORTNOX_INVOICE_ACCOUNT_NUMBER ? Number(process.env.FORTNOX_INVOICE_ACCOUNT_NUMBER) : undefined;
  const vat = process.env.FORTNOX_INVOICE_VAT ? Number(process.env.FORTNOX_INVOICE_VAT) : undefined;
  const payload = pruneUndefined({
    Invoice: {
      CustomerNumber: input.customerNumber,
      InvoiceDate: toIsoDate(new Date()),
      Currency: "SEK",
      VATIncluded: false,
      YourReference: input.request.billingProjectId ?? input.request.requestNumber?.toString(),
      ExternalInvoiceReference1: input.externalRef,
      Remarks: `CRM förfrågan #${input.request.requestNumber ?? input.request.id}`,
      InvoiceRows: input.periods.map((period) => ({
        ArticleNumber: articleNumber,
        AccountNumber: accountNumber,
        Description: invoiceRowDescription(input.request, period),
        DeliveredQuantity: "1",
        Unit: "mån",
        Price: roundMoney(input.rentOut),
        VAT: vat,
      })),
    },
  });
  const response = await fortnoxRequest<{ Invoice?: { DocumentNumber?: string } }>("/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  }, db);
  const documentNumber = response.Invoice?.DocumentNumber;
  if (!documentNumber) throw new FortnoxSetupError("Fortnox skapade faktura men returnerade inget fakturanummer.", 502);
  return { documentNumber };
}

function invoiceRowDescription(request: RequestForInvoice, period: { start: string; end: string; ongoing?: boolean }) {
  const place = request.city ? ` ${request.city}` : "";
  const suffix = period.ongoing ? `löpande från ${period.start}` : `${period.start} - ${period.end}`;
  return `Projektboende${place}, ${suffix}`;
}

function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function endOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function countryCode(country: string | null | undefined) {
  if (!country) return "SE";
  const trimmed = country.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/sverige|sweden/i.test(trimmed)) return "SE";
  return undefined;
}

function pruneUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(pruneUndefined) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => [k, pruneUndefined(v)]),
    ) as T;
  }
  return value;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
