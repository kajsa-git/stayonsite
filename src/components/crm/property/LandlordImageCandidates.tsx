"use client";

import { useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { swrFetcher } from "@/lib/crm/fetcher";

type Candidate = { id: string; fileName: string; status: string; error: string | null; gmailMessageId: string; url: string | null };

export function LandlordImageCandidates({ propertyId }: { propertyId: string }) {
  const { data, error, mutate } = useSWR<{ candidates: Candidate[] }>(`/api/crm/properties/${encodeURIComponent(propertyId)}/landlord-images`,
    swrFetcher, { refreshInterval: 30_000 });
  const { mutate: mutateGlobal } = useSWRConfig();
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [saving, setSaving] = useState(false);
  async function addToGallery() {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/crm/properties/${encodeURIComponent(propertyId)}/landlord-images`, { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateId: selected.id, acceptedPublicImpact: true }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Bilden kunde inte läggas till.");
      await Promise.all([mutate(), mutateGlobal(`/api/crm/properties/${propertyId}/images`)]);
      toast.success("Bilden har lagts till för kontroll");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Bilden kunde inte läggas till."); }
    finally { setSaving(false); setSelected(null); }
  }
  if (error) return <p className="mt-3 text-xs text-amber-800">Kunde inte hämta bildbilagornas status.</p>;
  if (!data?.candidates.length) return null;
  return <div className="mt-4 space-y-2 border-t pt-3">
    <p className="text-sm font-medium">Bilder från mejl</p>
    <p className="text-xs text-muted-foreground">Bilderna nedan är privata och visas inte på hemsidan. Kontrollera dem innan du lägger till dem i bostadens galleri.</p>
    <div className="grid grid-cols-2 gap-3">
      {data.candidates.map((candidate) => <div key={candidate.id} className="space-y-1 rounded-md border p-2">
        {candidate.url && <a href={candidate.url} target="_blank" rel="noreferrer" aria-label={`Visa ${candidate.fileName}`}>
          <img src={candidate.url} alt={candidate.fileName} className="aspect-video w-full rounded object-cover" />
        </a>}
        <p className="truncate text-xs font-medium">{candidate.fileName}</p>
        <p className="text-xs text-muted-foreground">{candidate.status === "needs_review" ? candidate.error : "Bilden hanteras…"}</p>
        <a className="text-xs underline" href={`https://mail.google.com/mail/u/0/#all/${encodeURIComponent(candidate.gmailMessageId)}`} target="_blank" rel="noreferrer">Öppna mejlet</a>
        {candidate.status === "needs_review" && candidate.url && <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => setSelected(candidate)}>Lägg till i galleriet</Button>}
      </div>)}
    </div>
    <AlertDialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Lägg till bilden?</AlertDialogTitle>
          <AlertDialogDescription>Kontrollen av bostadens bilder och beskrivning startar om. Om bostaden redan visas kan visningen på hemsidan eller i prospekt tillfälligt påverkas. Automatisk publicering följer bostadens befintliga inställning.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Avbryt</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); void addToGallery(); }}>Lägg till bilden</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>;
}
