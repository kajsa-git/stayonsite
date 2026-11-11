CREATE TABLE crm_property_intake_notifications (
  property_id TEXT PRIMARY KEY NOT NULL REFERENCES crm_properties(id) ON DELETE CASCADE,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  owner_type TEXT,
  address TEXT,
  city TEXT,
  created_at TEXT NOT NULL,
  last_activity_at TEXT NOT NULL,
  completed_at TEXT,
  failed_images INTEGER NOT NULL DEFAULT 0,
  interrupted_notified_at TEXT,
  completed_notified_at TEXT,
  active_kind TEXT,
  message_snapshot TEXT,
  lease_token TEXT,
  lease_until TEXT,
  retry_after TEXT
);
--> statement-breakpoint
CREATE INDEX crm_property_intake_notifications_activity_idx ON crm_property_intake_notifications(last_activity_at);
