import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  deleteCompanyDeep,
  deleteContactDeep,
  deleteOwnerDeep,
  deletePropertyDeep,
  deleteRequestDeep,
} from "./cascade-delete";
import * as schema from "./schema";

const {
  agreementAcceptances,
  companies,
  contacts,
  emails,
  matches,
  matchEvents,
  notes,
  ownerOutreach,
  owners,
  properties,
  propertyImages,
  propertyNotes,
  requests,
  shareLinks,
} = schema;

type DB = LibSQLDatabase<typeof schema>;
let db: DB;

// Applicera hela schemat från migrationsfilerna. Vi splittar själva på ";" eftersom
// flera historiska migrationer saknar "--> statement-breakpoint" — drizzles egen
// migrator kör då hela filen som en sats och libSQL applicerar bara den första.
async function applyMigrations(client: Client) {
  const dir = path.resolve(__dirname, "../../../drizzle");
  const journal = JSON.parse(fs.readFileSync(path.join(dir, "meta/_journal.json"), "utf8")) as {
    entries: { tag: string }[];
  };
  for (const entry of journal.entries) {
    const sqlText = fs.readFileSync(path.join(dir, `${entry.tag}.sql`), "utf8");
    const statements = sqlText
      .replace(/-->\s*statement-breakpoint/g, "")
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s && s.split("\n").some((l) => !l.trim().startsWith("--") && l.trim()));
    for (const stmt of statements) {
      await client.execute(stmt);
    }
  }
}

// Fräsch databas per test (unik temp-fil) med det riktiga, fullt migrerade schemat.
// libSQL :memory: delas inte tillförlitligt mellan operationer under vitest, så vi
// använder en temp-fil och städar bort den efteråt.
let dbFile: string;

beforeEach(async () => {
  dbFile = path.join(os.tmpdir(), `crm-cascade-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const client = createClient({ url: `file:${dbFile}` });
  await applyMigrations(client);
  db = drizzle(client, { schema });
});

afterEach(() => {
  for (const suffix of ["", "-wal", "-shm"]) {
    try {
      fs.rmSync(dbFile + suffix);
    } catch {
      /* filen kanske inte finns */
    }
  }
});

describe("deleteCompanyDeep", () => {
  it("raderar företaget och alla barn (kontakter/förfrågningar/noter/matchningar/mejl)", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme" });
    await db.insert(contacts).values({ id: "ct1", companyId: "c1", name: "Anna" });
    await db.insert(requests).values({ id: "r1", companyId: "c1", status: "incoming" });
    await db.insert(notes).values({ id: "n1", companyId: "c1", channel: "mejl", content: "hej" });
    await db.insert(properties).values({ id: "p1" });
    await db.insert(matches).values({ id: "m1", requestId: "r1", propertyId: "p1", status: "suggested" });
    await db.insert(emails).values({
      id: "e1", companyId: "c1", direction: "in", subject: "s", body: "b",
      fromEmail: "x@y.se", toEmail: "z@y.se", sentAt: "2026-01-01T00:00:00Z",
    });
    // Uthyrar-runda på objektet, utlöst av förfrågan → requestId ska nollställas, inte raderas.
    await db.insert(ownerOutreach).values({ id: "o1", propertyId: "p1", requestId: "r1", status: "kontaktad" });

    await db.transaction((tx) => deleteCompanyDeep(tx, "c1"));

    expect(await db.$count(companies)).toBe(0);
    expect(await db.$count(contacts)).toBe(0);
    expect(await db.$count(requests)).toBe(0);
    expect(await db.$count(notes)).toBe(0);
    expect(await db.$count(matches)).toBe(0);
    expect(await db.$count(emails)).toBe(0);

    // Objektet och rundan finns kvar, men rundans requestId är nollställt.
    expect(await db.$count(properties)).toBe(1);
    const [outreach] = await db.select({ id: ownerOutreach.id, requestId: ownerOutreach.requestId }).from(ownerOutreach);
    expect(outreach.requestId).toBeNull();
  });
});

describe("deleteRequestDeep", () => {
  it("raderar förfrågan och dess matchningar, nollställer outreach.requestId", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme" });
    await db.insert(properties).values({ id: "p1" });
    await db.insert(requests).values({ id: "r1", companyId: "c1", status: "matching" });
    await db.insert(matches).values({ id: "m1", requestId: "r1", propertyId: "p1", status: "sent" });
    await db.insert(ownerOutreach).values({ id: "o1", propertyId: "p1", requestId: "r1", status: "kontaktad" });

    await db.transaction((tx) => deleteRequestDeep(tx, "r1"));

    expect(await db.$count(requests)).toBe(0);
    expect(await db.$count(matches)).toBe(0);
    expect(await db.$count(properties)).toBe(1); // objektet rörs inte
    const [outreach] = await db.select({ id: ownerOutreach.id, requestId: ownerOutreach.requestId }).from(ownerOutreach);
    expect(outreach.requestId).toBeNull();
  });

  it("raderar förfrågans delningslänkar, avtalsgodkännanden och händelselogg", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme" });
    await db.insert(properties).values({ id: "p1" });
    await db.insert(requests).values({ id: "r1", companyId: "c1", status: "matching" });
    await db.insert(requests).values({ id: "r2", companyId: "c1", status: "incoming" });
    await db.insert(matches).values({ id: "m1", requestId: "r1", propertyId: "p1", status: "sent" });
    await db.insert(shareLinks).values({ id: "sl1", token: "t1", audience: "tenant", requestId: "r1" });
    await db.insert(shareLinks).values({ id: "sl2", token: "t2", audience: "tenant", requestId: "r2" });
    await db.insert(agreementAcceptances).values({
      id: "a1", agreementType: "uppdragsbekraftelse", version: "2026-07-12",
      requestId: "r1", acceptedName: "Anna", acceptedAt: "2026-07-12T08:00:00Z",
    });
    await db.insert(matchEvents).values({
      id: "ev1", matchId: "m1", requestId: "r1", actor: "internal", type: "offer_terms",
      data: { rentOut: 24500 },
    });

    await db.transaction((tx) => deleteRequestDeep(tx, "r1"));

    // Bara r1:s länk, godkännande och händelser försvinner — r2:s länk står kvar.
    const remaining = await db.select({ id: shareLinks.id }).from(shareLinks);
    expect(remaining.map((l) => l.id)).toEqual(["sl2"]);
    expect(await db.$count(agreementAcceptances)).toBe(0);
    expect(await db.$count(matchEvents)).toBe(0);
  });
});

describe("deletePropertyDeep", () => {
  it("raderar objektet + matchningar/rundor/bilder/kontaktlogg, nollställer requests.wonPropertyId", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme" });
    await db.insert(properties).values({ id: "p1" });
    await db.insert(requests).values({ id: "r1", companyId: "c1", status: "won", wonPropertyId: "p1" });
    await db.insert(matches).values({ id: "m1", requestId: "r1", propertyId: "p1", status: "accepted" });
    await db.insert(ownerOutreach).values({ id: "o1", propertyId: "p1", status: "bekraftad" });
    await db.insert(propertyImages).values({ id: "img1", propertyId: "p1", key: "k/1.jpg" });
    await db.insert(propertyNotes).values({ id: "pn1", propertyId: "p1", channel: "telefon", content: "ok" });

    await db.transaction((tx) => deletePropertyDeep(tx, "p1"));

    expect(await db.$count(properties)).toBe(0);
    expect(await db.$count(matches)).toBe(0);
    expect(await db.$count(ownerOutreach)).toBe(0);
    expect(await db.$count(propertyImages)).toBe(0);
    expect(await db.$count(propertyNotes)).toBe(0);

    // Förfrågan finns kvar men wonPropertyId är nollställt.
    expect(await db.$count(requests)).toBe(1);
    const [req] = await db.select({ id: requests.id, wonPropertyId: requests.wonPropertyId }).from(requests);
    expect(req.wonPropertyId).toBeNull();
  });

  it("raderar match-scopade delningslänkar men lämnar förfrågans kundlänk", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme" });
    await db.insert(properties).values({ id: "p1" });
    await db.insert(requests).values({ id: "r1", companyId: "c1", status: "matching" });
    await db.insert(matches).values({ id: "m1", requestId: "r1", propertyId: "p1", status: "sent" });
    // Uthyrarlänk knuten till matchen (fas 3-scope) + kundlänk på förfrågan.
    await db.insert(shareLinks).values({ id: "sl1", token: "t1", audience: "landlord", requestId: "r1", matchId: "m1" });
    await db.insert(shareLinks).values({ id: "sl2", token: "t2", audience: "tenant", requestId: "r1" });

    await db.transaction((tx) => deletePropertyDeep(tx, "p1"));

    const remaining = await db.select({ id: shareLinks.id }).from(shareLinks);
    expect(remaining.map((l) => l.id)).toEqual(["sl2"]);
  });
});

describe("deleteOwnerDeep", () => {
  it("nollställer objekt/rundor/mejl-kopplingar och raderar uthyraren", async () => {
    await db.insert(owners).values({ id: "ow1", name: "Hyresvärd AB" });
    await db.insert(properties).values({ id: "p1", ownerId: "ow1" });
    await db.insert(ownerOutreach).values({ id: "o1", propertyId: "p1", ownerId: "ow1", status: "i_dialog" });
    await db.insert(emails).values({
      id: "e1", ownerId: "ow1", direction: "out", subject: "s", body: "b",
      fromEmail: "x@y.se", toEmail: "z@y.se", sentAt: "2026-01-01T00:00:00Z",
    });

    await db.transaction((tx) => deleteOwnerDeep(tx, "ow1"));

    expect(await db.$count(owners)).toBe(0);
    // Beroende rader finns kvar men ägar-referensen är nollställd.
    const [prop] = await db.select({ id: properties.id, ownerId: properties.ownerId }).from(properties);
    expect(prop.ownerId).toBeNull();
    const [outreach] = await db.select({ id: ownerOutreach.id, ownerId: ownerOutreach.ownerId }).from(ownerOutreach);
    expect(outreach.ownerId).toBeNull();
    const [email] = await db.select({ id: emails.id, ownerId: emails.ownerId }).from(emails);
    expect(email.ownerId).toBeNull();
  });
});

describe("deleteContactDeep", () => {
  it("nollställer emails.contactId och raderar kontakten", async () => {
    await db.insert(companies).values({ id: "c1", name: "Acme" });
    await db.insert(contacts).values({ id: "ct1", companyId: "c1", name: "Anna" });
    await db.insert(emails).values({
      id: "e1", companyId: "c1", contactId: "ct1", direction: "out", subject: "s", body: "b",
      fromEmail: "x@y.se", toEmail: "z@y.se", sentAt: "2026-01-01T00:00:00Z",
    });

    await db.transaction((tx) => deleteContactDeep(tx, "ct1"));

    expect(await db.$count(contacts)).toBe(0);
    expect(await db.$count(emails)).toBe(1); // mejlet finns kvar
    const [email] = await db.select({ id: emails.id, contactId: emails.contactId }).from(emails);
    expect(email.contactId).toBeNull();
  });
});
