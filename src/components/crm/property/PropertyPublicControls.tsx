"use client";

import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { crmFetchJson } from "@/lib/crm/fetcher";
import { hasWebsitePropertyStatus, publicListingPatch } from "@/lib/crm/publication";
import { publicDisplayName } from "@/lib/crm/slug";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { PublishConfirmSmsDialog } from "./PublishConfirmSmsDialog";
import { ShareLinkButton } from "./ShareLinkButton";

// Publicering — hemsidan (published) och prospekt-länken (prospektPublished) styrs
// oberoende av varandra. Delningstexten använder bara publikt säkra fält
// (publikt namn + ort) — aldrig adress/ägare/pris.
export function PropertyPublicControls({
  property,
  onUpdate,
}: {
  property: PropertyWithOwner;
  onUpdate: (data: Partial<PropertyWithOwner>) => Promise<void>;
}) {
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const displayName = publicDisplayName(
    property.publicName,
    {
      city: property.city,
      bedrooms: property.bedrooms,
      beds: property.beds,
    },
    property.slug,
  );

  // Efter publicering: erbjud bekräftelse-SMS till uthyraren — men bara om numret
  // finns, publik URL finns, och länken inte redan skickats/utkastats till numret.
  async function maybeOfferConfirmSms() {
    const { ownerPhone, slug } = property;
    if (!ownerPhone || !slug) return;
    try {
      const history = await crmFetchJson<{ body: string }[]>(
        `/api/crm/messages?phone=${encodeURIComponent(ownerPhone)}`,
      );
      if (history.some((m) => m.body.includes(`/boenden/${slug}`))) return;
    } catch {
      /* historiken är bara en dubblettspärr — erbjud hellre än att tyst låta bli */
    }
    setSmsDialogOpen(true);
  }

  const toggleCls = (on: boolean) =>
    `text-sm px-3 py-1.5 rounded-md border font-semibold transition-colors ${
      on
        ? "bg-green-100 text-green-800 border-green-300"
        : "bg-white border-input text-muted-foreground hover:bg-green-50 hover:text-green-700 hover:border-green-200"
    }`;
  const approved = property.contentReviewStatus === "approved";
  const websiteStatusAllowed = hasWebsitePropertyStatus(property.status, property.publishConsentAt);
  const isPublic = approved && !!property.published && websiteStatusAllowed;

  return (
    <div>
      <div className="space-y-2">
        {/* Hemsidans publicering styrs separat från uthyrningsstatus. */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={async () => {
              const publishing = !property.published;
              try {
                await onUpdate(publicListingPatch(publishing));
                toast({ title: publishing
                  ? websiteStatusAllowed ? "Publicerad på hemsidan" : "Publicering aktiverad, men statusen hindrar visning"
                  : "Borttagen från hemsidan" });
              } catch {
                /* feltoast visas av onUpdate */
                return;
              }
              if (publishing && approved && websiteStatusAllowed) await maybeOfferConfirmSms();
            }}
            disabled={!approved && !property.published}
            className={toggleCls(isPublic)}
          >
            {isPublic ? "✓ På hemsidan" : property.published ? "Pausa publicering" : "Publicera på hemsidan"}
          </button>
          {isPublic &&
            (property.slug ? (
              <ShareLinkButton
                path={`/boenden/${property.slug}`}
                title={displayName}
                text={displayName}
                label="Dela publik länk"
              />
            ) : (
              <span className="text-[11px] text-muted-foreground">Publik URL skapas när du sparar med en ort</span>
            ))}
          {property.published && !websiteStatusAllowed && (
            <span className="text-[11px] text-amber-700">Kontrollera publiceringsmedgivandet för den aktuella statusen.</span>
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
            disabled={!approved && !property.prospektPublished}
            className={toggleCls(approved && !!property.prospektPublished)}
          >
            {approved && property.prospektPublished ? "✓ Prospekt-länk" : property.prospektPublished ? "Pausa prospekt-länk" : "Aktivera prospekt-länk"}
          </button>
          {approved && property.prospektPublished && (
            <ShareLinkButton
              path={`/prospekt/${property.id}`}
              title={displayName}
              text={displayName}
              label="Dela prospekt-länk"
            />
          )}
        </div>
      </div>

      {smsDialogOpen && property.ownerId && property.ownerPhone && property.slug && (
        <PublishConfirmSmsDialog
          open={smsDialogOpen}
          onOpenChange={setSmsDialogOpen}
          ownerId={property.ownerId}
          ownerName={property.ownerName}
          ownerPhone={property.ownerPhone}
          slug={property.slug}
        />
      )}
    </div>
  );
}
