// Recheck unresolved entries against the final policy, on a local snapshot only.
import {readFile,writeFile} from 'node:fs/promises';
import {eq} from 'drizzle-orm';
import {db} from '../src/lib/crm/db';
import {properties} from '../src/lib/crm/schema';
import {inspectPropertyContent} from '../src/lib/crm/property-content-review';
if(!process.env.TURSO_DATABASE_URL?.startsWith('file:'))throw Error('Local snapshot required');
const path=process.argv[2];
const rows=JSON.parse(await readFile(path,'utf8'));
let cursor=0,done=0;let flush=Promise.resolve();
const pending=rows.filter((r:any)=>!r.report||r.report.reasons.length);
async function worker(){while(cursor<pending.length){const r=pending[cursor++];try{
 if(r.report)await db.update(properties).set({contentReviewReport:r.report}).where(eq(properties.id,r.id));
 const review=await inspectPropertyContent(r.id);Object.assign(r,{sourceHash:review.sourceHash,values:review.values,report:review.report});delete r.error;
 }catch(e){r.error=String(e)}
 done++;console.log(JSON.stringify({done,total:pending.length,address:r.address,reasons:r.report?.reasons,error:r.error}));
 const snapshot=JSON.stringify(rows,null,2);flush=flush.then(()=>writeFile(path,snapshot,{mode:0o600}));await flush;
}}
await Promise.all(Array.from({length:4},worker));await flush;
