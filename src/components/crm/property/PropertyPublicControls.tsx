"use client";

import { toast } from "@/components/ui/use-toast";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { CopyBoendeLink } from "./CopyBoendeLink";
import { CopyProspektLink } from "./CopyProspektLink";

// Publicering — hemsidan (published) och prospekt-länken (prospektPublished) styrs
// oberoende av varandra. Ren utbrytning ur PropertyView, oförändrat beteende.
export function PropertyPublicControls({
  property,
  onUpdate,
}: {
  property: PropertyWithOwner;
  onUpdate: (data: Partial<PropertyWithOwner>) => Promise<void>;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Publicering</p>
      <div className="space-y-2">
        {/* På hemsidan (publika listan /boenden — kräver även status = Tillgänglig) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              try {
                await onUpdate({ published: !property.published });
                toast({ title: property.published ? "Borttagen från hemsidan" : "Publicerad på hemsidan" });
              } catch {
                /* feltoast visas av onUpdate */
              }
            }}
            className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-colors ${
              property.published
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-white border-input text-muted-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200"
            }`}
          >
            {property.published ? "✓ På hemsidan" : "Publicera på hemsidan"}
          </button>
          {property.published &&
            (property.slug ? (
              <CopyBoendeLink slug={property.slug} />
            ) : (
              <span className="text-[11px] text-muted-foreground">Publik URL skapas när du sparar med en ort</span>
            ))}
          {property.published && property.status !== "available" && (
            <span className="text-[11px] text-amber-700">Syns i listan först när status = Tillgänglig</span>
          )}
        </div>

        {/* Prospekt-länk (delbar säljlänk — oberoende av hemsidan och status) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              try {
                await onUpdate({ prospektPublished: !property.prospektPublished });
                toast({ title: property.prospektPublished ? "Prospekt-länk avstängd" : "Prospekt-länk aktiv" });
              } catch {
                /* feltoast visas av onUpdate */
              }
            }}
            className={`text-xs px-2.5 py-1 rounded-md border font-semibold transition-colors ${
              property.prospektPublished
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-white border-input text-muted-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200"
            }`}
          >
            {property.prospektPublished ? "✓ Prospekt-länk" : "Aktivera prospekt-länk"}
          </button>
          {property.prospektPublished && <CopyProspektLink propertyId={property.id} />}
        </div>
      </div>
    </div>
  );
}
