-- CRM email log: utgående (via Resend) och inkommande (webhook/manuell)
CREATE TABLE `crm_emails` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text REFERENCES `crm_companies`(`id`) ON DELETE CASCADE,
	`contact_id` text REFERENCES `crm_contacts`(`id`) ON DELETE SET NULL,
	`owner_id` text REFERENCES `crm_owners`(`id`) ON DELETE SET NULL,
	`direction` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`from_email` text NOT NULL,
	`to_email` text NOT NULL,
	`author_id` text,
	`resend_id` text,
	`is_read` integer DEFAULT true,
	`sent_at` text NOT NULL
);
CREATE INDEX `crm_emails_company_id_idx` ON `crm_emails` (`company_id`);
CREATE INDEX `crm_emails_owner_id_idx` ON `crm_emails` (`owner_id`);
CREATE INDEX `crm_emails_sent_at_idx` ON `crm_emails` (`sent_at`);
