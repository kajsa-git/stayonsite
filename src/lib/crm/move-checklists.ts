// Standardchecklistor för in- och avflyttning.
// Alla punkter måste bockas av innan ett uppdrags in- respektive avflytt kan klarmarkeras.
// Lagring: crm_requests.moveInChecklist / moveOutChecklist innehåller listan med avbockade nyckel-id.
// Ändra/utöka punkterna här — befintliga avbockningar matchas på `key`, så behåll nycklarna stabila.

export interface ChecklistItem {
  key: string;
  label: string;
}

export const MOVE_IN_CHECKLIST: ChecklistItem[] = [
  { key: "contract", label: "Avtal signerat" },
  { key: "keys", label: "Nycklar överlämnade/skickade" },
  { key: "cleaned", label: "Bostad städad & klar" },
  { key: "condition", label: "Skick dokumenterat (foton)" },
  { key: "customer_info", label: "Kund informerad (adress, wifi, instruktioner)" },
];

export const MOVE_OUT_CHECKLIST: ChecklistItem[] = [
  { key: "confirmed", label: "Slutdatum bekräftat med kund" },
  { key: "keys_back", label: "Nycklar återlämnade" },
  { key: "cleaning", label: "Slutstädning bokad/utförd" },
  { key: "condition", label: "Skick kontrollerat (foton, ev. skador)" },
  { key: "available", label: "Objekt åter tillgängligt" },
];

const isComplete = (template: ChecklistItem[], checked: string[] | null | undefined) => {
  const set = new Set(checked ?? []);
  return template.every((item) => set.has(item.key));
};

export const isMoveInChecklistComplete = (checked: string[] | null | undefined) =>
  isComplete(MOVE_IN_CHECKLIST, checked);

export const isMoveOutChecklistComplete = (checked: string[] | null | undefined) =>
  isComplete(MOVE_OUT_CHECKLIST, checked);

// Är start-/slutdatum giltigt nog för att fakturera? (start krävs; slut krävs ELLER löpande)
export const hasValidInvoiceDates = (r: {
  startDate?: string | null;
  endDate?: string | null;
  endDateOngoing?: boolean | null;
}) => !!r.startDate && (!!r.endDate || !!r.endDateOngoing);
