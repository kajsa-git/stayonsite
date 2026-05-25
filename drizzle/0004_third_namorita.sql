CREATE TABLE `crm_search_index` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`company_id` text,
	`title` text NOT NULL,
	`subtitle` text,
	`keywords` text NOT NULL,
	`route` text NOT NULL,
	`updated_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE INDEX `crm_search_index_entity_type_idx` ON `crm_search_index` (`entity_type`);--> statement-breakpoint
CREATE INDEX `crm_search_index_entity_id_idx` ON `crm_search_index` (`entity_id`);--> statement-breakpoint
CREATE INDEX `crm_search_index_company_id_idx` ON `crm_search_index` (`company_id`);--> statement-breakpoint
CREATE INDEX `crm_search_index_updated_at_idx` ON `crm_search_index` (`updated_at`);--> statement-breakpoint
CREATE INDEX `crm_companies_name_idx` ON `crm_companies` (`name`);--> statement-breakpoint
CREATE INDEX `crm_companies_org_nr_idx` ON `crm_companies` (`org_nr`);--> statement-breakpoint
CREATE INDEX `crm_companies_follow_up_date_idx` ON `crm_companies` (`follow_up_date`);--> statement-breakpoint
CREATE INDEX `crm_companies_rating_idx` ON `crm_companies` (`rating`);--> statement-breakpoint
CREATE INDEX `crm_contacts_company_id_idx` ON `crm_contacts` (`company_id`);--> statement-breakpoint
CREATE INDEX `crm_contacts_name_idx` ON `crm_contacts` (`name`);--> statement-breakpoint
CREATE INDEX `crm_contacts_phone_idx` ON `crm_contacts` (`phone`);--> statement-breakpoint
CREATE INDEX `crm_contacts_email_idx` ON `crm_contacts` (`email`);--> statement-breakpoint
CREATE INDEX `crm_matches_request_id_idx` ON `crm_matches` (`request_id`);--> statement-breakpoint
CREATE INDEX `crm_matches_property_id_idx` ON `crm_matches` (`property_id`);--> statement-breakpoint
CREATE INDEX `crm_matches_status_idx` ON `crm_matches` (`status`);--> statement-breakpoint
CREATE INDEX `crm_matches_follow_up_date_idx` ON `crm_matches` (`follow_up_date`);--> statement-breakpoint
CREATE INDEX `crm_notes_company_id_idx` ON `crm_notes` (`company_id`);--> statement-breakpoint
CREATE INDEX `crm_properties_city_idx` ON `crm_properties` (`city`);--> statement-breakpoint
CREATE INDEX `crm_properties_status_idx` ON `crm_properties` (`status`);--> statement-breakpoint
CREATE INDEX `crm_properties_move_in_from_idx` ON `crm_properties` (`move_in_from`);--> statement-breakpoint
CREATE INDEX `crm_properties_beds_idx` ON `crm_properties` (`beds`);--> statement-breakpoint
CREATE INDEX `crm_properties_published_idx` ON `crm_properties` (`published`);--> statement-breakpoint
CREATE INDEX `crm_property_notes_property_id_idx` ON `crm_property_notes` (`property_id`);--> statement-breakpoint
CREATE INDEX `crm_requests_company_id_idx` ON `crm_requests` (`company_id`);--> statement-breakpoint
CREATE INDEX `crm_requests_status_idx` ON `crm_requests` (`status`);--> statement-breakpoint
CREATE INDEX `crm_requests_city_idx` ON `crm_requests` (`city`);--> statement-breakpoint
CREATE INDEX `crm_requests_status_changed_at_idx` ON `crm_requests` (`status_changed_at`);