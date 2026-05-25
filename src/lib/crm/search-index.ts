import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  companies,
  contacts,
  notes,
  properties,
  requests,
  searchIndex,
  type Company,
  type Contact,
  type Note,
  type Property,
  type Request,
  type SearchIndexInsert,
} from "./schema";

export type SearchEntityType = "company" | "contact" | "request" | "property" | "note";

const REQUEST_STATUS_SV: Record<string, string> = {
  incoming: "inkommen ny förfrågan",
  matching: "matchar pågående",
  won: "vunnen att fakturera",
  invoiced: "fakturerad",
  lost: "förlorad nej tack",
  archived: "arkiverad",
};

const PROPERTY_STATUS_SV: Record<string, string> = {
  available: "tillgänglig ledig",
  reserved: "reserverad",
  rented: "uthyrd",
  off_market: "av marknaden",
};

// Slå ihop fält till en gemen, mellanslagsseparerad nyckelords-sträng för LIKE-sökning.
function kw(...parts: Array<string | number | null | undefined>): string {
  return parts
    .map((p) => (p == null ? "" : `${p}`.toLowerCase().trim()))
    .filter((p) => p !== "")
    .join(" ");
}

function rowId(entityType: SearchEntityType, entityId: string): string {
  return `${entityType}:${entityId}`;
}

function companyRow(c: Company): SearchIndexInsert {
  return {
    id: rowId("company", c.id),
    entityType: "company",
    entityId: c.id,
    companyId: c.id,
    title: c.name,
    subtitle: [c.category, c.orgNr].filter(Boolean).join(" · ") || null,
    keywords: kw(c.name, c.orgNr, c.category, c.website, c.invoiceEmail),
    route: `/crm/company/${c.id}`,
  };
}

function contactRow(ct: Contact, companyName: string): SearchIndexInsert {
  return {
    id: rowId("contact", ct.id),
    entityType: "contact",
    entityId: ct.id,
    companyId: ct.companyId,
    title: ct.name || "(namnlös kontakt)",
    subtitle: [companyName, ct.phone || ct.email].filter(Boolean).join(" · ") || null,
    keywords: kw(ct.name, ct.phone, ct.email, companyName),
    route: `/crm/company/${ct.companyId}`,
  };
}

function requestRow(r: Request, companyName: string): SearchIndexInsert {
  const label = REQUEST_STATUS_SV[r.status] ?? r.status;
  return {
    id: rowId("request", r.id),
    entityType: "request",
    entityId: r.id,
    companyId: r.companyId,
    title: `${companyName || "Förfrågan"} – förfrågan #${r.requestNumber ?? "?"}`,
    subtitle: [r.city, label].filter(Boolean).join(" · ") || null,
    keywords: kw(`förfrågan #${r.requestNumber}`, r.requestNumber, companyName, r.city, r.notes, label),
    route: `/crm/company/${r.companyId}`,
  };
}

function propertyRow(p: Property): SearchIndexInsert {
  const label = PROPERTY_STATUS_SV[p.status ?? "available"] ?? p.status ?? "";
  return {
    id: rowId("property", p.id),
    entityType: "property",
    entityId: p.id,
    companyId: null,
    title: p.address || "(adress saknas)",
    subtitle: [p.postalCode, p.city].filter(Boolean).join(" ") || null,
    keywords: kw(
      p.address,
      p.postalCode,
      p.city,
      p.ownerName,
      p.ownerPhone,
      p.ownerEmail,
      p.notes,
      p.publicDescription,
      label,
    ),
    route: `/crm/properties?id=${p.id}`,
  };
}

function noteRow(n: Note, companyName: string): SearchIndexInsert {
  return {
    id: rowId("note", n.id),
    entityType: "note",
    entityId: n.id,
    companyId: n.companyId,
    title: `${companyName || "Anteckning"} – anteckning`,
    subtitle: [n.channel, n.content].filter(Boolean).join(" · ").slice(0, 80) || null,
    keywords: kw(companyName, n.channel, n.content),
    route: `/crm/company/${n.companyId}`,
  };
}

async function upsert(row: SearchIndexInsert): Promise<void> {
  await db
    .insert(searchIndex)
    .values(row)
    .onConflictDoUpdate({
      target: searchIndex.id,
      set: {
        entityType: row.entityType,
        entityId: row.entityId,
        companyId: row.companyId ?? null,
        title: row.title,
        subtitle: row.subtitle ?? null,
        keywords: row.keywords,
        route: row.route,
        updatedAt: new Date().toISOString(),
      },
    });
}

export async function removeFromIndex(entityType: SearchEntityType, entityId: string): Promise<void> {
  await db.delete(searchIndex).where(eq(searchIndex.id, rowId(entityType, entityId)));
}

// Company raderas → barnen (contacts/requests/notes) cascade-raderas i DB, men deras
// index-rader saknar FK. Rensa alla index-rader för företaget i en sats.
export async function removeCompanyCascadeFromIndex(companyId: string): Promise<void> {
  await db.delete(searchIndex).where(eq(searchIndex.companyId, companyId));
}

// Company-redigering rör också barnens nyckelord (de bär företagsnamnet) → refresha dem.
export async function indexCompany(companyId: string): Promise<void> {
  const [c] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!c) {
    await removeFromIndex("company", companyId);
    return;
  }
  const [cts, reqs, nts] = await Promise.all([
    db.select().from(contacts).where(eq(contacts.companyId, c.id)),
    db.select().from(requests).where(eq(requests.companyId, c.id)),
    db.select().from(notes).where(eq(notes.companyId, c.id)),
  ]);
  await Promise.all([
    upsert(companyRow(c)),
    ...cts.map((x) => upsert(contactRow(x, c.name))),
    ...reqs.map((x) => upsert(requestRow(x, c.name))),
    ...nts.map((x) => upsert(noteRow(x, c.name))),
  ]);
}

async function companyNameFor(companyId: string): Promise<string> {
  const [c] = await db.select({ name: companies.name }).from(companies).where(eq(companies.id, companyId));
  return c?.name ?? "";
}

export async function indexContact(contactId: string): Promise<void> {
  const [ct] = await db.select().from(contacts).where(eq(contacts.id, contactId));
  if (!ct) {
    await removeFromIndex("contact", contactId);
    return;
  }
  await upsert(contactRow(ct, await companyNameFor(ct.companyId)));
}

export async function indexRequest(requestId: string): Promise<void> {
  const [r] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!r) {
    await removeFromIndex("request", requestId);
    return;
  }
  await upsert(requestRow(r, await companyNameFor(r.companyId)));
}

export async function indexProperty(propertyId: string): Promise<void> {
  const [p] = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (!p) {
    await removeFromIndex("property", propertyId);
    return;
  }
  await upsert(propertyRow(p));
}

export async function indexNote(noteId: string): Promise<void> {
  const [n] = await db.select().from(notes).where(eq(notes.id, noteId));
  if (!n) {
    await removeFromIndex("note", noteId);
    return;
  }
  await upsert(noteRow(n, await companyNameFor(n.companyId)));
}

// Säkerhetsnät mot drift: töm och bygg om hela indexet från källtabellerna.
export async function rebuildSearchIndex(): Promise<number> {
  const [allC, allCt, allR, allP, allN] = await Promise.all([
    db.select().from(companies),
    db.select().from(contacts),
    db.select().from(requests),
    db.select().from(properties),
    db.select().from(notes),
  ]);
  const nameById = Object.fromEntries(allC.map((c) => [c.id, c.name]));

  const rows: SearchIndexInsert[] = [
    ...allC.map(companyRow),
    ...allCt.map((x) => contactRow(x, nameById[x.companyId] ?? "")),
    ...allR.map((x) => requestRow(x, nameById[x.companyId] ?? "")),
    ...allP.map(propertyRow),
    ...allN.map((x) => noteRow(x, nameById[x.companyId] ?? "")),
  ];

  await db.delete(searchIndex);
  // Batcha insert i bitar (undvik för stora SQL-satser)
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(searchIndex).values(rows.slice(i, i + CHUNK));
  }
  return rows.length;
}
