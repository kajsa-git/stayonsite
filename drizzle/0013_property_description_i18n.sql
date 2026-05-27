-- Lokaliserade varianter av extern beskrivning + skick (AI-genererade på begäran, redigerbara).
ALTER TABLE `crm_properties` ADD `public_description_en` text;
ALTER TABLE `crm_properties` ADD `public_description_pl` text;
ALTER TABLE `crm_properties` ADD `skick_en` text;
ALTER TABLE `crm_properties` ADD `skick_pl` text;
