import { intakeFactsFromNotes } from "@/lib/property-features";
import { and, desc, eq, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { db as defaultDb } from "./db";
import { CRM_MAILBOX } from "./email-sync";
import { crmRoute, type DB } from "./mcp/shape";
import { stripQuoted } from "./reply-engine/context";
import { agreementAcceptances, companies, contacts, emails, gmailSyncState, inboxMessages, matches, notes, outboxMessages,
  ownerOutreach, owners, properties, propertyImages, propertyIntakeFollowUps, propertyNotes, requests } from "./schema";

export type ConversationTarget = "owner" | "property" | "contact" | "company" | "request";
export type ConversationChannel = "sms" | "whatsapp" | "email" | "messenger" | "note";
type Cursor = { at: string; id: string };
type Scope =
  | { side: "owner"; ownerId: string | null; propertyId: string | null }
  | { side: "customer"; companyId: string; contactId: string | null; requestId: string | null; wholeCompany: boolean };

interface HistoryRow {
  id: string;
  at: string;
  channel: ConversationChannel;
  direction: "in" | "out" | null;
  state: string | null;
  subject: string | null;
  body: string;
  threadId: string | null;
  contactId: string | null;
  propertyId: string | null;
  requestId: string | null;
}

const CASE_LIMIT = 12;
const agreementEvidence = {
  type: agreementAcceptances.agreementType, version: agreementAcceptances.version, acceptedAt: agreementAcceptances.acceptedAt,
  requestId: agreementAcceptances.requestId, propertyId: agreementAcceptances.propertyId,
};

// The CRM's private share URLs contain bearer tokens. The history needs to
// show that a link was sent; use the dedicated CRM flow to obtain a live link.
function excerpt(body: string | null, max = 1400) {
  const text = (body ?? "").replace(/\/(uthyrare|erbjudande)\/[\w-]{24,}(?:[^\s<>"']*)/giu, "/$1/[personlig länk]").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function ownerContext(db: DB, kind: ConversationTarget, id: string) {
  const [property] = kind === "property" ? await db.select({ ownerId: properties.ownerId }).from(properties)
    .where(eq(properties.id, id)) : [];
  if (kind === "property" && !property) return null;
  const scope: Scope = { side: "owner", ownerId: kind === "owner" ? id : property.ownerId, propertyId: kind === "property" ? id : null };
  const [owner] = scope.ownerId ? await db.select({
    id: owners.id, name: owners.name, type: owners.ownerType, contactPerson: owners.contactPerson,
    phone: owners.phone, email: owners.email, notes: owners.notes, followUpDate: owners.followUpDate, followUpReason: owners.followUpReason,
  }).from(owners).where(eq(owners.id, scope.ownerId)) : [];
  if (kind === "owner" && !owner) return null;

  const selectedHomes = scope.propertyId ? eq(properties.id, scope.propertyId) : eq(properties.ownerId, scope.ownerId!);
  const [homes, followUps, approvals] = await Promise.all([
    db.select({
      id: properties.id, address: properties.address, city: properties.city, status: properties.status,
      bedrooms: properties.bedrooms, beds: properties.beds, bathrooms: properties.bathrooms, furnished: properties.furnished, ownHome: properties.egetBoende,
      washingMachines: properties.washingMachines, dryers: properties.dryers, parkingSpaces: properties.parkingSpaces,
      inclusions: properties.inclusions, intakeNotes: properties.notes,
      moveInFrom: properties.moveInFrom, availableTo: properties.availableTo, availability: properties.availability,
      published: properties.published, publishConsentAt: properties.publishConsentAt, contentReviewStatus: properties.contentReviewStatus,
      images: sql<number>`(SELECT count(*) FROM ${propertyImages} WHERE ${propertyImages.propertyId} = ${properties.id})`,
      intakeStatus: propertyIntakeFollowUps.status, intakeFollowUpOn: propertyIntakeFollowUps.nextFollowUpOn,
      intakeAssessment: propertyIntakeFollowUps.assessment,
    }).from(properties).leftJoin(propertyIntakeFollowUps, eq(propertyIntakeFollowUps.propertyId, properties.id))
      .where(selectedHomes).orderBy(desc(properties.updatedAt), desc(properties.id)).limit(CASE_LIMIT + 1),
    scope.ownerId ? db.select({
      id: ownerOutreach.id, propertyId: ownerOutreach.propertyId, requestId: ownerOutreach.requestId, status: ownerOutreach.status,
      nextFollowUpDate: ownerOutreach.nextFollowUpDate, nextFollowUpReason: ownerOutreach.nextFollowUpReason,
    }).from(ownerOutreach).innerJoin(properties, eq(ownerOutreach.propertyId, properties.id))
      .where(and(selectedHomes, eq(properties.ownerId, scope.ownerId), eq(ownerOutreach.ownerId, scope.ownerId), isNull(ownerOutreach.concludedAt)))
      .orderBy(desc(ownerOutreach.startedAt)).limit(CASE_LIMIT + 1) : Promise.resolve([]),
    scope.ownerId ? db.select(agreementEvidence).from(agreementAcceptances)
      .where(and(eq(agreementAcceptances.ownerId, scope.ownerId), scope.propertyId ? eq(agreementAcceptances.propertyId, scope.propertyId) : undefined))
      .orderBy(desc(agreementAcceptances.acceptedAt)).limit(CASE_LIMIT + 1) : Promise.resolve([]),
  ]);
  return {
    scope,
    identity: owner ? { ...owner, notes: excerpt(owner.notes, 800) } : null,
    cases: { properties: homes.slice(0, CASE_LIMIT).map(({ intakeAssessment, intakeNotes, ...home }) => ({
      // Svaren från bostadsregistreringen (bostadstyp, tvätt, säkerhet ja/nej, utrustning,
      // hyresform, parkering) så att agenten vet vad som är känt och vad som ska följas upp.
      ...home, intakeFacts: intakeFactsFromNotes(intakeNotes), intakeMissing: intakeAssessment?.missing ?? [], crmUrl: crmRoute.property(home.id),
    })),
      openFollowUps: followUps.slice(0, CASE_LIMIT), recordedApprovals: approvals.slice(0, CASE_LIMIT),
      moreCases: [homes, followUps, approvals].some((rows) => rows.length > CASE_LIMIT) },
    crmUrl: scope.propertyId ? crmRoute.property(scope.propertyId) : crmRoute.owner(id),
  };
}

async function customerContext(db: DB, kind: ConversationTarget, id: string) {
  const [request] = kind === "request" ? await db.select({ companyId: requests.companyId, contactId: requests.contactId })
    .from(requests).where(eq(requests.id, id)) : [];
  if (kind === "request" && !request) return null;
  const contactId = kind === "contact" ? id : request?.contactId;
  const [contact] = contactId ? await db.select({ id: contacts.id, name: contacts.name, phone: contacts.phone, email: contacts.email,
    companyId: contacts.companyId }).from(contacts).where(and(eq(contacts.id, contactId), request ? eq(contacts.companyId, request.companyId) : undefined)) : [];
  if (kind === "contact" && !contact) return null;
  const companyId = kind === "company" ? id : (request?.companyId ?? contact!.companyId);
  const [company] = await db.select({ id: companies.id, name: companies.name, city: companies.city, languages: companies.languages,
    followUpDate: companies.followUpDate, followUpReason: companies.followUpReason }).from(companies).where(eq(companies.id, companyId));
  if (!company) return null;
  const scope: Scope = { side: "customer", companyId, contactId: contact?.id ?? null, requestId: kind === "request" ? id : null, wholeCompany: kind === "company" };
  const caseFilter = scope.requestId ? eq(requests.id, scope.requestId) : scope.contactId ? eq(requests.contactId, scope.contactId) : undefined;
  const cases = await db.select({
    id: requests.id, number: requests.requestNumber, contactId: requests.contactId, city: requests.city, status: requests.status,
    persons: requests.persons, bedroomsFrom: requests.bedroomsFrom, bedroomsTo: requests.bedroomsTo,
    bedsFrom: requests.bedsFrom, bedsTo: requests.bedsTo, furnishedRequired: requests.furnishedRequired,
    parkingRequired: requests.parkingRequired, startDate: requests.startDate, endDate: requests.endDate,
    ongoing: requests.endDateOngoing, moveInDoneAt: requests.moveInDoneAt, moveOutDoneAt: requests.moveOutDoneAt,
    bookedPropertyId: requests.wonPropertyId, bookedPropertyAddress: properties.address, bookedPropertyCity: properties.city,
    budget: requests.budgetMax, notes: requests.notes,
  }).from(requests).leftJoin(properties, eq(properties.id, requests.wonPropertyId))
    .where(and(eq(requests.companyId, companyId), caseFilter)).orderBy(desc(requests.createdAt), desc(requests.id)).limit(CASE_LIMIT + 1);
  const caseIds = cases.slice(0, CASE_LIMIT).map((row) => row.id);
  const [offers, approvals] = await Promise.all([
    caseIds.length ? db.select({
      requestId: matches.requestId, propertyId: matches.propertyId, city: properties.city, bedrooms: properties.bedrooms, beds: properties.beds,
      status: matches.status, sentAt: matches.sentAt, customerPrice: matches.offerRentOut,
      startDate: matches.offerStartDate, endDate: matches.offerEndDate, ongoing: matches.offerOngoing,
    }).from(matches).innerJoin(properties, eq(matches.propertyId, properties.id)).where(inArray(matches.requestId, caseIds))
      .orderBy(desc(matches.sentAt), desc(matches.createdAt)).limit(CASE_LIMIT + 1) : Promise.resolve([]),
    db.select(agreementEvidence).from(agreementAcceptances).where(and(
      eq(agreementAcceptances.agreementType, "uppdragsbekraftelse"),
      or(and(eq(agreementAcceptances.companyId, companyId), isNull(agreementAcceptances.requestId)),
        caseIds.length ? and(inArray(agreementAcceptances.requestId, caseIds),
          or(isNull(agreementAcceptances.companyId), eq(agreementAcceptances.companyId, companyId))) : undefined),
    )).orderBy(desc(agreementAcceptances.acceptedAt)).limit(CASE_LIMIT + 1),
  ]);
  return {
    scope, identity: { company, contact: contact ?? null }, crmUrl: crmRoute.company(companyId),
    cases: { requests: cases.slice(0, CASE_LIMIT).map((row) => ({ ...row, notes: excerpt(row.notes, 1000) })),
      offers: offers.slice(0, CASE_LIMIT), recordedApprovals: approvals.slice(0, CASE_LIMIT),
      moreCases: [cases, offers, approvals].some((rows) => rows.length > CASE_LIMIT) },
  };
}

// All message sources below use `m` for the row that carries the party IDs.
function linkedRecipient(scope: Scope, companyField = false) {
  if (scope.side === "owner") {
    return scope.ownerId ? sql`m.owner_id = ${scope.ownerId} AND m.contact_id IS NULL` : sql`0`;
  }
  const contactMatch = scope.contactId ? sql`m.contact_id = ${scope.contactId}` : scope.wholeCompany
    ? sql`m.contact_id IN (SELECT id FROM ${contacts} WHERE company_id = ${scope.companyId})` : sql`0`;
  const affiliation = companyField ? sql`AND (m.company_id IS NULL OR m.company_id = ${scope.companyId})` : sql``;
  const companyMatch = companyField && scope.wholeCompany ? sql`OR (m.contact_id IS NULL AND m.company_id = ${scope.companyId})` : sql``;
  return sql`m.owner_id IS NULL AND ((${contactMatch}) ${companyMatch}) ${affiliation}`;
}

// Phone import can tag both a landlord and a contact or choose one of two
// records sharing a number. Only unambiguous person links count as dialogue.
function unambiguousPhone(scope: Scope, alias = "m") {
  const message = sql.identifier(alias);
  return scope.side === "owner" ? sql`
    NOT EXISTS (SELECT 1 FROM ${contacts} c WHERE c.phone = ${message}.from_phone)
    AND NOT EXISTS (SELECT 1 FROM ${owners} o WHERE o.phone = ${message}.from_phone AND o.id <> ${message}.owner_id)` : sql`
    NOT EXISTS (SELECT 1 FROM ${owners} o WHERE o.phone = ${message}.from_phone)
    AND NOT EXISTS (SELECT 1 FROM ${contacts} c WHERE c.phone = ${message}.from_phone AND c.id IS NOT ${message}.contact_id)`;
}

function historyQueries(scope: Scope, messenger: boolean, outboxChannels: boolean): SQL[] {
  const routing = outboxChannels ? sql`LEFT JOIN crm_outbox_channels oc ON oc.outbox_id = m.id` : sql``;
  const deliveryChannel = outboxChannels ? sql`coalesce(oc.channel, 'sms')` : sql`'sms'`;
  const recipient = linkedRecipient(scope, true);
  const emailRecipient = scope.side === "customer" && scope.requestId ? sql`m.owner_id IS NULL
    AND (m.company_id IS NULL OR m.company_id = ${scope.companyId})
    AND (m.contact_id IS NULL OR m.contact_id IN (SELECT id FROM ${contacts} WHERE company_id = ${scope.companyId}))
    AND (m.request_id = ${scope.requestId} OR (m.request_id IS NULL AND (${recipient})))` : recipient;
  const queries: SQL[] = [
    sql`SELECT 'sms:' || m.id AS id, m.sent_at AS raw_at,
      CASE WHEN lower(coalesce(m.service,'')) LIKE '%whats%' THEN 'whatsapp' ELSE 'sms' END AS channel,
      m.direction AS direction, CASE WHEN m.direction = 'out' THEN 'sent' ELSE 'received' END AS state,
      NULL AS subject, m.body AS body, NULL AS threadId, m.contact_id AS contactId, NULL AS propertyId, NULL AS requestId
      FROM ${inboxMessages} m WHERE (${recipient}) AND (${unambiguousPhone(scope)})`,
    sql`SELECT 'outbox:' || m.id, coalesce(m.sent_at,m.created_at), ${deliveryChannel}, 'out',
      CASE WHEN m.delivered_at IS NOT NULL THEN 'delivered' ELSE 'sent' END,
      NULL, m.body, NULL, m.contact_id, NULL, NULL FROM ${outboxMessages} m ${routing}
      WHERE (${linkedRecipient(scope)}) AND m.status = 'sent'
      AND NOT EXISTS (SELECT 1 FROM ${inboxMessages} i WHERE i.from_phone = m.to_phone AND i.direction = 'out'
        AND trim(i.body) = trim(m.body) AND i.owner_id IS m.owner_id AND i.contact_id IS m.contact_id
        AND (CASE WHEN lower(coalesce(i.service,'')) LIKE '%whats%' THEN 'whatsapp' ELSE 'sms' END) = ${deliveryChannel}
        AND (${unambiguousPhone(scope, "i")})
        AND abs(unixepoch(i.sent_at) - unixepoch(coalesce(m.sent_at,m.created_at))) <= 120)`,
    sql`SELECT 'email:' || m.id, m.sent_at, 'email', m.direction,
      CASE WHEN m.direction = 'out' THEN 'sent' ELSE 'received' END,
      m.subject, m.body, m.gmail_thread_id, m.contact_id, NULL, m.request_id FROM ${emails} m WHERE ${emailRecipient}`,
  ];
  if (scope.side === "owner") {
    const selectedNotes = scope.propertyId ? sql`p.id = ${scope.propertyId}` : sql`p.owner_id = ${scope.ownerId}`;
    queries.push(sql`SELECT 'property-note:' || n.id, n.created_at, 'note', NULL, NULL, n.channel, n.content,
      NULL, NULL, p.id, NULL FROM ${propertyNotes} n JOIN ${properties} p ON p.id = n.property_id WHERE ${selectedNotes}`);
  } else {
    queries.push(sql`SELECT 'company-note:' || n.id, n.created_at, 'note', NULL, NULL, n.channel, n.content,
      NULL, NULL, NULL, NULL FROM ${notes} n WHERE n.company_id = ${scope.companyId}`);
  }
  if (messenger) queries.push(sql`SELECT 'messenger:' || t.id, t.seen_at, 'messenger', NULL, 'observed', NULL,
    t.text || CASE WHEN t.detail IS NULL THEN '' ELSE char(10) || t.detail END, m.thread_id, m.contact_id, NULL, NULL
    FROM crm_messenger_threads m JOIN crm_messenger_messages t ON m.thread_id = t.thread_id WHERE ${linkedRecipient(scope)}`);
  return queries;
}

export async function getConversationContext(
  input: { kind: ConversationTarget; id: string; channel?: ConversationChannel; before?: Cursor; limit: number }, db: DB = defaultDb,
) {
  const snapshot = input.kind === "owner" || input.kind === "property"
    ? await ownerContext(db, input.kind, input.id) : await customerContext(db, input.kind, input.id);
  if (!snapshot) return null;
  const { scope } = snapshot;
  const layers = await db.all<{ name: string }>(sql`SELECT name FROM sqlite_master WHERE type = 'table'
    AND name IN ('crm_messenger_threads','crm_messenger_messages','crm_outbox_channels')`);
  const tables = new Set(layers.map((r) => r.name));
  const messenger = tables.has("crm_messenger_threads") && tables.has("crm_messenger_messages");
  const outboxChannels = tables.has("crm_outbox_channels");
  const queries = historyQueries(scope, messenger, outboxChannels);
  const before = input.before ? sql`AND (at < ${input.before.at} OR (at = ${input.before.at} AND id < ${input.before.id}))` : sql``;
  const channel = input.channel ? sql`AND channel = ${input.channel}` : sql``;
  const [rows, pending, [mailSync]] = await Promise.all([
    db.all<HistoryRow>(sql`WITH events AS (${sql.join(queries, sql` UNION ALL `)}),
      timed AS (SELECT events.*, coalesce(strftime('%Y-%m-%dT%H:%M:%fZ',raw_at),'1970-01-01T00:00:00.000Z') AS at FROM events)
      SELECT id, at, channel, direction, state, subject, body, threadId, contactId, propertyId, requestId
      FROM timed WHERE 1=1 ${before} ${channel} ORDER BY at DESC, id DESC LIMIT ${input.limit + 1}`),
    input.before ? Promise.resolve([]) : db.all<{ id: string; status: string; createdAt: string | null; body: string; channel: string }>(sql`
      SELECT m.id, m.status, m.created_at AS createdAt, m.body,
        ${outboxChannels ? sql`coalesce(oc.channel,'sms')` : sql`'sms'`} AS channel
      FROM ${outboxMessages} m ${outboxChannels ? sql`LEFT JOIN crm_outbox_channels oc ON oc.outbox_id = m.id` : sql``}
      WHERE (${linkedRecipient(scope)}) AND m.status IN ('draft','queued','sending','failed') ORDER BY m.created_at DESC LIMIT 8`),
    db.select({ lastSuccessAt: gmailSyncState.lastSuccessAt }).from(gmailSyncState).where(eq(gmailSyncState.mailbox, CRM_MAILBOX)),
  ]);
  const history = rows.slice(0, input.limit).map((row) => ({ ...row, subject: row.subject ? excerpt(row.subject, 160) : null,
    body: excerpt(row.channel === "email" ? stripQuoted(row.body) : row.body) }));
  const last = history.at(-1);
  return {
    ...snapshot, readAt: new Date().toISOString(), gmailSyncedAt: mailSync?.lastSuccessAt ?? null,
    history, pending: pending.map((row) => ({ ...row, body: excerpt(row.body, 1000) })),
    nextCursor: rows.length > input.limit && last ? { at: last.at, id: last.id } : null,
  };
}
