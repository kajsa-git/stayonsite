-- In-/avflyttning på uppdrag (crm_requests):
--   end_date_ongoing   = löpande (avslut tills vidare)
--   move_in_checklist  = JSON-array med avbockade checklist-nycklar (inflytt)
--   move_out_checklist = JSON-array med avbockade checklist-nycklar (avflytt)
--   move_in_done_at    = tidpunkt inflytt klarmarkerad
--   move_out_done_at   = tidpunkt avflytt klarmarkerad
-- Allt nullable och additivt — körs säkert mot live.
ALTER TABLE `crm_requests` ADD `end_date_ongoing` integer;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `move_in_checklist` text;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `move_out_checklist` text;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `move_in_done_at` text;--> statement-breakpoint
ALTER TABLE `crm_requests` ADD `move_out_done_at` text;
