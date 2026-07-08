"use client";

// Uthyrarsidan: NAV, inte redigerare — kontaktuppgifter med inline-spara,
// objektlista (länkar till Objektsbanken), SMS-kompositör (direktsändning),
// samlad kommunikationstidslinje och e-posttråd. Objektredigering/publicering
// bor kvar i Objektsbanken och JA-flödet.
import { EmailThread } from "@/components/crm/email/EmailThread";
import { PhoneActions } from "@/components/crm/PhoneActions";
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { OwnerTimeline } from "./OwnerTimeline";

interface OwnerFull {
  id: string;
  name: string;
  ownerType: string | null;
  ownerArrangement: string | null;
  orgNr: string | null;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  rating: number | null;
  followUpDate: string | null;
  followUpReason: string | null;
  notes: string | null;
  properties: {
    id: string;
    address: string | null;
    city: string | null;
    status: string | null;
    published: boolean | null;
    prospektPublished: boolean | null;
    slug: string | null;
    bedrooms: number | null;
    beds: number | null;
    rentIn: number | null;
    rentOut: number | null;
  }[];
}

const TYPE_LABEL: Record<string, string> = { privatperson: "Privatperson", foretag: "Företag" };
const ARR_LABEL: Record<string, string> = { direkt: "Direktavtal", formedlare: "Förmedlare" };
const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  available: { label: "Tillgänglig", cls: "bg-green-100 text-green-800" },
  reserved: { label: "Reserverad", cls: "bg-amber-100 text-amber-800" },
  rented: { label: "Uthyrd", cls: "bg-blue-100 text-blue-800" },
  off_market: { label: "Av marknaden", cls: "bg-nordic-100 text-nordic-600" },
};

// Inline-fält med blur-spara (samma mönster som CompanyInfo): PATCH ett fält i taget.
function InlineField({
  label,
  value,
  placeholder,
  type = "text",
  onSave,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  onSave: (v: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState(value);
  // Synka från props under render (Reacts rekommenderade derived-state-mönster,
  // inte i en effekt) — annars blinkar gammalt värde efter SWR-refresh.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setDraft(value);
  }
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</span>
      <input
        type={type}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft.trim() !== (value ?? "").trim()) onSave(draft.trim());
        }}
        className="mt-0.5 w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
      />
    </label>
  );
}

export function OwnerCard({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const { data: owner, mutate, isLoading } = useSWR<OwnerFull>(`/api/crm/owners/${ownerId}`, swrFetcher, {
    refreshInterval: 15000,
  });
  const [smsText, setSmsText] = useState("");
  const [sending, setSending] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  async function saveField(patch: Record<string, unknown>) {
    try {
      await crmFetchJson(`/api/crm/owners/${ownerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      toast({ title: "Sparat" });
      mutate();
    } catch (e) {
      toast({ title: "Kunde inte spara", description: crmErrorMessage(e), variant: "destructive" });
    }
  }

  async function sendSms() {
    if (!owner?.phone || !smsText.trim() || sending) return;
    setSending(true);
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toPhone: owner.phone, body: smsText.trim(), ownerId }),
      });
      setSmsText("");
      toast({ title: "Köat — skickas från din Mac inom ~30 sekunder" });
    } catch (e) {
      toast({ title: "Kunde inte skicka", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  if (isLoading && !owner) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" /> Hämtar uthyrare…
      </div>
    );
  }
  if (!owner) return <p className="text-sm text-muted-foreground italic py-16 text-center">Uthyraren hittades inte.</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold text-nordic-900">{owner.name}</h1>
          {owner.ownerType && <span className="text-[11px] px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-700">{TYPE_LABEL[owner.ownerType] ?? owner.ownerType}</span>}
          {owner.ownerArrangement && <span className="text-[11px] px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-700">{ARR_LABEL[owner.ownerArrangement] ?? owner.ownerArrangement}</span>}
          {owner.rating != null && <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Betyg {owner.rating}/10</span>}
          {owner.orgNr && <span className="text-[11px] font-mono text-muted-foreground">{owner.orgNr}</span>}
          {owner.phone && (
            <span className="inline-flex items-center gap-1.5 ml-auto text-sm text-nordic-800">
              {formatPhoneSv(owner.phone)}
              <PhoneActions phone={owner.phone} ownerId={owner.id} />
            </span>
          )}
        </div>

        {/* Inline-redigerbara kontaktfält */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <InlineField label="Telefon" value={owner.phone ?? ""} placeholder="070-…" onSave={(v) => saveField({ phone: v || null })} />
          <InlineField label="E-post" value={owner.email ?? ""} placeholder="namn@…" onSave={(v) => saveField({ email: v || null })} />
          <InlineField label="Kontaktperson" value={owner.contactPerson ?? ""} onSave={(v) => saveField({ contactPerson: v || null })} />
          <div className="grid grid-cols-2 gap-2">
            <InlineField label="Återkomst" value={owner.followUpDate ?? ""} type="date" onSave={(v) => saveField({ followUpDate: v || null })} />
            <InlineField label="Anledning" value={owner.followUpReason ?? ""} onSave={(v) => saveField({ followUpReason: v || null })} />
          </div>
        </div>

        {/* Anteckningar */}
        <label className="block mt-3">
          <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Anteckningar</span>
          <textarea
            value={notesDraft ?? owner.notes ?? ""}
            onChange={(e) => setNotesDraft(e.target.value)}
            onBlur={() => {
              if (notesDraft !== null && notesDraft.trim() !== (owner.notes ?? "").trim()) {
                saveField({ notes: notesDraft.trim() || null });
              }
              setNotesDraft(null);
            }}
            rows={2}
            className="mt-0.5 w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        </label>
      </div>

      {/* Objekt */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Objekt ({owner.properties.length})</p>
          <button
            onClick={() => router.push(`/crm/properties?ownerId=${owner.id}`)}
            className="text-[11px] underline text-nordic-600 hover:text-nordic-900 ml-auto"
          >
            Visa i Objektsbank →
          </button>
        </div>
        {owner.properties.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Inga objekt kopplade.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {owner.properties.map((p) => {
              const st = STATUS_LABEL[p.status ?? ""] ?? { label: p.status ?? "?", cls: "bg-nordic-100 text-nordic-600" };
              return (
                <button
                  key={p.id}
                  onClick={() => router.push(`/crm/properties?id=${p.id}`)}
                  className="text-left rounded-lg border p-3 hover:bg-nordic-50 transition-colors"
                >
                  <div className="font-medium text-sm">{p.address ?? "(adress saknas)"}{p.city ? ` · ${p.city}` : ""}</div>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded ${st.cls}`}>{st.label}</span>
                    {p.published ? (
                      <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800">På hemsidan ✓</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-600">Ej publicerad</span>
                    )}
                    {p.prospektPublished && <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">Prospekt</span>}
                    {(p.bedrooms || p.beds) && (
                      <span className="text-muted-foreground">
                        {p.bedrooms ? `${p.bedrooms} sovrum` : ""}{p.bedrooms && p.beds ? " · " : ""}{p.beds ? `${p.beds} bäddar` : ""}
                      </span>
                    )}
                    {p.rentIn != null && p.rentOut != null && (
                      <span className="text-muted-foreground ml-auto">marginal {Math.round(p.rentOut - p.rentIn).toLocaleString("sv-SE")} kr/mån</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SMS-kompositör (direktsändning med ownerId-koppling) */}
      <div className="rounded-xl border bg-white p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Skicka SMS</p>
        {owner.phone ? (
          <div className="space-y-1.5">
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              rows={3}
              placeholder={`SMS till ${owner.name}…`}
              className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={sendSms}
                disabled={sending || !smsText.trim()}
                className="text-xs px-3 py-1.5 rounded border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-semibold disabled:opacity-40 transition-colors"
              >
                Skicka
              </button>
              <span className="text-[11px] text-muted-foreground">{smsText.length} tecken · skickas via Messages på din Mac (aldrig 21–08)</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">Telefonnummer saknas — lägg till ovan för att kunna skicka SMS.</p>
        )}
      </div>

      {/* Tidslinje */}
      <div className="rounded-xl border bg-white p-5">
        <OwnerTimeline ownerId={owner.id} />
      </div>

      {/* E-post */}
      <div className="rounded-xl border bg-white p-5">
        <EmailThread ownerId={owner.id} defaultTo={owner.email ?? undefined} />
      </div>
    </div>
  );
}
