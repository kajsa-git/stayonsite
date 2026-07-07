"use client";

// JA-flödet: när en uthyrare svarat ja öppnas denna dialog från Svar-panelen.
// Per objekt: generera publik beskrivning (AI) → publicera → länk-SMS som UTKAST.
// "Kör hela flödet" gör alla tre stegen i följd. Inget SMS skickas härifrån —
// utkastet godkänns separat i Utkast-panelen.
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { publishedLinkSms } from "@/lib/crm/sms-templates";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";

interface PropRow {
  id: string;
  address: string | null;
  city: string | null;
  status: string | null;
  published: boolean | null;
  publicDescription: string | null;
  slug: string | null;
  bedrooms: number | null;
  beds: number | null;
  bathrooms: number | null;
  squareMeters: number | null;
  postalCode: string | null;
  furnished: boolean | null;
  kitchen: boolean | null;
  garage: boolean | null;
  broadband: boolean | null;
  egetBoende: boolean | null;
  parkingSpaces: number | null;
  washingMachines: number | null;
  dryers: number | null;
  skick: string | null;
  moveInFrom: string | null;
  availableTo: string | null;
}

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className={`inline-block text-[11px] px-1.5 py-0.5 rounded ${ok ? "bg-green-100 text-green-800" : "bg-nordic-100 text-nordic-600"}`}>
      {ok ? yes : no}
    </span>
  );
}

export function PublishFlowDialog({
  ownerId,
  ownerName,
  ownerPhone,
  open,
  onOpenChange,
  onDrafted,
}: {
  ownerId: string;
  ownerName: string | null;
  ownerPhone: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDrafted?: () => void;
}) {
  const { data, mutate, isLoading } = useSWR<PropRow[]>(
    open ? `/api/crm/properties?ownerId=${encodeURIComponent(ownerId)}` : null,
    swrFetcher,
  );
  const props = data ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);
  const [step, setStep] = useState<string>("");

  async function ensureDescription(p: PropRow): Promise<void> {
    if (p.publicDescription?.trim()) return;
    setStep("Skriver beskrivning…");
    const { description } = await crmFetchJson<{ description: string }>(`/api/crm/properties/${p.id}/describe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: p.city,
        postalCode: p.postalCode,
        squareMeters: p.squareMeters,
        bedrooms: p.bedrooms,
        beds: p.beds,
        bathrooms: p.bathrooms,
        furnished: p.furnished,
        kitchen: p.kitchen,
        garage: p.garage,
        broadband: p.broadband,
        egetBoende: p.egetBoende,
        parkingSpaces: p.parkingSpaces,
        washingMachines: p.washingMachines,
        dryers: p.dryers,
        skick: p.skick,
        moveInFrom: p.moveInFrom,
        availableTo: p.availableTo,
      }),
    });
    await crmFetchJson(`/api/crm/properties/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicDescription: description }),
    });
  }

  async function publish(p: PropRow): Promise<string | null> {
    setStep("Publicerar…");
    const updated = await crmFetchJson<{ slug?: string | null; published?: boolean }>(`/api/crm/properties/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: true }),
    });
    return updated?.slug ?? null;
  }

  async function draftLinkSms(slug: string) {
    if (!ownerPhone) return;
    setStep("Skapar SMS-utkast…");
    await crmFetchJson("/api/crm/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toPhone: ownerPhone, ownerId, draft: true, body: publishedLinkSms(ownerName, slug) }),
    });
    onDrafted?.();
  }

  async function run(p: PropRow, what: "describe" | "publish" | "sms" | "all") {
    setBusyId(p.id);
    try {
      if (what === "describe") await ensureDescription(p);
      if (what === "publish") await publish(p);
      if (what === "sms") {
        if (!p.slug) throw new Error("Publik URL saknas — publicera först.");
        await draftLinkSms(p.slug);
        toast({ title: "Länk-SMS sparat som utkast — godkänn i Utkast-panelen" });
      }
      if (what === "all") {
        await ensureDescription(p);
        const slug = p.published && p.slug ? p.slug : await publish(p);
        if (slug && ownerPhone) {
          await draftLinkSms(slug);
          toast({ title: "Klart: beskrivning + publicerad + SMS-utkast (godkänn i Utkast-panelen)" });
        } else if (slug) {
          toast({ title: "Klart: beskrivning + publicerad (uthyraren saknar telefonnummer för SMS)" });
        } else {
          toast({ title: "Publicerad, men publik URL saknas — öppna objektet och spara med ort", variant: "destructive" });
        }
      }
      await mutate();
    } catch (e) {
      toast({ title: "Något gick fel", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusyId(null);
      setStep("");
    }
  }

  const btn = "text-[11px] px-2 py-1 rounded border border-input bg-white text-nordic-700 hover:bg-nordic-100 disabled:opacity-40 transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publicera åt {ownerName ?? "uthyraren"}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Beskrivning skrivs av AI, objektet publiceras (endast postnummer visas, aldrig adress) och länk-SMS:et
          läggs som <b>utkast</b> — inget skickas förrän du godkänner det.
        </p>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Hämtar objekt…
          </div>
        ) : props.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4">Uthyraren har inga objekt i CRM:et.</p>
        ) : (
          <div className="space-y-2.5">
            {props.map((p) => (
              <div key={p.id} className="rounded-lg border p-3">
                <div className="font-medium text-sm">{p.address ?? "(adress saknas)"}{p.city ? ` · ${p.city}` : ""}</div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <Badge ok={!!p.publicDescription?.trim()} yes="Beskrivning ✓" no="Beskrivning saknas" />
                  <Badge ok={!!p.published} yes="Publicerad ✓" no="Ej publicerad" />
                  {p.status !== "available" && (
                    <span className="inline-block text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Status: {p.status} — visas publikt först som Tillgänglig
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-dashed">
                  <button
                    className="text-[11px] px-2 py-1 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold disabled:opacity-40 transition-colors"
                    disabled={busyId !== null}
                    onClick={() => run(p, "all")}
                  >
                    🚀 Kör hela flödet
                  </button>
                  <button className={btn} disabled={busyId !== null || !!p.publicDescription?.trim()} onClick={() => run(p, "describe")}>
                    ✨ Beskrivning
                  </button>
                  <button className={btn} disabled={busyId !== null || !!p.published} onClick={() => run(p, "publish")}>
                    Publicera
                  </button>
                  <button className={btn} disabled={busyId !== null || !p.published || !p.slug || !ownerPhone} onClick={() => run(p, "sms")}>
                    Länk-SMS-utkast
                  </button>
                  {p.published && p.slug && (
                    <a
                      className="text-[11px] text-nordic-600 underline ml-auto"
                      href={`https://www.stayonsite.se/boenden/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visa publikt →
                    </a>
                  )}
                </div>
                {busyId === p.id && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {step || "Arbetar…"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
