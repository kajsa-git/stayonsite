import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { KalkylScenario } from "./kalkyl";

// Auth.js required tables — column types must match @auth/drizzle-adapter expectations exactly
export const users = sqliteTable("crm_users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  approved: integer("approved", { mode: "boolean" }).default(false).notNull(),
});

export const accounts = sqliteTable("crm_accounts", {
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = sqliteTable("crm_sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable("crm_verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const companies = sqliteTable("crm_companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  orgNr: text("org_nr"),
  category: text("category"),
  website: text("website"),
  leadSource: text("lead_source"), // kallt | webb | befintlig | referens | qasa | airbnb
  rating: integer("rating"), // 0–10 intern skattning av kund
  invoiceEmail: text("invoice_email"), // separat fakturamail (skiljer sig ofta från kontakt-mail)
  languages: text("languages", { mode: "json" }).$type<string[]>(), // språk för utskick/segmentering
  customerNumber: text("customer_number"), // kundnr (extern referens, t.ex. Fortnox)
  street: text("street"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country"),
  followUpDate: text("follow_up_date"),
  followUpReason: text("follow_up_reason"),
  followUpTime: text("follow_up_time"), // HH:MM (default 08:00 i UI) — sortering inom dagen
  assignedTo: text("assigned_to"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_companies_name_idx").on(t.name),
  index("crm_companies_org_nr_idx").on(t.orgNr),
  index("crm_companies_follow_up_date_idx").on(t.followUpDate),
  index("crm_companies_rating_idx").on(t.rating),
]);

export const contacts = sqliteTable("crm_contacts", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
}, (t) => [
  index("crm_contacts_company_id_idx").on(t.companyId),
  index("crm_contacts_name_idx").on(t.name),
  index("crm_contacts_phone_idx").on(t.phone),
  index("crm_contacts_email_idx").on(t.email),
]);

export const owners = sqliteTable("crm_owners", {
  id: text("id").primaryKey(),
  ownerType: text("owner_type"), // privatperson | foretag
  ownerArrangement: text("owner_arrangement"), // direkt | formedlare
  name: text("name").notNull(),
  orgNr: text("org_nr"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  rating: integer("rating"), // 0–10 intern skattning av uthyrare
  followUpDate: text("follow_up_date"),
  followUpReason: text("follow_up_reason"),
  followUpNote: text("follow_up_note"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_owners_name_idx").on(t.name),
  index("crm_owners_org_nr_idx").on(t.orgNr),
  index("crm_owners_phone_idx").on(t.phone),
  index("crm_owners_email_idx").on(t.email),
  index("crm_owners_follow_up_date_idx").on(t.followUpDate),
]);

export const requests = sqliteTable("crm_requests", {
  id: text("id").primaryKey(),
  requestNumber: integer("request_number"),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: text("contact_id"),
  city: text("city"),
  postalCode: text("postal_code"),
  street: text("street"),
  addressQuery: text("address_query"), // frivillig adress/autocomplete-fritext
  status: text("status").default("incoming").notNull(),
  persons: integer("persons"),
  accommodationFrom: integer("accommodation_from"), // utgått ur UI (ersatt av sovrum/bäddar-spann)
  accommodationTo: integer("accommodation_to"),
  bedroomsFrom: integer("bedrooms_from"),
  bedroomsTo: integer("bedrooms_to"),
  bedsFrom: integer("beds_from"),
  bedsTo: integer("beds_to"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  endDateOngoing: integer("end_date_ongoing", { mode: "boolean" }), // löpande: avslut tills vidare (inget bestämt slutdatum)
  projectDurationMonths: integer("project_duration_months"),
  budgetMax: real("budget_max"), // vad kunden söker inom (behov)
  furnishedRequired: integer("furnished_required", { mode: "boolean" }),
  garageRequired: integer("garage_required", { mode: "boolean" }),
  monthlyValue: real("monthly_value"), // affärsvärde när fakturerad (utfall)
  billingProjectId: text("billing_project_id"), // Fortnox/projekt-id, default kan vara requestNumber
  wonPropertyId: text("won_property_id"),
  lostReason: text("lost_reason"),
  // Annonsattribution: Google klick-ID (gclid) från landningssidan. Bärs hela
  // vägen från formuläret hit så Offline Conversion Import kan attribuera
  // leadet/affären till annonsklicket utan cookies.
  gclid: text("gclid"),
  gclidCapturedAt: text("gclid_captured_at"),
  // Idempotens för uppladdade offline-konverteringar — sätts när raden laddats
  // upp till Google Ads så vi aldrig laddar upp samma konvertering två gånger.
  gadsLeadUploadedAt: text("gads_lead_uploaded_at"),
  gadsWonUploadedAt: text("gads_won_uploaded_at"),
  notes: text("notes"),
  statusChangedAt: text("status_changed_at"),
  // In-/avflyttning: checklistor (avbockade nyckel-id) + tidpunkt klarmarkerad.
  // Checklistans mallar bor i src/lib/crm/move-checklists.ts — här lagras bara vad som är avbockat.
  moveInChecklist: text("move_in_checklist", { mode: "json" }).$type<string[]>(),
  moveOutChecklist: text("move_out_checklist", { mode: "json" }).$type<string[]>(),
  moveInDoneAt: text("move_in_done_at"),
  moveOutDoneAt: text("move_out_done_at"),
  // "Förlängs ej": kunden har flyttat/avböjt förlängning → döljer kortet i
  // Min dags förlängningsradar. Rör inte affärsstatus eller avflyttens checklista.
  renewalDismissedAt: text("renewal_dismissed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_requests_company_id_idx").on(t.companyId),
  index("crm_requests_status_idx").on(t.status),
  index("crm_requests_city_idx").on(t.city),
  index("crm_requests_status_changed_at_idx").on(t.statusChangedAt),
]);

export const properties = sqliteTable("crm_properties", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").references(() => owners.id, { onDelete: "set null" }),
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
  country: text("country"), // tomt/null = Sverige; sätts för utländska objekt
  squareMeters: real("square_meters"),
  bedrooms: integer("bedrooms"),
  beds: integer("beds"),
  bathrooms: integer("bathrooms"),
  furnished: integer("furnished", { mode: "boolean" }),
  kitchen: integer("kitchen", { mode: "boolean" }),
  garage: integer("garage", { mode: "boolean" }),
  broadband: integer("broadband", { mode: "boolean" }),
  egetBoende: integer("eget_boende", { mode: "boolean" }), // ej delat med andra
  washingMachines: integer("washing_machines"),
  dryers: integer("dryers"),
  dishwasher: integer("dishwasher", { mode: "boolean" }), // diskmaskin
  parkingSpaces: integer("parking_spaces"), // antal p-platser (separat från garage)
  // Vad ingår i hyran — diskreta booleans + textfält för undantag
  allIncluded: integer("all_included", { mode: "boolean" }), // exakt allt ingår i hyran
  excludedNote: text("excluded_note"), // om något INTE ingår, vad?
  linensIncluded: integer("linens_included", { mode: "boolean" }), // sängkläder + handduk
  heatWaterIncluded: integer("heat_water_included", { mode: "boolean" }), // värme + varmvatten
  specialNote: text("special_note"), // något särskilt vi bör veta
  skick: text("skick"), // fritext: kondition/standard
  // Uthyrarens identitet (namn/typ/kontakt/betyg) bor i owners-tabellen — länkas via ownerId.
  // Objektet speglar dem aldrig längre; läsvägar hämtar via JOIN (mergeOwnerIntoProperty).
  rentIn: real("rent_in"),
  rentOut: real("rent_out"),
  availability: text("availability"),
  moveInFrom: text("move_in_from"),
  availableTo: text("available_to"),
  notes: text("notes"), // intern beskrivning — aldrig publik
  // Publik namngivning för listsidan/detaljsidan. publicName = redigerbar SEO-rubrik (sv),
  // slug = ren URL-nyckel (unik). Genereras deterministiskt om de lämnas tomma (se slug.ts).
  publicName: text("public_name"),
  slug: text("slug"),
  publicDescription: text("public_description"), // extern beskrivning (sv, källtext) — visas på hemsidan
  // Lokaliserade varianter av extern beskrivning/skick (AI-genererade på begäran, redigerbara).
  publicDescriptionEn: text("public_description_en"),
  publicDescriptionPl: text("public_description_pl"),
  skickEn: text("skick_en"),
  skickPl: text("skick_pl"),
  // "Vad ingår" — manuell lista (sv) + lokaliserade varianter.
  inclusions: text("inclusions", { mode: "json" }).$type<string[]>(),
  inclusionsEn: text("inclusions_en", { mode: "json" }).$type<string[]>(),
  inclusionsPl: text("inclusions_pl", { mode: "json" }).$type<string[]>(),
  // "Avstånd" — manuella platser med auto-räknat km/min (språkneutrala platsnamn).
  distances: text("distances", { mode: "json" }).$type<{ label: string; address?: string; km: number; minutes: number }[]>(),
  // Uthyrar-uppföljning bor i crm_owner_outreach (rundor) — inte längre speglat på objektet.
  links: text("links", { mode: "json" }).$type<string[]>(), // externa länkar (Airbnb/Qasa/Booking/övrigt)
  status: text("status").default("available"),
  published: integer("published", { mode: "boolean" }).default(false), // visas i publika listan /boenden (kräver även status=available)
  prospektPublished: integer("prospekt_published", { mode: "boolean" }).default(false), // delbar /prospekt-länk aktiv (oberoende av hemsidan/status)
  // Uthyrarens publiceringsgodkännande — bevis, skrivs aldrig om när satt.
  // Godkännandet är att annonsen FÅR visas online; Kajsa publicerar fortfarande manuellt.
  publishConsentAt: text("publish_consent_at"),
  publishConsentName: text("publish_consent_name"),
  publishConsentSource: text("publish_consent_source"), // web | sms | crm
  publishConsentIp: text("publish_consent_ip"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_properties_city_idx").on(t.city),
  index("crm_properties_status_idx").on(t.status),
  index("crm_properties_move_in_from_idx").on(t.moveInFrom),
  index("crm_properties_beds_idx").on(t.beds),
  index("crm_properties_published_idx").on(t.published),
  index("crm_properties_owner_id_idx").on(t.ownerId),
  uniqueIndex("crm_properties_slug_idx").on(t.slug),
]);

// Kontaktrundor mot uthyrare — en episod per objekt, ofta utlöst av en förfrågan.
// Öppen runda = status ej i (bekraftad, nej). Driver "Följ upp uthyrare"-kön via nextFollowUpDate.
export const ownerOutreach = sqliteTable("crm_owner_outreach", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  ownerId: text("owner_id").references(() => owners.id, { onDelete: "set null" }), // denormaliserat för kö/visning
  requestId: text("request_id").references(() => requests.id, { onDelete: "set null" }), // valfri utlösare
  status: text("status").notNull().default("ej_kontaktad"), // ej_kontaktad | kontaktad | i_dialog | bekraftad | nej
  startedAt: text("started_at").default(sql`(datetime('now'))`),
  nextFollowUpDate: text("next_follow_up_date"),
  nextFollowUpReason: text("next_follow_up_reason"),
  concludedAt: text("concluded_at"), // sätts när status → bekraftad/nej
  note: text("note"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_owner_outreach_property_id_idx").on(t.propertyId),
  index("crm_owner_outreach_owner_id_idx").on(t.ownerId),
  index("crm_owner_outreach_request_id_idx").on(t.requestId),
  index("crm_owner_outreach_next_follow_up_date_idx").on(t.nextFollowUpDate),
  index("crm_owner_outreach_status_idx").on(t.status),
]);

// Förslag/matchningar — kopplar en förfrågan till flera objekt (många-till-många)
export const matches = sqliteTable("crm_matches", {
  id: text("id").primaryKey(),
  requestId: text("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("suggested"), // suggested | sent | accepted | rejected
  matchScore: real("match_score"),
  sentAt: text("sent_at"),
  followUpDate: text("follow_up_date"), // jaga hyresvärd: när höra av sig igen
  followUpReason: text("follow_up_reason"), // kort anledning för uppföljningen
  // Scenariokalkyl för paret förfrågan × boende — bara antaganden lagras,
  // nyckeltalen räknas vid visning. Se src/lib/crm/kalkyl.ts.
  kalkyl: text("kalkyl", { mode: "json" }).$type<KalkylScenario[]>(),
  // Stämplade affärsvillkor — låses när erbjudandet skickas (offer*, stämpel = sentAt)
  // respektive när villkoren bekräftas med uthyraren (promised*, stämpel = promisedAt).
  // Objektets rentIn/rentOut kan ändras efteråt; dessa fält skrivs ALDRIG om.
  offerRentOut: real("offer_rent_out"), // pris till kund för denna affär, kr/mån
  offerStartDate: text("offer_start_date"),
  offerEndDate: text("offer_end_date"),
  offerOngoing: integer("offer_ongoing", { mode: "boolean" }), // löpande, som requests.endDateOngoing
  offerNote: text("offer_note"), // extern notis till kund — visas i erbjudandelänken
  promisedRentIn: real("promised_rent_in"), // hyra utlovad till uthyraren, kr/mån
  promisedStartDate: text("promised_start_date"),
  promisedEndDate: text("promised_end_date"),
  promisedConditions: text("promised_conditions"), // villkor mot uthyraren (uppsägning, städ …)
  promisedAt: text("promised_at"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_matches_request_id_idx").on(t.requestId),
  index("crm_matches_property_id_idx").on(t.propertyId),
  index("crm_matches_status_idx").on(t.status),
  index("crm_matches_follow_up_date_idx").on(t.followUpDate),
]);

export const notes = sqliteTable("crm_notes", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id"),
  source: text("source").notNull().default("crm"), // crm | mcp — vem skapade raden
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_notes_company_id_idx").on(t.companyId),
]);

export type Company = typeof companies.$inferSelect;
export type CompanyInsert = typeof companies.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type ContactInsert = typeof contacts.$inferInsert;
export type Owner = typeof owners.$inferSelect;
export type OwnerInsert = typeof owners.$inferInsert;
export type Request = typeof requests.$inferSelect;
export type RequestInsert = typeof requests.$inferInsert;
export type Property = typeof properties.$inferSelect;
export type PropertyInsert = typeof properties.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NoteInsert = typeof notes.$inferInsert;
export const propertyImages = sqliteTable("crm_property_images", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  key: text("key").notNull(), // R2 object key
  fileName: text("file_name"),
  sortOrder: integer("sort_order").default(0),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false), // huvudbild i prospekt/OG
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Kontaktlogg på objektnivå (kontakt med uthyrare om bostaden)
export const propertyNotes = sqliteTable("crm_property_notes", {
  id: text("id").primaryKey(),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id"),
  source: text("source").notNull().default("crm"), // crm | mcp — vem skapade raden
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_property_notes_property_id_idx").on(t.propertyId),
]);

// Utkorg för iMessage/SMS: CRM:t köar meddelanden här, Mac-agenten
// (scripts/imessage-agent.mjs, launchd var 30:e sekund) skickar via Messages.app
// och rapporterar tillbaka status. queued → sending → sent | failed.
export const outboxMessages = sqliteTable("crm_outbox_messages", {
  id: text("id").primaryKey(),
  toPhone: text("to_phone").notNull(), // E.164
  body: text("body").notNull(),
  ownerId: text("owner_id"),
  contactId: text("contact_id"),
  status: text("status").notNull().default("queued"), // queued | sending | sent | failed
  error: text("error"),
  source: text("source").notNull().default("crm"), // crm | mcp — vem skapade raden
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  sentAt: text("sent_at"),
}, (t) => [
  index("crm_outbox_messages_status_idx").on(t.status),
  index("crm_outbox_messages_to_phone_idx").on(t.toPhone),
]);

// Denormaliserat sökindex — en rad per sökbar entitet (company/request/property/note/contact).
// id = `${entityType}:${entityId}` så upserts blir idempotenta.
export const searchIndex = sqliteTable("crm_search_index", {
  id: text("id").primaryKey(),
  entityType: text("entity_type").notNull(), // company | request | property | note | contact
  entityId: text("entity_id").notNull(),
  companyId: text("company_id"),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  keywords: text("keywords").notNull(), // gemener, mellanslagsseparerat — söks med LIKE
  route: text("route").notNull(),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_search_index_entity_type_idx").on(t.entityType),
  index("crm_search_index_entity_id_idx").on(t.entityId),
  index("crm_search_index_company_id_idx").on(t.companyId),
  index("crm_search_index_updated_at_idx").on(t.updatedAt),
]);

export const emails = sqliteTable("crm_emails", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  ownerId: text("owner_id").references(() => owners.id, { onDelete: "set null" }),
  direction: text("direction").notNull(), // 'out' | 'in'
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  html: text("html"),
  fromEmail: text("from_email").notNull(),
  toEmail: text("to_email").notNull(),
  authorId: text("author_id"),   // crm_user id för utgående/manuell loggning
  resendId: text("resend_id"),
  gmailMessageId: text("gmail_message_id"),
  gmailThreadId: text("gmail_thread_id"),
  isRead: integer("is_read", { mode: "boolean" }).default(true),
  sentAt: text("sent_at").notNull(),
}, (t) => [
  index("crm_emails_company_id_idx").on(t.companyId),
  index("crm_emails_owner_id_idx").on(t.ownerId),
  index("crm_emails_sent_at_idx").on(t.sentAt),
  // Idempotent Gmail-synk: samma meddelande får aldrig dubblas. NULL (utgående/manuella
  // mejl utan gmail-id) räknas som distinkta i SQLite, så de krockar inte.
  uniqueIndex("crm_emails_gmail_message_id_unique_idx").on(t.gmailMessageId),
]);

export type Match = typeof matches.$inferSelect;
export type MatchInsert = typeof matches.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type PropertyNote = typeof propertyNotes.$inferSelect;
export type User = typeof users.$inferSelect;
export type SearchIndexRow = typeof searchIndex.$inferSelect;
export type SearchIndexInsert = typeof searchIndex.$inferInsert;
export type Email = typeof emails.$inferSelect;
export type EmailInsert = typeof emails.$inferInsert;
export type OwnerOutreach = typeof ownerOutreach.$inferSelect;
export type OwnerOutreachInsert = typeof ownerOutreach.$inferInsert;

// Inkommande iMessage/SMS-svar: Mac-agenten läser ~/Library/Messages/chat.db och
// postar hit — ENDAST avsändare vars nummer redan finns i CRM:et (ägare/kontakter),
// övriga meddelanden lämnas orörda på Macen. guid = chat.db:s meddelande-guid →
// idempotent ingest (unikt index). Visas i Min dag ("Svar") och på korten.
export const inboxMessages = sqliteTable("crm_inbox_messages", {
  id: text("id").primaryKey(),
  guid: text("guid").notNull(),
  fromPhone: text("from_phone").notNull(), // E.164 — motpartens nummer oavsett riktning
  body: text("body").notNull(),
  service: text("service"), // iMessage | SMS
  direction: text("direction").notNull().default("in"), // in = från kontakten | out = Kajsas svar (från Messages)
  sentAt: text("sent_at").notNull(), // när meddelandet togs emot/skickades (ISO, från Apple-epoch)
  ownerId: text("owner_id"), // matchad uthyrare (lös referens — FK är av i libSQL)
  contactId: text("contact_id"),
  companyId: text("company_id"), // via matchad kontakt
  isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  uniqueIndex("crm_inbox_messages_guid_idx").on(t.guid),
  index("crm_inbox_messages_from_phone_idx").on(t.fromPhone),
  index("crm_inbox_messages_is_read_idx").on(t.isRead),
  index("crm_inbox_messages_owner_id_idx").on(t.ownerId),
  index("crm_inbox_messages_company_id_idx").on(t.companyId),
  index("crm_inbox_messages_sent_at_idx").on(t.sentAt),
]);

export type InboxMessage = typeof inboxMessages.$inferSelect;
export type InboxMessageInsert = typeof inboxMessages.$inferInsert;

// Tokeniserade externa länkar — kundens erbjudandesida (/erbjudande/<token>) och
// uthyrarens sida (fas 3). token = nanoid(32) och ÄR behörigheten: den som har
// länken ser sin projektion av affären. En aktiv länk per (audience, ärende);
// rotation = återkalla + skapa ny. Lösa referenser — FK är av i libSQL, radering
// sker via cascade-delete.ts.
export const shareLinks = sqliteTable("crm_share_links", {
  id: text("id").primaryKey(),
  token: text("token").notNull(), // nanoid(32) — URL-kapabilitet, delas aldrig upp per fält
  audience: text("audience").notNull(), // tenant | landlord
  requestId: text("request_id"), // kundlänk: satt. Fristående uthyrarlänk: null.
  matchId: text("match_id"), // satt för affärsknuten uthyrarlänk (visar villkoren för en affär)
  ownerId: text("owner_id"), // satt för FRISTÅENDE uthyrarlänk — uppdragsavtalet skickas före någon affär
  createdBy: text("created_by"), // crm_users.id
  revokedAt: text("revoked_at"), // null = aktiv
  expiresAt: text("expires_at"), // valfri TTL
  lastViewedAt: text("last_viewed_at"),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  uniqueIndex("crm_share_links_token_idx").on(t.token),
  index("crm_share_links_request_id_idx").on(t.requestId),
  index("crm_share_links_match_id_idx").on(t.matchId),
  index("crm_share_links_owner_id_idx").on(t.ownerId),
]);

export type ShareLink = typeof shareLinks.$inferSelect;
export type ShareLinkInsert = typeof shareLinks.$inferInsert;

// Signerade avtal: kundens uppdragsbekräftelse (request-scope, gate i erbjudandelänken)
// och uthyrarens uthyrningsuppdrag (owner+property-scope, fas 3). Avtalstexterna
// versioneras i kod (src/lib/crm/avtal.ts) — ny version ⇒ befintlig accept matchar
// inte längre och gaten visas igen. Raden är ett bevis: skrivs aldrig om, bara till.
export const agreementAcceptances = sqliteTable("crm_agreement_acceptances", {
  id: text("id").primaryKey(),
  agreementType: text("agreement_type").notNull(), // uppdragsbekraftelse | uthyrningsuppdrag
  version: text("version").notNull(), // måste matcha aktuell version i avtal.ts
  requestId: text("request_id"), // via vilken förfrågan signeringen skedde (kund)
  companyId: text("company_id"), // AVTALSSCOPE kund: uppdragsbekräftelsen gäller företaget i 12 mån
  ownerId: text("owner_id"), // AVTALSSCOPE uthyrare: uthyrningsuppdraget gäller uthyraren (alla objekt) i 12 mån
  propertyId: text("property_id"), // via vilket objekt signeringen skedde (affärsknuten uthyrarlänk)
  shareLinkId: text("share_link_id"), // via vilken länk godkännandet gjordes
  acceptedName: text("accepted_name").notNull(), // namnet parten skrev vid godkännandet
  acceptedAt: text("accepted_at").notNull(), // ISO-stämpel
  userAgent: text("user_agent"),
  ip: text("ip"), // klientens IP vid godkännandet (bevissäkring — nämns i avtalsfoten)
  language: text("language"), // sv | en — vilken språkversion som visades vid godkännandet
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_agreement_acceptances_request_id_idx").on(t.requestId),
  index("crm_agreement_acceptances_company_id_idx").on(t.companyId),
  index("crm_agreement_acceptances_owner_id_idx").on(t.ownerId),
  index("crm_agreement_acceptances_type_idx").on(t.agreementType),
]);

export type AgreementAcceptance = typeof agreementAcceptances.$inferSelect;
export type AgreementAcceptanceInsert = typeof agreementAcceptances.$inferInsert;

// Påminnelselogg för osignerade uthyrningsuppdrag från bostadsregistreringen.
// Del 2 av formuläret (signeringen) kan hoppas över — cron:en
// app/api/cron/agreement-reminders skickar då påminnelser med signeringslänken
// och loggar varje utskick här. Raderna skrivs aldrig om, bara till.
// Lösa referenser — FK är av i libSQL, radering via cascade-delete.ts.
export const agreementReminders = sqliteTable("crm_agreement_reminders", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id").notNull(),
  shareLinkId: text("share_link_id"),
  channel: text("channel").notNull(), // email | crm_followup (uthyrare utan e-post → uppföljningskön)
  recipient: text("recipient"), // e-postadressen vid channel=email
  reminderNo: integer("reminder_no").notNull(), // 1 | 2 — max två påminnelser per uthyrare
  sentAt: text("sent_at").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_agreement_reminders_owner_id_idx").on(t.ownerId),
]);

export type AgreementReminder = typeof agreementReminders.$inferSelect;
export type AgreementReminderInsert = typeof agreementReminders.$inferInsert;

// Händelselogg per affär — varje omstämpling av villkor sparas med en KOPIA av
// värdena. Förhandlingen snurrar (pris, löptid, vad som ingår) mellan visning
// och slutgiltigt avtal; loggen är spåret som visar vad som erbjöds/lovades när.
// Raderna skrivs aldrig om, bara till. Lösa referenser — radering via cascade-delete.ts.
export const matchEvents = sqliteTable("crm_match_events", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull(),
  requestId: text("request_id"), // denormaliserat för tidslinje per förfrågan
  actor: text("actor").notNull(), // internal | tenant | landlord
  type: text("type").notNull(), // offer_terms | promised_terms | ...
  data: text("data", { mode: "json" }).$type<Record<string, unknown>>(), // kopia av villkoren vid stämplingen
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_match_events_match_id_idx").on(t.matchId),
  index("crm_match_events_request_id_idx").on(t.requestId),
]);

export type MatchEvent = typeof matchEvents.$inferSelect;
export type MatchEventInsert = typeof matchEvents.$inferInsert;
