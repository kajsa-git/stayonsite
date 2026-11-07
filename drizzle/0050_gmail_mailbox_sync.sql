CREATE TABLE IF NOT EXISTS crm_gmail_sync_state (
  mailbox text PRIMARY KEY NOT NULL,
  history_id text,
  backfill_after text,
  last_run_at text,
  last_success_at text,
  last_error text,
  last_imported integer DEFAULT 0 NOT NULL,
  updated_at text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS crm_email_sender_suggestions (
  id text PRIMARY KEY NOT NULL,
  email text NOT NULL,
  name text,
  domain text NOT NULL,
  company_ids text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  message_count integer DEFAULT 1 NOT NULL,
  last_gmail_message_id text,
  last_gmail_thread_id text,
  last_subject text,
  last_snippet text,
  last_seen_at text NOT NULL,
  resolved_contact_id text REFERENCES crm_contacts(id) ON DELETE SET NULL,
  resolved_at text,
  created_at text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS crm_email_sender_suggestions_email_unique_idx ON crm_email_sender_suggestions (email);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS crm_email_sender_suggestions_status_idx ON crm_email_sender_suggestions (status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS crm_emails_gmail_thread_id_idx ON crm_emails (gmail_thread_id);
