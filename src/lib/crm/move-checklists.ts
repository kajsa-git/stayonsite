// Standardchecklistor för in- och avflyttning.
// Alla punkter måste bockas av innan ett uppdrags in- respektive avflytt kan klarmarkeras.
// Lagring: crm_requests.moveInChecklist / moveOutChecklist innehåller listan med avbockade nyckel-id.
// Ändra/utöka punkterna här — befintliga avbockningar matchas på `key`, så behåll nycklarna stabila.

export interface ChecklistItem {
  key: string;
  label: string;
  // Punkt som kan uppfyllas på flera sätt (t.ex. skick med foton ELLER skriftligt).
  // Uppfylld när NÅGON av alternativens key finns i listan; alternativen är
  // ömsesidigt uteslutande i UI:t. Originalnyckeln behålls som ett alternativ så
  // att redan avbockade poster fortsätter räknas (bakåtkompatibelt).
  options?: { key: string; label: string }[];
}

export const MOVE_IN_CHECKLIST: ChecklistItem[] = [
  { key: "contract", label: "Avtal signerat" },
  { key: "keys", label: "Nycklar överlämnade/skickade" },
  { key: "cleaned", label: "Bostad städad & klar" },
  {
    key: "condition",
    label: "Skick dokumenterat",
    options: [
      { key: "condition", label: "Med foton" },
      { key: "condition_note", label: "Utan foton (skriftligt)" },
    ],
  },
  { key: "customer_info", label: "Kund informerad (adress, wifi, instruktioner)" },
];

export const MOVE_IN_CONTRACT_SENT_KEY = "contract_sent";
export const MOVE_IN_CONTRACT_SIGNED_KEY = "contract";

export const hasMoveInContractSent = (checked: string[] | null | undefined) => {
  const set = new Set(checked ?? []);
  return set.has(MOVE_IN_CONTRACT_SENT_KEY) || set.has(MOVE_IN_CONTRACT_SIGNED_KEY);
};

export const hasSignedMoveInContract = (checked: string[] | null | undefined) =>
  new Set(checked ?? []).has(MOVE_IN_CONTRACT_SIGNED_KEY);

export const withMoveInContractSent = (checked: string[] | null | undefined) =>
  Array.from(new Set([...(checked ?? []), MOVE_IN_CONTRACT_SENT_KEY]));

export const withSignedMoveInContract = (checked: string[] | null | undefined) =>
  Array.from(new Set([...(checked ?? []), MOVE_IN_CONTRACT_SENT_KEY, MOVE_IN_CONTRACT_SIGNED_KEY]));

export const MOVE_OUT_CHECKLIST: ChecklistItem[] = [
  { key: "confirmed", label: "Slutdatum bekräftat med kund" },
  { key: "keys_back", label: "Nycklar återlämnade" },
  { key: "cleaning", label: "Slutstädning bokad/utförd" },
  {
    key: "condition",
    label: "Skick kontrollerat",
    options: [
      { key: "condition", label: "Med foton" },
      { key: "condition_note", label: "Skriftligt (ev. skador)" },
    ],
  },
  { key: "available", label: "Objekt åter tillgängligt" },
];

// En punkt är avbockad om dess key finns — eller, för valpunkter, om något av
// alternativen finns.
export const isChecklistItemDone = (item: ChecklistItem, checked: string[] | null | undefined) => {
  const set = new Set(checked ?? []);
  return item.options ? item.options.some((o) => set.has(o.key)) : set.has(item.key);
};

const isComplete = (template: ChecklistItem[], checked: string[] | null | undefined) =>
  template.every((item) => isChecklistItemDone(item, checked));

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
