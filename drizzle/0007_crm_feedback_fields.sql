ALTER TABLE `crm_companies` ADD `languages` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `postal_code` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `street` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `address_query` text;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `accommodation_from` integer;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `accommodation_to` integer;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `project_duration_months` integer;
--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `billing_project_id` text;
