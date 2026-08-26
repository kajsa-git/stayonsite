// Kanoniska etiketter för en förfrågans status. Importeras överallt en status visas
// som badge, så samma tillstånd aldrig heter olika saker i olika vyer.
//
// OBS: detta är STATUS-etiketten (tillståndet). Kö-/kolumnnamn ("Ska faktureras",
// "Öppna uppdrag" …) är ett separat, handlingsinriktat ordförråd och bor på annat håll.
export const REQUEST_STATUS_LABEL: Record<string, string> = {
  incoming: "Inkommen",
  matching: "Matchar",
  won: "Vunnen",
  invoiced: "Fakturerad",
  lost: "Nej tack",
  archived: "Arkiverad",
};

// Valfri kanonisk färgpalett (utan ram) för enkla badges. Komponenter med egen
// ram-stil behåller sin egen — men färgfamiljerna här matchar dem.
export const REQUEST_STATUS_STYLE: Record<string, string> = {
  incoming: "bg-blue-50 text-blue-800",
  matching: "bg-amber-50 text-amber-800",
  won: "bg-green-50 text-green-800",
  invoiced: "bg-emerald-50 text-emerald-700",
  lost: "bg-rose-50 text-rose-700",
  archived: "bg-nordic-100 text-nordic-600",
};

export function requestStatusLabel(status: string): string {
  return REQUEST_STATUS_LABEL[status] ?? status;
}
