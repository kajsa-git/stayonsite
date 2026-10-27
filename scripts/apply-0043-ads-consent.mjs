import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

try {
  const result = await client.execute('PRAGMA table_info(crm_requests)');
  const existing = new Set(result.rows.map((row) => String(row.name)));
  for (const name of ['gads_consent', 'gads_consent_captured_at']) {
    if (!existing.has(name)) {
      await client.execute(`ALTER TABLE crm_requests ADD COLUMN ${name} text`);
    }
  }
  const verified = await client.execute('PRAGMA table_info(crm_requests)');
  const names = new Set(verified.rows.map((row) => String(row.name)));
  if (!names.has('gads_consent') || !names.has('gads_consent_captured_at')) {
    throw new Error('Consent columns could not be verified');
  }
  console.log('Ads consent columns are present; existing records remain unchanged.');
} finally {
  client.close();
}
