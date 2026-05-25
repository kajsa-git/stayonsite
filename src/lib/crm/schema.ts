import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  followUpDate: text("follow_up_date"),
  followUpReason: text("follow_up_reason"),
  assignedTo: text("assigned_to"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const contacts = sqliteTable("crm_contacts", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  isPrimary: integer("is_primary", { mode: "boolean" }).default(false),
});

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
  monthlyValue: real("monthly_value"),
  wonPropertyId: text("won_property_id"),
  lostReason: text("lost_reason"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const properties = sqliteTable("crm_properties", {
  id: text("id").primaryKey(),
  address: text("address"),
  city: text("city"),
  bedrooms: integer("bedrooms"),
  beds: integer("beds"),
  bathrooms: integer("bathrooms"),
  ownerName: text("owner_name"),
  ownerPhone: text("owner_phone"),
  ownerEmail: text("owner_email"),
  rentIn: real("rent_in"),
  rentOut: real("rent_out"),
  availability: text("availability"),
  moveInFrom: text("move_in_from"),
  status: text("status").default("available"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const notes = sqliteTable("crm_notes", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

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
export type User = typeof users.$inferSelect;
