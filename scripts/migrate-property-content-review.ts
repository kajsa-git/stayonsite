// Idempotent, additive migration for the production rollout.
import {createClient} from '@libsql/client';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const client=createClient({url:process.env.TURSO_DATABASE_URL!,authToken:process.env.TURSO_AUTH_TOKEN});
const columns=await client.execute('PRAGMA table_info(crm_properties)');
const names=new Set(columns.rows.map(r=>r.name));
const sql=await readFile(new URL('../drizzle/0042_property_content_review.sql',import.meta.url),'utf8');
for(const statement of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean)){
 const column=statement.match(/ADD COLUMN (\w+)/)?.[1];
 if(column && names.has(column))continue;
 await client.execute(statement.replace('CREATE INDEX ','CREATE INDEX IF NOT EXISTS '));
}
// Register the exact migration so the normal Drizzle migrator will not rerun DDL.
await client.execute('CREATE TABLE IF NOT EXISTS __drizzle_migrations (id SERIAL PRIMARY KEY, hash text NOT NULL, created_at numeric)');
const hash=createHash('sha256').update(sql).digest('hex');
const journal=JSON.parse(await readFile(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
const entry=journal.entries.find((e:{tag:string})=>e.tag==='0042_property_content_review');
await client.execute({sql:'INSERT INTO __drizzle_migrations (hash, created_at) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM __drizzle_migrations WHERE created_at = ?)',args:[hash,entry.when,entry.when]});
console.log('Property content review migration ready.');client.close();
