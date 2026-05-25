CREATE TABLE `crm_accounts` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `crm_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`org_nr` text,
	`category` text,
	`website` text,
	`follow_up_date` text,
	`follow_up_reason` text,
	`assigned_to` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `crm_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`name` text,
	`phone` text,
	`email` text,
	`is_primary` integer DEFAULT false,
	FOREIGN KEY (`company_id`) REFERENCES `crm_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`channel` text NOT NULL,
	`content` text NOT NULL,
	`author_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`company_id`) REFERENCES `crm_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_properties` (
	`id` text PRIMARY KEY NOT NULL,
	`address` text,
	`city` text,
	`bedrooms` integer,
	`beds` integer,
	`bathrooms` integer,
	`owner_name` text,
	`owner_phone` text,
	`owner_email` text,
	`rent_in` real,
	`rent_out` real,
	`availability` text,
	`move_in_from` text,
	`status` text DEFAULT 'available',
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `crm_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`request_number` integer,
	`company_id` text NOT NULL,
	`contact_id` text,
	`city` text,
	`status` text DEFAULT 'incoming' NOT NULL,
	`persons` integer,
	`start_date` text,
	`end_date` text,
	`monthly_value` real,
	`won_property_id` text,
	`lost_reason` text,
	`notes` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`company_id`) REFERENCES `crm_companies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_sessions` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `crm_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `crm_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`approved` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `crm_users_email_unique` ON `crm_users` (`email`);--> statement-breakpoint
CREATE TABLE `crm_verification_tokens` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL
);
