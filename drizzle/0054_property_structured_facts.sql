-- Strukturerade svar från bostadsregistreringen så att agenter och matchning kan
-- läsa dem (tidigare bara i intagsanteckningen). NULL = okänt, 0 = nej, 1 = ja.
ALTER TABLE crm_properties ADD property_type TEXT;
--> statement-breakpoint
ALTER TABLE crm_properties ADD shared_laundry INTEGER;
--> statement-breakpoint
ALTER TABLE crm_properties ADD smoke_alarm INTEGER;
--> statement-breakpoint
ALTER TABLE crm_properties ADD fire_extinguisher INTEGER;
--> statement-breakpoint
ALTER TABLE crm_properties ADD burglar_alarm INTEGER;
--> statement-breakpoint
ALTER TABLE crm_properties ADD fireplace INTEGER;
