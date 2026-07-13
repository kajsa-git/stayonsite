"use client";

// Snabbredigering av ett objekt i en modal — "poppas" från förslagskortet i
// matchningsvyn så korrigeringar (pris, bäddar, beskrivning, bilder-länkar)
// kan göras utan att lämna flödet. Återanvänder PropertyEditForm oförändrad.

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { PropertyEditForm } from "./PropertyEditForm";

export function PropertyEditModal({
  property,
  onClose,
  onSaved,
}: {
  property: PropertyWithOwner | null;
  onClose: () => void;
  onSaved: () => void; // mutera listorna så kortet och formuläret resynkas
}) {
  async function update(data: Partial<PropertyWithOwner>) {
    if (!property) return;
    const res = await fetch(`/api/crm/properties/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast({ title: "Kunde inte spara objektet", variant: "destructive" });
      throw new Error(`properties PATCH → ${res.status}`);
    }
    toast({ title: "Objektet uppdaterat" });
    onSaved();
  }

  return (
    <Dialog open={!!property} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property?.address || "Objekt"}</DialogTitle>
        </DialogHeader>
        {property && <PropertyEditForm property={property} onUpdate={update} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
