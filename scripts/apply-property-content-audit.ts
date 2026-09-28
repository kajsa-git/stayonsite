// Apply a prepared audit only when the live facts and image identities still match.
// Usage: tsx --env-file=.env --env-file=.env.local scripts/apply-property-content-audit.ts audit.json --apply
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/crm/db";
import { properties, propertyImages, type Property } from "../src/lib/crm/schema";
import { propertyContentHash, type ContentReport } from "../src/lib/crm/property-content-policy";
import { autoPublishReviewedProperty } from "../src/lib/crm/property-content-review";
import { indexProperty } from "../src/lib/crm/search-index";
const path = process.argv[2];
if (!path) throw new Error("Audit file required");
const audit = JSON.parse(await readFile(path, "utf8")) as {id:string;sourceHash?:string;values?:Partial<Property>;report?:ContentReport}[];
const apply = process.argv.includes("--apply");
const backup = await db.select().from(properties);
await mkdir("tmp", {recursive:true});
await writeFile(`tmp/property-content-backup-${Date.now()}.json`, JSON.stringify(backup,null,2), {mode:0o600});
const results: {id:string;status:string}[]=[];
for (const review of audit) {
  if (!review.report || !review.sourceHash) { results.push({id:review.id,status:"retry"}); continue; }
  const status = await db.transaction(async(tx)=>{
    const [p]=await tx.select().from(properties).where(eq(properties.id,review.id));
    const images=await tx.select({id:propertyImages.id,key:propertyImages.key}).from(propertyImages).where(eq(propertyImages.propertyId,review.id));
    if(!p || propertyContentHash(p,images)!==review.sourceHash) return "changed";
    const status=review.report!.reasons.length?"needs_review":"approved";
    if(apply){
      const safeValues=status==="approved"?review.values??{}:{};
      const original=p.contentReviewOriginal??Object.fromEntries(["publicName","publicDescription","publicDescriptionEn","publicDescriptionPl","skick","skickEn","skickPl","inclusions","inclusionsEn","inclusionsPl"].map(key=>[key,p[key as keyof Property]]));
      await tx.update(properties).set({...safeValues,contentReviewOriginal:original,contentReviewStatus:status,contentReviewHash:propertyContentHash({...p,...safeValues},images),contentReviewReport:review.report,contentReviewedAt:new Date().toISOString(),updatedAt:new Date().toISOString()}).where(eq(properties.id,p.id));
    }
    return status;
  });
  if(apply && status==="approved") await autoPublishReviewedProperty(review.id);
  if(apply && status!=="changed") await indexProperty(review.id);
  results.push({id:review.id,status});
}
await writeFile("tmp/property-content-apply-results.json",JSON.stringify(results,null,2),{mode:0o600});
console.log(JSON.stringify({apply,counts:results.reduce((acc,r)=>({...acc,[r.status]:(acc[r.status]??0)+1}),{} as Record<string,number>)}));
