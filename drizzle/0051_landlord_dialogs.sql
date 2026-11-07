-- Opt-in is per owner, property and Gmail thread. Existing correspondence is
-- never enrolled or replied to merely because a sender exists in the CRM.
CREATE TABLE crm_landlord_dialogs (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES crm_owners(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES crm_properties(id) ON DELETE CASCADE,
  gmail_thread_id TEXT NOT NULL,
  landlord_email TEXT NOT NULL,
  enrolled_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  lease_token TEXT,
  lease_until TEXT,
  last_seen_fingerprint TEXT,
  last_checked_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX crm_landlord_dialogs_thread_unique ON crm_landlord_dialogs(gmail_thread_id);
--> statement-breakpoint
CREATE INDEX crm_landlord_dialogs_property_idx ON crm_landlord_dialogs(property_id);
--> statement-breakpoint
CREATE TABLE crm_landlord_reply_runs (
  gmail_message_id TEXT PRIMARY KEY NOT NULL,
  dialog_id TEXT NOT NULL REFERENCES crm_landlord_dialogs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  draft_body TEXT,
  outbound_gmail_message_id TEXT,
  attachments_need_review INTEGER NOT NULL DEFAULT 0,
  review_notice_attempted_at TEXT,
  follow_up_notice_sent_at TEXT,
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX crm_landlord_reply_runs_status_idx ON crm_landlord_reply_runs(status);
--> statement-breakpoint
CREATE TABLE crm_landlord_agent_health (
  id TEXT PRIMARY KEY NOT NULL,
  last_success_at TEXT,
  last_error_at TEXT,
  failure_started_at TEXT,
  alert_sent_at TEXT,
  lease_token TEXT,
  lease_until TEXT
);
--> statement-breakpoint
CREATE TABLE crm_landlord_sms_dialogs (
  id TEXT PRIMARY KEY NOT NULL,
  owner_id TEXT NOT NULL REFERENCES crm_owners(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL REFERENCES crm_properties(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  enrolled_at TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  last_checked_at TEXT,
  lease_token TEXT,
  lease_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX crm_landlord_sms_dialogs_phone_unique ON crm_landlord_sms_dialogs(phone);
--> statement-breakpoint
CREATE TABLE crm_landlord_sms_receipts (
  guid TEXT PRIMARY KEY NOT NULL,
  conversation_kind TEXT NOT NULL,
  attachment_count INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE crm_landlord_sms_runs (
  inbox_guid TEXT PRIMARY KEY NOT NULL,
  dialog_id TEXT NOT NULL REFERENCES crm_landlord_sms_dialogs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  outbox_id TEXT,
  error TEXT,
  review_notice_sent_at TEXT,
  attachments_need_review INTEGER NOT NULL DEFAULT 0,
  attachment_notice_sent_at TEXT,
  follow_up_notice_sent_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE crm_landlord_image_candidates (
  id TEXT PRIMARY KEY NOT NULL,
  property_id TEXT NOT NULL REFERENCES crm_properties(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL,
  reply_run_id TEXT NOT NULL,
  attachment_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  object_key TEXT,
  error TEXT,
  review_notice_sent_at TEXT,
  lease_token TEXT,
  lease_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX crm_landlord_image_candidates_unique ON crm_landlord_image_candidates(gmail_message_id, attachment_id);
--> statement-breakpoint
CREATE INDEX crm_landlord_image_candidates_status ON crm_landlord_image_candidates(status);
--> statement-breakpoint
CREATE TABLE crm_landlord_property_locks (
  property_id TEXT PRIMARY KEY NOT NULL,
  lease_token TEXT,
  lease_until TEXT
);
