import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  leadSource: text("lead_source"), // kallt | webb | befintlig | referens
  rating: integer("rating"), // 0–10 intern skattning av kund
  invoiceEmail: text("invoice_email"), // separat fakturamail (skiljer sig ofta från kontakt-mail)
  followUpDate: text("follow_up_date"),
  followUpReason: text("follow_up_reason"),
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

export const requests = sqliteTable("crm_requests", {
  id: text("id").primaryKey(),
  requestNumber: integer("request_number"),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  contactId: text("contact_id"),
  city: text("city"),
  status: text("status").default("incoming").notNull(),
  persons: integer("persons"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  budgetMax: real("budget_max"), // vad kunden söker inom (behov)
  furnishedRequired: integer("furnished_required", { mode: "boolean" }),
  garageRequired: integer("garage_required", { mode: "boolean" }),
  monthlyValue: real("monthly_value"), // affärsvärde när fakturerad (utfall)
  wonPropertyId: text("won_property_id"),
  lostReason: text("lost_reason"),
  notes: text("notes"),
  statusChangedAt: text("status_changed_at"),
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
  address: text("address"),
  postalCode: text("postal_code"),
  city: text("city"),
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
  parkingSpaces: integer("parking_spaces"), // antal p-platser (separat från garage)
  skick: text("skick"), // fritext: kondition/standard
  ownerType: text("owner_type"), // privatperson | foretag
  ownerArrangement: text("owner_arrangement"), // direkt | formedlare (förmedlare = ofta dyrare)
  ownerName: text("owner_name"),
  ownerOrgNr: text("owner_org_nr"),
  ownerContactPerson: text("owner_contact_person"),
  ownerPhone: text("owner_phone"),
  ownerEmail: text("owner_email"),
  rentIn: real("rent_in"),
  rentOut: real("rent_out"),
  availability: text("availability"),
  moveInFrom: text("move_in_from"),
  availableTo: text("available_to"),
  notes: text("notes"), // intern beskrivning — aldrig publik
  publicDescription: text("public_description"), // extern beskrivning — visas på hemsidan
  rating: integer("rating"), // 0–10 intern skattning av uthyrare
  links: text("links", { mode: "json" }).$type<string[]>(), // externa länkar (Airbnb/Qasa/Booking/övrigt)
  status: text("status").default("available"),
  published: integer("published", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_properties_city_idx").on(t.city),
  index("crm_properties_status_idx").on(t.status),
  index("crm_properties_move_in_from_idx").on(t.moveInFrom),
  index("crm_properties_beds_idx").on(t.beds),
  index("crm_properties_published_idx").on(t.published),
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
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_notes_company_id_idx").on(t.companyId),
]);

export type Company = typeof companies.$inferSelect;
export type CompanyInsert = typeof companies.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type ContactInsert = typeof contacts.$inferInsert;
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
  createdAt: text("created_at").default(sql`(datetime('now'))`),
}, (t) => [
  index("crm_property_notes_property_id_idx").on(t.propertyId),
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

export type Match = typeof matches.$inferSelect;
export type MatchInsert = typeof matches.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type PropertyNote = typeof propertyNotes.$inferSelect;
export type User = typeof users.$inferSelect;
export type SearchIndexRow = typeof searchIndex.$inferSelect;
export type SearchIndexInsert = typeof searchIndex.$inferInsert;
