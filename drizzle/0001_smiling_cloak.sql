ALTER TABLE `crm_requests` ADD `status_changed_at` text;
UPDATE `crm_requests` SET `status_changed_at` = COALESCE(`updated_at`, `created_at`, datetime('now')) WHERE `status_changed_at` IS NULL;