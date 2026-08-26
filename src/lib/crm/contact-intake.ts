import { and, desc, eq, isNull, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { todayStockholm } from "./date";
import { db } from "./db";
import { normalizePhoneForStorage } from "./phone-links";
import { safeFetchPublic } from "./safe-fetch";
import {
  companies,
  contacts,
  owners,
  ownerOutreach,
  properties,
  requests,
  type Company,
  type Contact,
  type Owner,
  type Property,
  type Request,
} from "./schema";
import { indexCompany, indexContact, indexOwner, indexProperty, indexRequest } from "./search-index";

export type WebSubmission = {
  formType: "hero-intent" | "inquiry" | "homeowner" | "lp-homeowner" | "lp-corporate";
  locale: "sv" | "en" | "pl";
  page: string;
  source?: string;
  fields: Record<string, string>;
  utmParams?: Record<string, string>;
};

function clean(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function int(value: unknown): number | null {
  const text = clean(value);
  if (!text) return null;
  const n = parseInt(text, 10);
  return Number.isFinite(n) ? n : null;
}

function today() {
  return todayStockholm();
}

function utmLine(submission: WebSubmission) {
  if (!submission.utmParams || Object.keys(submission.utmParams).length === 0) return null;
  return Object.entries(submission.utmParams).map(([k, v]) => `${k}=${v}`).join(", ");
}

function sourceNotes(submission: WebSubmission, extra: Array<string | null | undefined> = []) {
  return [
    `Inkommen från webb (${submission.formType})`,
    submission.source ? `Källa: ${submission.source}` : null,
    `Sida: ${submission.page}`,
    `Språk: ${submission.locale}`,
    utmLine(submission) ? `UTM: ${utmLine(submission)}` : null,
    ...extra,
  ].filter(Boolean).join("\n");
}

function appendNote(existing: string | null, note: string) {
  if (!existing) return note;
  if (existing.includes(note)) return existing;
  return `${existing}\n\n${note}`;
}

// Privata mejlleverantörer — deras sajter får aldrig skrapas som företagsnamn
// (annars döps företaget till "Gmail"/"Outlook", hänt t.o.m. 2026-08-22).
// Träff → fallback på hela mejladressen, där t.ex. "orustindustri@hotmail.se"
// åtminstone är igenkännbar.
const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com",
  "hotmail.com", "hotmail.se", "hotmail.co.uk", "hotmail.de",
  "outlook.com", "outlook.se", "outlook.de", "live.com", "live.se", "msn.com",
  "icloud.com", "me.com", "mac.com",
  "yahoo.com", "yahoo.se", "yahoo.co.uk", "ymail.com",
  "protonmail.com", "proton.me", "pm.me",
  "telia.com", "telia.se", "bredband.net", "comhem.se", "tele2.se",
  "bahnhof.se", "spray.se", "passagen.se", "swipnet.se", "glocalnet.net",
  "aol.com", "gmx.com", "gmx.de", "mail.com", "fastmail.com", "yandex.com",
]);

export function isFreemailDomain(domain: string): boolean {
  return FREEMAIL_DOMAINS.has(domain.trim().toLowerCase());
}

async function scrapeCompanyName(domain: string): Promise<string | null> {
  try {
    // domain kommer från en e-postadress (user-input) → SSRF-skyddad fetch:
    // blockerar privata/loopback/link-local-mål, bara-IP och redirect-till-intern.
    const res = await safeFetchPublic(`https://${domain}`, {
      signal: AbortSignal.timeout(3000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StayOnSite/1.0)" },
    });
    const html = await res.text();
    const ogSiteName = html.match(/<meta[^>]+property="og:site_name"[^>]+content="([^"]{1,120})"/i)?.[1]
      ?? html.match(/<meta[^>]+content="([^"]{1,120})"[^>]+property="og:site_name"/i)?.[1];
    if (ogSiteName?.trim()) return ogSiteName.trim();
    const title = html.match(/<title[^>]*>([^<]{1,120})<\/title>/i)?.[1]?.trim();
    return title || null;
  } catch {
    return null;
  }
}

async function companyNameFrom(email: string | null, phone: string | null): Promise<string> {
  const domain = email?.split("@")[1]?.toLowerCase();
  if (domain) {
    if (isFreemailDomain(domain)) return `Webbförfrågan · ${email}`;
    const scraped = await scrapeCompanyName(domain);
    if (scraped) return scraped;
    return `Webbförfrågan · ${domain}`;
  }
  if (phone) return `Webbförfrågan · ${phone}`;
  return "Webbförfrågan";
}

async function findCompanyByContact(email: string | null, phone: string | null) {
  if (!email && !phone) return null;
  const conditions = [email ? eq(contacts.email, email) : null, phone ? eq(contacts.phone, phone) : null].filter(Boolean);
  const [row] = await db
    .select({ contact: contacts, company: companies })
    .from(contacts)
    .innerJoin(companies, eq(contacts.companyId, companies.id))
    .where(or(...conditions))
    .limit(1);
  return row ?? null;
}

async function ensureCompanyAndContact({
  email,
  phone: rawPhone,
  name,
  companyName,
  submission,
}: {
  email: string | null;
  phone: string | null;
  name?: string | null;
  companyName?: string | null;
  submission: WebSubmission;
}) {
  // Normalisera till E.164 innan både matchning och skrivning — annars missar
  // findCompanyByContact befintliga kontakter vars nummer redan är normaliserade.
  const phone = normalizePhoneForStorage(rawPhone);
  const existing = await findCompanyByContact(email, phone);
  if (existing) {
    return { company: existing.company, contact: existing.contact };
  }

  const companyId = nanoid();
  const [company] = await db
    .insert(companies)
    .values({
      id: companyId,
      name: companyName ?? (await companyNameFrom(email, phone)),
      leadSource: "webb",
      languages: [submission.locale],
      followUpDate: today(),
      followUpReason: "Ny webbförfrågan",
    })
    .returning();

  let contact: Contact | null = null;
  if (email || phone || name) {
    const [row] = await db
      .insert(contacts)
      .values({
        id: nanoid(),
        companyId,
        name: name ?? null,
        email,
        phone,
        isPrimary: true,
      })
      .returning();
    contact = row;
  }

  return { company, contact };
}

async function nextRequestNumber() {
  const [latest] = await db.select({ requestNumber: requests.requestNumber }).from(requests).orderBy(desc(requests.requestNumber)).limit(1);
  return (latest?.requestNumber ?? 0) + 1;
}

async function createCompanyRequest(
  submission: WebSubmission,
): Promise<{ company: Company; contact: Contact | null; request: Request }> {
  const f = submission.fields;
  const city = clean(f.ort) ?? clean(f.city);
  const persons = int(f.antal_personer) ?? int(f.people);
  const email = clean(f.email) ?? (clean(f.kontakt)?.includes("@") ? clean(f.kontakt) : null);
  const phone = clean(f.phone) ?? (clean(f.kontakt)?.includes("@") ? null : clean(f.kontakt));
  const contactName = clean(f.contactName) ?? clean(f.name);
  const companyName = clean(f.company);
  const message = clean(f.message);

  const { company, contact } = await ensureCompanyAndContact({
    email,
    phone,
    name: contactName,
    companyName,
    submission,
  });

  const requestNumber = await nextRequestNumber();
  const [request] = await db
    .insert(requests)
    .values({
      id: nanoid(),
      requestNumber,
      companyId: company.id,
      contactId: contact?.id ?? null,
      city,
      persons,
      gclid: clean(submission.utmParams?.gclid),
      gclidCapturedAt: submission.utmParams?.gclid ? new Date().toISOString() : null,
      status: "incoming",
      billingProjectId: String(requestNumber),
      notes: sourceNotes(submission, [
        message ? `Meddelande:\n${message}` : null,
        email ? `E-post: ${email}` : null,
        phone ? `Telefon: ${phone}` : null,
      ]),
      statusChangedAt: new Date().toISOString(),
    })
    .returning();

  await Promise.all([
    indexCompany(company.id),
    contact ? indexContact(contact.id) : Promise.resolve(),
    indexRequest(request.id),
  ]);

  return { company, contact, request };
}

async function findOwner(email: string | null, phone: string | null, fallbackPhone?: string | null): Promise<Owner | null> {
  const phoneCandidates = [...new Set([phone, fallbackPhone].filter(Boolean))] as string[];
  if (!email && phoneCandidates.length === 0) return null;
  const conditions = [
    email ? eq(owners.email, email) : null,
    ...phoneCandidates.map((candidate) => eq(owners.phone, candidate)),
  ].filter(Boolean);
  const [owner] = await db
    .select()
    .from(owners)
    .where(or(...conditions))
    .limit(1);
  return owner ?? null;
}

async function markOwnerForWebFollowUp(
  owner: Owner,
  submission: WebSubmission,
  contact: { email: string | null; phone: string | null },
): Promise<Owner> {
  const [updated] = await db
    .update(owners)
    .set({
      email: contact.email ?? owner.email,
      phone: contact.phone ?? owner.phone,
      followUpDate: today(),
      followUpReason: "Ny husägare från webb",
      notes: appendNote(owner.notes, sourceNotes(submission)),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(owners.id, owner.id))
    .returning();

  return updated ?? owner;
}

async function ensureOpenOwnerOutreach(propertyId: string, ownerId: string, reason: string) {
  const [existing] = await db
    .select()
    .from(ownerOutreach)
    .where(and(eq(ownerOutreach.propertyId, propertyId), isNull(ownerOutreach.concludedAt)))
    .orderBy(desc(ownerOutreach.createdAt))
    .limit(1);

  if (existing) {
    await db
      .update(ownerOutreach)
      .set({
        ownerId,
        nextFollowUpDate: today(),
        nextFollowUpReason: reason,
      })
      .where(eq(ownerOutreach.id, existing.id));
    return;
  }

  await db.insert(ownerOutreach).values({
    id: nanoid(),
    propertyId,
    ownerId,
    status: "ej_kontaktad",
    startedAt: new Date().toISOString(),
    nextFollowUpDate: today(),
    nextFollowUpReason: reason,
  });
}

async function createHomeownerLead(
  submission: WebSubmission,
): Promise<{ owner: Owner; property: Property | null }> {
  const f = submission.fields;
  const email = clean(f.email);
  const rawPhone = clean(f.phone);
  const phone = normalizePhoneForStorage(rawPhone);
  const name = clean(f.name) ?? (phone ? `Husägare · ${phone}` : "Husägare från webb");
  const postalCode = clean(f.postalCode);
  const city = clean(f.city);
  const bedrooms = int(f.bedrooms);

  let owner = await findOwner(email, phone, rawPhone);
  if (!owner) {
    const [row] = await db
      .insert(owners)
      .values({
        id: nanoid(),
        ownerType: "privatperson",
        ownerArrangement: "direkt",
        name,
        phone,
        email,
        followUpDate: today(),
        followUpReason: "Ny husägare från webb",
        notes: sourceNotes(submission),
      })
      .returning();
    owner = row;
  } else {
    owner = await markOwnerForWebFollowUp(owner, submission, { email, phone });
  }

  let existingProperty: Property | undefined;
  const locationCondition = postalCode ? eq(properties.postalCode, postalCode) : city ? eq(properties.city, city) : null;
  if (locationCondition) {
    [existingProperty] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.ownerId, owner.id), locationCondition))
      .limit(1);
  }

  if (existingProperty) {
    await ensureOpenOwnerOutreach(existingProperty.id, owner.id, "Ny husägare från webb");
    await Promise.all([indexOwner(owner.id), indexProperty(existingProperty.id)]);
    return { owner, property: existingProperty };
  }

  const [property] = await db
    .insert(properties)
    .values({
      id: nanoid(),
      ownerId: owner.id,
      address: null,
      postalCode,
      city,
      bedrooms,
      notes: sourceNotes(submission, [
        bedrooms ? `Sovrum: ${bedrooms}` : null,
        postalCode ? `Postnummer: ${postalCode}` : null,
      ]),
      status: "off_market",
      published: false,
    })
    .returning();

  // Öppna en kontaktrunda så husägaren dyker upp i "Följ upp uthyrare" idag.
  await ensureOpenOwnerOutreach(property.id, owner.id, "Ny husägare från webb");

  await Promise.all([indexOwner(owner.id), indexProperty(property.id)]);
  return { owner, property };
}

export async function mapWebSubmissionToCrm(submission: WebSubmission) {
  if (submission.formType === "homeowner" || submission.formType === "lp-homeowner") {
    return { type: "homeowner", ...(await createHomeownerLead(submission)) };
  }

  return { type: "request", ...(await createCompanyRequest(submission)) };
}
