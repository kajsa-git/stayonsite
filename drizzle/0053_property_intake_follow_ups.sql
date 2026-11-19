CREATE TABLE crm_property_intake_follow_ups (
  property_id TEXT PRIMARY KEY NOT NULL REFERENCES crm_properties(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'checking',
  created_at TEXT NOT NULL,
  next_check_at TEXT,
  next_follow_up_on TEXT,
  assessment TEXT,
  notice TEXT,
  reminded_on TEXT
);
--> statement-breakpoint
CREATE INDEX crm_property_intake_follow_ups_check_idx ON crm_property_intake_follow_ups(next_check_at);
