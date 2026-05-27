-- Huvudbild: markera vilken bild som visas som hjälte i prospekt/OG.
ALTER TABLE `crm_property_images` ADD `is_primary` integer DEFAULT false;
