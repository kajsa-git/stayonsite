"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { swrFetcher } from "@/lib/crm/fetcher";

type Run = { inboxGuid: string; status: string; error: string | null; attachmentsNeedReview: boolean };
type Dialog = { id: string; active: boolean; phone: string; recentRuns: Run[] };
type Data = { dialogs: Dialog[]; macConnected: boolean; workerHealthy: boolean };

export function LandlordSmsAutomation({ propertyId }: { propertyId: string }) {
  const { data, error, mutate } = useSWR<Data>(`/api/crm/landlord-sms-dialogs?propertyId=${encodeURIComponent(propertyId)}`,
    swrFetcher, { refreshInterval: 30_000 });
  const [saving, setSaving] = useState(false);
  const dialog = data?.dialogs[0];

  async function change(method: "POST" | "PATCH" | "PUT", body: object) {
    setSaving(true);
    try {
      const response = await fetch("/api/crm/landlord-sms-dialogs", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Kunde inte spara inställningen.");
      await mutate();
      toast.success(method === "PUT" ? "Kontrollen är sparad" : "Inställningen är sparad");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Kunde inte spara inställningen."); }
    finally { setSaving(false); }
  }

  if (error) return <p className="text-sm text-amber-800">Kunde inte hämta inställningen för automatiska SMS-svar.</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Hämtar inställningen för automatiska SMS-svar…</p>;
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Automatiska SMS-svar för detta boende</span>
      <Badge variant={dialog?.active ? "default" : "outline"}>{dialog?.active ? "Påslaget" : "Av"}</Badge>
      <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => change(dialog ? "PATCH" : "POST", dialog ? { id: dialog.id, active: !dialog.active } : { propertyId })}>
        {dialog?.active ? "Pausa" : "Slå på"}
      </Button>
    </div>
    <p className="text-xs text-muted-foreground">Nya svar från uthyrarens nummer kopplas till detta boende. SMS kan skickas när din Mac är på, vaken och uppkopplad.</p>
    {dialog?.active && (!data.macConnected || !data.workerHealthy) && <p className="text-xs text-amber-800">
      {!data.macConnected ? "Mac-agenten har inte hörts av nyligen. " : ""}
      {!data.workerHealthy ? "SMS-bevakningen har inte bekräftats nyligen eller har stött på ett fel." : ""}
    </p>}
    {dialog?.recentRuns.filter((run) => run.status === "needs_review" || run.attachmentsNeedReview).map((run) => <Alert key={run.inboxGuid}>
      <AlertDescription className="flex flex-col items-start gap-2">
        {run.status === "needs_review" && <span>SMS-dialogen behöver din kontroll. {run.error} Kontrollera i Meddelanden om ett svar redan har skickats innan du svarar igen.</span>}
        {run.attachmentsNeedReview && <span>Kontrollera bilagorna i Meddelanden och lägg in relevanta bilder på bostaden i CRM.</span>}
        <Button type="button" size="sm" variant="outline" disabled={saving} onClick={() => change("PUT", { inboxGuid: run.inboxGuid, checked: true })}>Jag har kontrollerat</Button>
      </AlertDescription>
    </Alert>)}
  </div>;
}
