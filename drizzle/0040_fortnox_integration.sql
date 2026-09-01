CREATE TABLE `crm_integrations` (
  `provider` text PRIMARY KEY NOT NULL,
  `access_token` text,
  `refresh_token` text,
  `token_type` text,
  `scope` text,
  `expires_at` integer,
  `refresh_token_expires_at` integer,
  `refresh_lock_id` text,
  `refresh_locked_until` text,
  `connected_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `fortnox_invoice_number` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `fortnox_invoice_url` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `fortnox_invoice_created_at` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `fortnox_invoice_error` text;
