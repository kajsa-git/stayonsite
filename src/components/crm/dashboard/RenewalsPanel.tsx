"use client";

// Förlängningsradarn: vunna/fakturerade affärer vars slutdatum är inom −7…+30
// dagar. Härifrån: förläng-SMS som UTKAST, öppna företaget eller boka återkomst
// (+7 d döljer kortet — kontakten är då schemalagd i "Att kontakta").
import { toast } from "@/components/ui/use-toast";
import { plusDaysStockholm, todayStockholm } from "@/lib/crm/date";
import { crmErrorMessage, crmFetchJson } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { renewalSms } from "@/lib/crm/sms-templates";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface RenewalRow {
  requestId: string;
  requestNumber: number | null;
  companyId: string;
  companyName: string;
  contactName: string | null;
  contactPhone: string | null;
  city: string | null;
  endDate: string | null;
  monthlyValue: number | null;
  status: string;
}

export function RenewalsPanel({ renewals, onChanged }: { renewals: RenewalRow[]; onChanged: () => void }) {
  const router = useRouter();
  const today = todayStockholm();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editorFor, setEditorFor] = useState<string | null>(null);
  const [smsText, setSmsText] = useState("");

  if (renewals.length === 0) return null;

  async function sendSms(r: RenewalRow) {
    if (!r.contactPhone || !smsText.trim()) return;
    setBusyId(r.requestId);
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: r.contactPhone, body: smsText.trim() }),
      });
      toast({ title: "Förläng-SMS skickas inom ~30 sek" });
      setEditorFor(null);
    } catch (e) {
      toast({ title: "Kunde inte skicka", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  async function snooze(r: RenewalRow) {
    setBusyId(r.requestId);
    try {
      await crmFetchJson(`/api/crm/companies/${r.companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          followUpDate: plusDaysStockholm(7),
          followUpReason: `Förlängning — avtal t.o.m. ${r.endDate ?? "?"}`,
        }),
      });
      toast({ title: "Återkomst bokad om 7 dagar" });
      onChanged();
    } catch (e) {
      toast({ title: "Kunde inte boka återkomst", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  const btn = "text-[11px] px-2 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40 transition-colors";

  return (
    <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span>🔁</span>
        <h2 className="text-sm font-semibold text-nordic-900">Förlängningar</h2>
        <span className="text-xs font-bold text-orange-800 bg-orange-100 rounded-full px-2 py-0.5">{renewals.length}</span>
        <span className="text-[11px] text-muted-foreground ml-1 hidden sm:inline">Avtal som löper mot sitt slutdatum — hör av dig innan de tar slut</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {renewals.map((r) => {
          const daysLeft = r.endDate
            ? Math.round((new Date(r.endDate).getTime() - new Date(today).getTime()) / 86400000)
            : null;
          const urgency =
            daysLeft == null
              ? "bg-nordic-100 text-nordic-700"
              : daysLeft < 0
                ? "bg-red-100 text-red-800"
                : daysLeft <= 7
                  ? "bg-red-100 text-red-800"
                  : daysLeft <= 14
                    ? "bg-amber-100 text-amber-800"
                    : "bg-nordic-100 text-nordic-700";
          return (
            <div key={r.requestId} className="rounded-lg bg-white border p-3">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-medium text-sm">{r.companyName}</span>
                <span className="text-xs text-muted-foreground">{r.city ?? ""}</span>
                {r.endDate && (
                  <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ml-auto ${urgency}`}>
                    {daysLeft != null && daysLeft < 0
                      ? `Slut ${r.endDate} (${-daysLeft} d sedan)`
                      : daysLeft === 0
                        ? "Slutar idag"
                        : `Slut ${r.endDate} (${daysLeft} d)`}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {[
                  r.monthlyValue ? `${Math.round(r.monthlyValue).toLocaleString("sv-SE")} kr/mån` : null,
                  r.contactName,
                  formatPhoneSv(r.contactPhone),
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </div>
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-dashed">
                <button
                  className="text-[11px] px-2 py-0.5 rounded border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 font-semibold disabled:opacity-40 transition-colors"
                  disabled={busyId !== null || !r.contactPhone}
                  title={r.contactPhone ? "Förifyllt SMS — justera och skicka" : "Kontakten saknar telefonnummer"}
                  onClick={() => {
                    if (editorFor !== r.requestId) setSmsText(renewalSms(r.contactName, r.city, r.endDate));
                    setEditorFor(editorFor === r.requestId ? null : r.requestId);
                  }}
                >
                  ✉️ Förläng-SMS
                </button>
                <button className={btn} onClick={() => router.push(`/crm/company/${r.companyId}?request=${r.requestId}`)}>
                  Öppna
                </button>
                <button className={btn} disabled={busyId !== null} onClick={() => snooze(r)}>
                  Återkomst +7 d
                </button>
              </div>
              {editorFor === r.requestId && (
                <div className="mt-2 space-y-1.5">
                  <textarea
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />
                  <div className="flex gap-1.5">
                    <button
                      className="text-[11px] px-2 py-1 rounded border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100 font-semibold disabled:opacity-40"
                      disabled={busyId !== null || !smsText.trim()}
                      onClick={() => sendSms(r)}
                    >
                      Skicka
                    </button>
                    <button className={btn} onClick={() => setEditorFor(null)}>
                      Avbryt
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
