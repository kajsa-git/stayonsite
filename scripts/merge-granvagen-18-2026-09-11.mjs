// Slår ihop dubbletten Granvägen18 (publikt bostadsintag 2026-09-06)
// med den äldre huvudposten Granvägen 18 och bevarar all historik.
// Kör från repo-roten:
//   node --env-file=.env.local --import tsx scripts/merge-granvagen-18-2026-09-11.mjs
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "@libsql/client";
import { existsSync, writeFileSync } from "node:fs";
import { nanoid } from "nanoid";
import { indexOwner } from "../src/lib/crm/search-index.ts";

const TARGET = "BX8d60LsiYz5o6exvsqQF"; // äldre huvudpost med historik/matchning
const SOURCE = "mcGYh-WpY0pxnYExdMs9f"; // dubblett från publikt bostadsintag
const OWNER = "MPOp3KAqxBByRT0w1lNO9";
const SMS_GUID = "9D0F6487-4F8C-4B11-B09E-9838F9E837D9";
const BACKUP_FILE = "scripts/granvagen-18-merge-backup-2026-09-11.json";
const FOLLOW_UP_DATE = "2026-09-11";
const FOLLOW_UP_REASON = "Bekräfta om el ingår i varmhyra 12 000 kr/mån";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const bucket = process.env.R2_BUCKET;
const query = async (sql, args = []) => (await client.execute({ sql, args })).rows;

function appendNote(...parts) {
  return parts.map((part) => part?.trim()).filter(Boolean).join("\n\n");
}

async function r2Objects(propertyId) {
  const objects = [];
  let token;
  do {
    const page = await r2.send(new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: `properties/${propertyId}/`,
      ContinuationToken: token,
    }));
    objects.push(...(page.Contents ?? []).map((object) => ({
      key: object.Key,
      etag: (object.ETag ?? "").replaceAll('"', ""),
      size: object.Size,
    })));
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return objects;
}

if (existsSync(BACKUP_FILE)) {
  throw new Error(`Backupfilen finns redan: ${BACKUP_FILE}. Avbryter för att inte skriva över den.`);
}

const [target] = await query("SELECT * FROM crm_properties WHERE id=?", [TARGET]);
const [source] = await query("SELECT * FROM crm_properties WHERE id=?", [SOURCE]);
const [owner] = await query("SELECT * FROM crm_owners WHERE id=?", [OWNER]);
const [latestSms] = await query(
  "SELECT * FROM crm_inbox_messages WHERE guid=? AND owner_id=? AND direction='in'",
  [SMS_GUID, OWNER],
);

if (!target || !source || !owner || !latestSms) {
  throw new Error("Hittar inte båda objekten, ägaren och det förväntade SMS:et — avbryter.");
}
if (target.owner_id !== OWNER || source.owner_id !== OWNER) {
  throw new Error("Objekten tillhör inte den förväntade uthyraren — avbryter.");
}
if (target.address !== "Granvägen 18" || source.address !== "Granvägen18") {
  throw new Error("Adresserna har ändrats sedan kontrollen — avbryter.");
}

const sourceImages = await query(
  "SELECT * FROM crm_property_images WHERE property_id=? ORDER BY sort_order, created_at",
  [SOURCE],
);
const targetImages = await query(
  "SELECT * FROM crm_property_images WHERE property_id=? ORDER BY sort_order, created_at",
  [TARGET],
);
const sourceR2 = await r2Objects(SOURCE);
const targetR2 = await r2Objects(TARGET);
const targetHashes = new Set(targetR2.map((object) => object.etag).filter(Boolean));
const exactDuplicates = sourceR2.filter((object) => targetHashes.has(object.etag));

if (exactDuplicates.length) {
  throw new Error(`Oväntade exakta bilddubbletter hittades (${exactDuplicates.length}) — avbryter för manuell kontroll.`);
}
if (sourceImages.length !== sourceR2.length) {
  throw new Error(`Bildantalet skiljer sig mellan CRM (${sourceImages.length}) och R2 (${sourceR2.length}) — avbryter.`);
}

const sourceR2ByKey = new Map(sourceR2.map((object) => [object.key, object]));
const maxSort = targetImages.reduce((max, image) => Math.max(max, Number(image.sort_order ?? -1)), -1);
const imageMoves = sourceImages.map((image, index) => {
  const object = sourceR2ByKey.get(image.key);
  if (!object) throw new Error(`R2-objekt saknas för bildraden ${image.id}`);
  const extension = (image.key.split(".").pop() || "bin").toLowerCase();
  return {
    id: image.id,
    oldKey: image.key,
    newKey: `properties/${TARGET}/${nanoid()}.${extension}`,
    sortOrder: maxSort + index + 1,
    etag: object.etag,
    size: object.size,
  };
});

const dependentTables = [
  "crm_property_notes",
  "crm_matches",
  "crm_owner_outreach",
  "crm_agreement_acceptances",
];
const dependents = {};
for (const table of dependentTables) {
  dependents[table] = await query(`SELECT * FROM ${table} WHERE property_id=?`, [SOURCE]);
}
dependents.crm_requests_won = await query("SELECT * FROM crm_requests WHERE won_property_id=?", [SOURCE]);

const backup = {
  createdAt: new Date().toISOString(),
  reason: "Sammanslagning av dubblett Granvägen18 till Granvägen 18",
  target,
  source,
  owner,
  latestSms,
  targetImages,
  sourceImages,
  targetR2,
  sourceR2,
  imageMoves,
  dependents,
  searchIndex: await query("SELECT * FROM crm_search_index WHERE id IN (?,?,?)", [
    `property:${TARGET}`,
    `property:${SOURCE}`,
    `owner:${OWNER}`,
  ]),
};
writeFileSync(BACKUP_FILE, `${JSON.stringify(backup, null, 2)}\n`, { flag: "wx" });
console.log(`Backup skapad: ${BACKUP_FILE}`);

// Kopiera först. De gamla R2-objekten raderas inte förrän databasändringen och
// verifieringen är klara, så bilderna går att återställa om något avbryts.
for (const move of imageMoves) {
  await r2.send(new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${encodeURIComponent(move.oldKey)}`,
    Key: move.newKey,
  }));
  const copied = await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: move.newKey }));
  const copiedEtag = (copied.ETag ?? "").replaceAll('"', "");
  if (Number(copied.ContentLength) !== Number(move.size) || (move.etag && copiedEtag !== move.etag)) {
    throw new Error(`Kontroll av kopierad bild misslyckades: ${move.newKey}`);
  }
}
console.log(`R2: ${imageMoves.length} bilder kopierade och verifierade.`);

const smsNote = `Inkommande SMS från Elvir 2026-09-07:\n${latestSms.body}`;
const latestPriceSummary =
  "Senaste prisuppgift från Elvir via SMS 2026-09-07: 12 000 kr/mån. " +
  "Värme, vatten, sophämtning och bredband kan ingå. El är inte bekräftat som inkluderat.";
const mergedNotes = appendNote(target.notes, source.notes, latestPriceSummary);
const mergedOwnerNotes = appendNote(owner.notes, latestPriceSummary);
const mergedOutreachNote = appendNote(
  dependents.crm_owner_outreach[0]?.note,
  "Elvir har svarat med ny varmhyra och inkluderade kostnader; inväntar bekräftelse om el.",
);

const statements = [
  // Frigör dubblettens nyare slug innan den flyttas till huvudposten.
  { sql: "UPDATE crm_properties SET slug=NULL WHERE id=?", args: [SOURCE] },
  {
    sql: `UPDATE crm_properties SET
      address=?, bedrooms=?, beds=?, bathrooms=?, rent_in=?, availability=?, move_in_from=?,
      status=?, square_meters=?, furnished=?, kitchen=?, garage=?, broadband=?,
      washing_machines=?, dryers=?, notes=?, eget_boende=?, skick=?, inclusions=?,
      country=?, dishwasher=?, all_included=?, excluded_note=?, linens_included=?,
      heat_water_included=?, special_note=?, slug=?, updated_at=?
      WHERE id=?`,
    args: [
      "Granvägen 18",
      source.bedrooms,
      source.beds,
      source.bathrooms,
      12000,
      "Tillgänglig",
      source.move_in_from,
      "available",
      source.square_meters,
      source.furnished,
      source.kitchen,
      source.garage,
      1,
      source.washing_machines,
      source.dryers,
      mergedNotes,
      source.eget_boende,
      source.skick,
      JSON.stringify(["Värme och vatten", "Sophämtning", "Bredband", "Parkering"]),
      source.country,
      source.dishwasher,
      0,
      "El är inte bekräftat som inkluderat.",
      source.linens_included,
      1,
      source.special_note,
      source.slug,
      new Date().toISOString(),
      TARGET,
    ],
  },
  {
    sql: `UPDATE crm_owners SET notes=?, follow_up_date=?, follow_up_reason=?, follow_up_note=?, updated_at=? WHERE id=?`,
    args: [mergedOwnerNotes, FOLLOW_UP_DATE, FOLLOW_UP_REASON, latestPriceSummary, new Date().toISOString(), OWNER],
  },
  ...imageMoves.map((move) => ({
    sql: "UPDATE crm_property_images SET property_id=?, key=?, sort_order=? WHERE id=?",
    args: [TARGET, move.newKey, move.sortOrder, move.id],
  })),
  { sql: "UPDATE crm_property_notes SET property_id=? WHERE property_id=?", args: [TARGET, SOURCE] },
  { sql: "UPDATE crm_agreement_acceptances SET property_id=? WHERE property_id=?", args: [TARGET, SOURCE] },
  { sql: "UPDATE crm_requests SET won_property_id=? WHERE won_property_id=?", args: [TARGET, SOURCE] },
  {
    sql: `UPDATE crm_owner_outreach SET property_id=?, status='i_dialog',
      next_follow_up_date=?, next_follow_up_reason=?, concluded_at=NULL, note=? WHERE property_id=?`,
    args: [TARGET, FOLLOW_UP_DATE, FOLLOW_UP_REASON, mergedOutreachNote, SOURCE],
  },
  {
    sql: `INSERT INTO crm_property_notes
      (id, property_id, channel, content, source, created_at) VALUES (?,?,'sms',?,'crm',?)`,
    args: [nanoid(), TARGET, smsNote, latestSms.sent_at],
  },
];

for (const match of dependents.crm_matches) {
  const duplicate = await query(
    "SELECT id FROM crm_matches WHERE property_id=? AND request_id=?",
    [TARGET, match.request_id],
  );
  statements.push(duplicate.length
    ? { sql: "DELETE FROM crm_matches WHERE id=?", args: [match.id] }
    : { sql: "UPDATE crm_matches SET property_id=? WHERE id=?", args: [TARGET, match.id] });
}

statements.push(
  { sql: "DELETE FROM crm_search_index WHERE id=?", args: [`property:${SOURCE}`] },
  { sql: "DELETE FROM crm_properties WHERE id=?", args: [SOURCE] },
);

await client.batch(statements, "write");
console.log("CRM: data, historik och uppföljning sammanslagna i en transaktion.");

// Återskapa både huvudpostens och ägarens sökindex (ägarens objektantal ändras).
await indexOwner(OWNER);

const [verified] = await query(
  `SELECT p.id,p.address,p.bedrooms,p.beds,p.rent_in,p.availability,p.status,p.slug,
    (SELECT COUNT(*) FROM crm_property_images i WHERE i.property_id=p.id) image_count,
    (SELECT COUNT(*) FROM crm_property_notes n WHERE n.property_id=p.id) note_count,
    (SELECT COUNT(*) FROM crm_matches m WHERE m.property_id=p.id) match_count,
    (SELECT COUNT(*) FROM crm_owner_outreach o WHERE o.property_id=p.id AND o.status='i_dialog') open_dialog_count
   FROM crm_properties p WHERE p.id=?`,
  [TARGET],
);
const [sourceCount] = await query("SELECT COUNT(*) count FROM crm_properties WHERE id=?", [SOURCE]);
const [smsNoteCount] = await query(
  "SELECT COUNT(*) count FROM crm_property_notes WHERE property_id=? AND content=?",
  [TARGET, smsNote],
);

if (
  !verified || Number(sourceCount.count) !== 0 || Number(verified.image_count) !== 19 ||
  Number(verified.match_count) !== 1 || Number(verified.open_dialog_count) !== 1 ||
  Number(smsNoteCount.count) !== 1 || Number(verified.rent_in) !== 12000
) {
  throw new Error(`Verifieringen misslyckades: ${JSON.stringify({ verified, sourceCount, smsNoteCount })}`);
}

for (const move of imageMoves) {
  await r2.send(new DeleteObjectCommand({ Bucket: bucket, Key: move.oldKey }));
}

console.log("KLART", JSON.stringify(verified));
console.log(`R2: ${imageMoves.length} gamla dubblettnycklar borttagna efter godkänd verifiering.`);
