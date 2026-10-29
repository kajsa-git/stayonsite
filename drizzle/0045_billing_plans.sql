CREATE TABLE `crm_billing_plans` (
  `id` text PRIMARY KEY NOT NULL,
  `company_id` text NOT NULL REFERENCES `crm_companies` (`id`) ON DELETE RESTRICT,
  `request_id` text REFERENCES `crm_requests` (`id`) ON DELETE RESTRICT,
  `property_id` text REFERENCES `crm_properties` (`id`) ON DELETE RESTRICT,
  `source_key` text,
  `accommodation` text NOT NULL,
  `customer_number` text NOT NULL,
  `monthly_amount_minor` integer NOT NULL CHECK (`monthly_amount_minor` > 0),
  `vat_rate` integer NOT NULL CHECK (`vat_rate` IN (0, 6, 12, 25)),
  `vat_included` integer NOT NULL,
  `start_date` text NOT NULL,
  `end_date` text,
  `first_billing_month` text NOT NULL,
  `payment_terms_days` integer NOT NULL,
  `reference` text NOT NULL DEFAULT '',
  `active` integer NOT NULL DEFAULT 1,
  `version` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crm_billing_plans_source_key_idx` ON `crm_billing_plans` (`source_key`);
--> statement-breakpoint
CREATE INDEX `crm_billing_plans_company_id_idx` ON `crm_billing_plans` (`company_id`);
--> statement-breakpoint
CREATE TABLE `crm_billing_periods` (
  `id` text PRIMARY KEY NOT NULL,
  `plan_id` text NOT NULL REFERENCES `crm_billing_plans` (`id`) ON DELETE RESTRICT,
  `month` text NOT NULL,
  `status` text NOT NULL CHECK (`status` IN ('review', 'creating', 'draft', 'failed', 'uncertain')),
  `external_reference` text NOT NULL,
  `snapshot` text NOT NULL,
  `review_id` text NOT NULL,
  `reviewed_by` text NOT NULL,
  `review_expires_at` text NOT NULL,
  `invoice_number` text,
  `invoice_url` text,
  `invoice_total_minor` integer,
  `last_error` text,
  `created_at` text NOT NULL DEFAULT (datetime('now')),
  `updated_at` text NOT NULL DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crm_billing_periods_plan_month_idx` ON `crm_billing_periods` (`plan_id`, `month`);
--> statement-breakpoint
CREATE UNIQUE INDEX `crm_billing_periods_reference_idx` ON `crm_billing_periods` (`external_reference`);
--> statement-breakpoint
CREATE INDEX `crm_billing_periods_plan_id_idx` ON `crm_billing_periods` (`plan_id`);
