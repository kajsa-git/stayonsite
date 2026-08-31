ALTER TABLE `crm_emails` ADD `request_id` text REFERENCES `crm_requests`(`id`) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `accommodation_type` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `parking_required` integer;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `kitchen_required` integer;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `laundry_required` integer;
--> statement-breakpoint
CREATE INDEX `crm_emails_request_id_idx` ON `crm_emails` (`request_id`);
--> statement-breakpoint
CREATE TABLE `crm_request_qualifications` (
  `request_id` text PRIMARY KEY NOT NULL REFERENCES `crm_requests`(`id`) ON DELETE CASCADE,
  `company_id` text NOT NULL REFERENCES `crm_companies`(`id`) ON DELETE CASCADE,
  `contact_id` text REFERENCES `crm_contacts`(`id`) ON DELETE SET NULL,
  `locale` text DEFAULT 'sv' NOT NULL,
  `subject` text NOT NULL,
  `status` text DEFAULT 'sending' NOT NULL,
  `provider` text,
  `provider_message_id` text,
  `gmail_message_id` text,
  `gmail_thread_id` text,
  `sent_at` text,
  `last_processed_message_id` text,
  `last_reply_at` text,
  `attempt_count` integer DEFAULT 0 NOT NULL,
  `last_error` text,
  `created_at` text DEFAULT (datetime('now')),
  `updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `crm_request_qualifications_company_id_idx` ON `crm_request_qualifications` (`company_id`);
--> statement-breakpoint
CREATE INDEX `crm_request_qualifications_status_idx` ON `crm_request_qualifications` (`status`);
--> statement-breakpoint
CREATE INDEX `crm_request_qualifications_thread_id_idx` ON `crm_request_qualifications` (`gmail_thread_id`);
