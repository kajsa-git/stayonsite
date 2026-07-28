import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildReminderEmail,
  runAgreementReminderSweep,
  type ReminderEmail,
} from "./agreement-reminders";
import { UTHYRNINGSUPPDRAG } from "./avtal";
import { todayStockholm } from "./date";
import * as schema from "./schema";

const { agreementAcceptances, agreementReminders, owners, shareLinks } = schema;

type DB = LibSQLDatabase<typeof schema>;
let db: DB;

// Samma migrationsapplicering som cascade-delete.test.ts — riktigt schema från filerna.
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

let dbFile: string;

beforeEach(async () => {
  dbFile = path.join(os.tmpdir(), `crm-reminders-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
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

const NOW = new Date("2026-07-28T10:00:00Z");
const THREE_DAYS_AGO = "2026-07-25T10:00:00Z";
const ONE_DAY_AGO = "2026-07-27T10:00:00Z";

async function seedOwner(overrides: Partial<typeof owners.$inferInsert> = {}) {
  const [owner] = await db
    .insert(owners)
    .values({
      id: `owner-${Math.random().toString(36).slice(2)}`,
      ownerType: "privatperson",
      name: "Anna Andersson",
      phone: "+46701234567",
      email: "anna@example.com",
      ...overrides,
    })
    .returning();
  return owner;
}

async function seedLink(ownerId: string, overrides: Partial<typeof shareLinks.$inferInsert> = {}) {
  const [link] = await db
    .insert(shareLinks)
    .values({
      id: `link-${Math.random().toString(36).slice(2)}`,
      token: `token-${Math.random().toString(36).slice(2)}`,
      audience: "landlord",
      ownerId,
      createdBy: null, // null = skapad av intagsflödet
      createdAt: THREE_DAYS_AGO,
      ...overrides,
    })
    .returning();
  return link;
}

function collector() {
  const mails: ReminderEmail[] = [];
  return {
    mails,
    sendEmail: async (mail: ReminderEmail) => {
      mails.push(mail);
    },
  };
}

describe("agreement reminder sweep", () => {
  it("skickar påminnelse 1 två dagar efter registreringen och loggar utskicket", async () => {
    const owner = await seedOwner();
    const link = await seedLink(owner.id);
    const { mails, sendEmail } = collector();

    const summary = await runAgreementReminderSweep({ now: NOW, sendEmail, db });

    expect(summary).toMatchObject({ checked: 1, emailed: 1, followUps: 0, errors: 0 });
    expect(mails).toHaveLength(1);
    expect(mails[0].to).toBe("anna@example.com");
    expect(mails[0].subject).toContain("Ett steg kvar");
    expect(mails[0].text).toContain(`/uthyrare/${link.token}`);

    const logged = await db.select().from(agreementReminders).where(eq(agreementReminders.ownerId, owner.id));
    expect(logged).toHaveLength(1);
    expect(logged[0]).toMatchObject({ channel: "email", reminderNo: 1, recipient: "anna@example.com" });

    // Samma dag igen → ingen dubblett.
    const again = await runAgreementReminderSweep({ now: NOW, sendEmail, db });
    expect(again.emailed).toBe(0);
    expect(mails).toHaveLength(1);
  });

  it("väntar med påminnelse 1 tills länken är två dagar gammal", async () => {
    const owner = await seedOwner();
    await seedLink(owner.id, { createdAt: ONE_DAY_AGO });
    const { mails, sendEmail } = collector();

    const summary = await runAgreementReminderSweep({ now: NOW, sendEmail, db });

    expect(summary.emailed).toBe(0);
    expect(mails).toHaveLength(0);
  });

  it("skickar påminnelse 2 tidigast sju dagar efter påminnelse 1 — och aldrig fler", async () => {
    const owner = await seedOwner();
    await seedLink(owner.id);
    const { mails, sendEmail } = collector();

    await runAgreementReminderSweep({ now: NOW, sendEmail, db });
    expect(mails).toHaveLength(1);

    // Dag 5 efter påminnelse 1 → för tidigt.
    const day5 = new Date(NOW.getTime() + 5 * 24 * 60 * 60 * 1000);
    await runAgreementReminderSweep({ now: day5, sendEmail, db });
    expect(mails).toHaveLength(1);

    // Dag 7 → påminnelse 2.
    const day7 = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
    await runAgreementReminderSweep({ now: day7, sendEmail, db });
    expect(mails).toHaveLength(2);
    expect(mails[1].subject).toContain("Påminnelse");

    // Långt senare → max två mejl, sedan tystnad.
    const day60 = new Date(NOW.getTime() + 60 * 24 * 60 * 60 * 1000);
    const summary = await runAgreementReminderSweep({ now: day60, sendEmail, db });
    expect(summary.emailed).toBe(0);
    expect(mails).toHaveLength(2);
  });

  it("hoppar över uthyrare med giltigt signerat uppdrag", async () => {
    const owner = await seedOwner();
    await seedLink(owner.id);
    await db.insert(agreementAcceptances).values({
      id: "acc-1",
      agreementType: UTHYRNINGSUPPDRAG.type,
      version: UTHYRNINGSUPPDRAG.version,
      ownerId: owner.id,
      acceptedName: "Anna Andersson",
      acceptedAt: new Date().toISOString(),
    });
    const { mails, sendEmail } = collector();

    const summary = await runAgreementReminderSweep({ now: NOW, sendEmail, db });

    expect(summary).toMatchObject({ checked: 0, emailed: 0 });
    expect(mails).toHaveLength(0);
  });

  it("uthyrare utan e-post bumpas in i uppföljningskön exakt en gång", async () => {
    const owner = await seedOwner({ email: null });
    await seedLink(owner.id);
    const { mails, sendEmail } = collector();

    const summary = await runAgreementReminderSweep({ now: NOW, sendEmail, db });

    expect(summary).toMatchObject({ emailed: 0, followUps: 1 });
    expect(mails).toHaveLength(0);

    const [updated] = await db.select().from(owners).where(eq(owners.id, owner.id));
    expect(updated.followUpDate).toBe(todayStockholm());
    expect(updated.followUpReason).toContain("Uthyrningsuppdrag ej signerat");

    const logged = await db.select().from(agreementReminders).where(eq(agreementReminders.ownerId, owner.id));
    expect(logged).toHaveLength(1);
    expect(logged[0].channel).toBe("crm_followup");

    // Andra svepet gör ingenting mer.
    const again = await runAgreementReminderSweep({ now: NOW, sendEmail, db });
    expect(again.followUps).toBe(0);
  });

  it("rör inte CRM-skapade länkar eller företagsuthyrare", async () => {
    const privat = await seedOwner();
    await seedLink(privat.id, { createdBy: "user-kajsa" }); // skickad manuellt från CRM

    const foretag = await seedOwner({ ownerType: "foretag", name: "Bygg AB", email: "info@byggab.se" });
    await seedLink(foretag.id);

    const { mails, sendEmail } = collector();
    const summary = await runAgreementReminderSweep({ now: NOW, sendEmail, db });

    expect(summary).toMatchObject({ checked: 0, emailed: 0, followUps: 0 });
    expect(mails).toHaveLength(0);
  });
});

describe("buildReminderEmail", () => {
  it("hälsar med förnamn och skiljer på första och andra påminnelsen", () => {
    const owner = { name: "Anna Andersson", email: "anna@example.com" } as schema.Owner;
    const first = buildReminderEmail(owner, "tok123", 1);
    const second = buildReminderEmail(owner, "tok123", 2);

    expect(first.text).toContain("Hej Anna,");
    expect(first.subject).toBe("Ett steg kvar — godkänn uthyrningsuppdraget");
    expect(second.subject).toBe("Påminnelse: godkänn uthyrningsuppdraget");
    expect(second.text).toContain("sista påminnelse");
    expect(first.html).toContain("https://www.stayonsite.se/uthyrare/tok123");
  });
});
