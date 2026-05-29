-- crm_properties: publik namngivning för listsidan (/boenden) + detaljsidan (/boenden/[slug]).
-- public_name = redigerbar SEO-rubrik (sv), slug = ren URL-nyckel (unik).
-- Paras med scripts/apply-0021-boenden-naming.mjs (samma satser, idempotent mot live).
-- OBS: i live-DB är dessa redan applicerade (2026-05-29). Denna fil är källkods-sanning
-- och körs mot fresh DB / i test. ADD-satser mot live ENBART om kolumnerna saknas.
ALTER TABLE `crm_properties` ADD `public_name` text;--> statement-breakpoint
ALTER TABLE `crm_properties` ADD `slug` text;--> statement-breakpoint
CREATE UNIQUE INDEX `crm_properties_slug_idx` ON `crm_properties` (`slug`);
