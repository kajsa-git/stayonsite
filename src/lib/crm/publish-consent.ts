import { and, eq, inArray, isNull } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { nanoid } from "nanoid";
import { db as defaultDb } from "./db";
import { HUS_PUBLICATION_SMS_SOURCE, husPublicationSmsId } from "./hus-publication";
import { PUBLICATION_CONSENT_TEXT, PUBLICATION_CONSENT_VERSION } from "./publication-consent-text";
import * as schema from "./schema";
import { agreementAcceptances, outboxMessages, properties, propertyNotes } from "./schema";

type DB = LibSQLDatabase<typeof schema>;

export interface ConsentableProperty {
  id: string;
  address: string | null;
  city: string | null;
}

export interface PublishConsentState {
  pending: ConsentableProperty[];
  consented: ConsentableProperty[];
}

// Legacy listings may already be public without a recorded timestamp. Keep
// them out of a new approval request, but do not invent a consent record.
export async function loadPublishConsentState(ownerId: string, opts?: { db?: DB }): Promise<PublishConsentState> {
  const db = opts?.db ?? defaultDb;
  const rows = await db.select({
    id: properties.id, address: properties.address, city: properties.city,
    published: properties.published, publishConsentAt: properties.publishConsentAt,
  }).from(properties).where(eq(properties.ownerId, ownerId));

  return {
    pending: rows.filter((row) => !row.publishConsentAt && !row.published),
    consented: rows.filter((row) => !!row.publishConsentAt || !!row.published),
  };
}

export class PublicationConsentScopeError extends Error {}

type ConsentSource = "web" | "sms" | "mejl" | "chatt" | "samtal" | "övrigt";

export interface RecordPublishConsentInput {
  // Public links must supply an owner and the exact properties shown to them.
  // The authenticated CRM may record one property even if no owner is linked.
  ownerId?: string | null;
  propertyIds: string[];
  name: string;
  source: ConsentSource;
  acceptedAt?: string;
  evidence: string;
  autoPublishEnabled?: boolean;
  authorId?: string | null;
  ip?: string | null;
  webAcceptance?: { shareLinkId: string; userAgent?: string | null; language: "sv" | "en" };
}

// A consent is always for the selected properties, never for future properties
// or every property belonging to an owner. The public proof and the effective
// flags are committed together. Existing evidence is never overwritten.
export async function recordPublishConsent(input: RecordPublishConsentInput, opts?: { db?: DB }): Promise<ConsentableProperty[]> {
  const db = opts?.db ?? defaultDb;
  const ids = [...new Set(input.propertyIds)];
  if (!ids.length || ids.length !== input.propertyIds.length) throw new PublicationConsentScopeError("Välj bostad.");
  const now = new Date().toISOString();
  const acceptedAt = input.acceptedAt ?? now;
  return db.transaction(async (tx) => {
    const rows = await tx.select({ id: properties.id, address: properties.address, city: properties.city, notes: properties.notes, publishConsentSource: properties.publishConsentSource })
      .from(properties)
      .where(input.ownerId ? and(eq(properties.ownerId, input.ownerId), inArray(properties.id, ids)) : inArray(properties.id, ids));
    if (rows.length !== ids.length) throw new PublicationConsentScopeError("Bostaden ingår inte i länken.");

    const stamped: ConsentableProperty[] = [];
    for (const row of rows) {
      const [husMessage] = await tx.select({ id: outboxMessages.id }).from(outboxMessages).where(and(
        eq(outboxMessages.id, husPublicationSmsId(row.id)), eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE),
      )).limit(1);
      const hus = row.publishConsentSource === "hus" || !!husMessage || (row.notes ?? "").includes("HUS webbpublicering (");
      const [updated] = await tx.update(properties).set({
        publishConsentAt: acceptedAt,
        publishConsentName: input.name.trim(),
        publishConsentSource: input.source,
        publishConsentIp: input.ip ?? null,
        ...(hus ? { autoPublishEnabled: false } : input.autoPublishEnabled === undefined ? {} : { autoPublishEnabled: input.autoPublishEnabled }),
        updatedAt: now,
      }).where(and(eq(properties.id, row.id), isNull(properties.publishConsentAt))).returning({ id: properties.id });
      if (!updated) continue;

      await tx.insert(propertyNotes).values({
        id: nanoid(), propertyId: row.id, channel: input.source === "mejl" ? "mail" : input.source === "web" ? "övrigt" : input.source,
        source: "publication-consent", authorId: input.authorId ?? null, createdAt: now,
        content: `Publicering godkänd ${acceptedAt.slice(0, 10)} av ${input.name.trim()} via ${input.source}.\nUnderlag: ${input.evidence.trim()}`,
      });
      if (input.webAcceptance) {
        await tx.insert(agreementAcceptances).values({
          id: nanoid(), agreementType: "publiceringsmedgivande", version: PUBLICATION_CONSENT_VERSION,
          ownerId: input.ownerId ?? null, propertyId: row.id, shareLinkId: input.webAcceptance.shareLinkId,
          acceptedName: input.name.trim(), acceptedAt, ip: input.ip ?? null,
          userAgent: input.webAcceptance.userAgent ?? null, language: input.webAcceptance.language,
        });
      }
      stamped.push({ id: row.id, address: row.address, city: row.city });
    }
    return stamped;
  });
}

// A withdrawal immediately removes public access and preserves the old proof
// in the contact log. It must not silently restart automatic publication.
export async function withdrawPublishConsent(input: {
  propertyId: string; ownerId?: string; source: ConsentSource; name: string; evidence: string; authorId?: string | null;
}, opts?: { db?: DB }): Promise<boolean> {
  const db = opts?.db ?? defaultDb;
  const now = new Date().toISOString();
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(properties).where(eq(properties.id, input.propertyId));
    if (!before || (input.ownerId && before.ownerId !== input.ownerId)) return false;
    await tx.insert(propertyNotes).values({
      id: nanoid(), propertyId: input.propertyId, channel: input.source === "mejl" ? "mail" : input.source === "web" ? "övrigt" : input.source,
      source: "publication-consent", authorId: input.authorId ?? null, createdAt: now,
      content: `Publiceringsmedgivande återkallat av ${input.name.trim()} via ${input.source}.\nUnderlag: ${input.evidence.trim()}\nTidigare registrering: ${before.publishConsentAt ?? "saknas"}, ${before.publishConsentSource ?? "källa saknas"}, namn: ${before.publishConsentName ?? "saknas"}${before.publishConsentIp ? `, IP: ${before.publishConsentIp}` : ""}.`,
    });
    await tx.update(properties).set({
      publishConsentAt: null, publishConsentName: input.name.trim(), publishConsentSource: "withdrawn", publishConsentIp: null,
      published: false, prospektPublished: false, autoPublishEnabled: false, updatedAt: now,
    }).where(eq(properties.id, input.propertyId));
    await tx.update(outboxMessages).set({ status: "pending_publication", body: "Bostadslänken skickas när publiceringen är klar." })
      .where(and(eq(outboxMessages.id, husPublicationSmsId(input.propertyId)), eq(outboxMessages.source, HUS_PUBLICATION_SMS_SOURCE), eq(outboxMessages.status, "queued")));
    return true;
  });
}

export function webConsentEvidence(): string {
  return `Godkänt via uthyrarlänken, version ${PUBLICATION_CONSENT_VERSION}. Text: ${PUBLICATION_CONSENT_TEXT}`;
}
