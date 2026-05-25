CREATE TABLE `crm_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`property_id` text NOT NULL,
	`status` text DEFAULT 'suggested' NOT NULL,
	`match_score` real,
	`sent_at` text,
	`follow_up_date` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`request_id`) REFERENCES `crm_requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`property_id`) REFERENCES `crm_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_property_images` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`key` text NOT NULL,
	`file_name` text,
	`sort_order` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`property_id`) REFERENCES `crm_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_property_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`property_id` text NOT NULL,
	`channel` text NOT NULL,
	`content` text NOT NULL,
	`author_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`property_id`) REFERENCES `crm_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `crm_companies` ADD `lead_source` text;--> statement-breakpoint
ALTER TABLE `crm_companies` ADD `rating` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `postal_code` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `square_meters` real;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `furnished` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `kitchen` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `garage` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `broadband` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `eget_boende` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `washing_machines` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `dryers` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `parking_spaces` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `skick` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_type` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_arrangement` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_org_nr` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `owner_contact_person` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `available_to` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `public_description` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `rating` integer;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `links` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `published` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `updated_at` text DEFAULT (datetime('now'));--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `budget_max` real;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `furnished_required` integer;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `garage_required` integer;