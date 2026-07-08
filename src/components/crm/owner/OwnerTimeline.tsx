"use client";

// Uthyrarens samlade kommunikationstidslinje: SMS (in/ut), e-post, kontaktlogg
// och outreach-rundor i ett flöde. Läsvy — nya anteckningar loggas på objektkortet.
import { swrFetcher } from "@/lib/crm/fetcher";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface TimelineItem {
  id: string;
  kind: "sms" | "email" | "note" | "outreach";
  direction: "in" | "out" | null;
  at: string;
  title: string | null;
  body: string;
  status: string | null;
  service: string | null;
  propertyId: string | null;
  propertyAddress: string | null;
  error: string | null;
}

type KindFilter = "all" | "sms" | "email" | "note";

const KIND_FILTERS: { value: KindFilter; label: string }[] = [
  { value: "all", label: "Allt" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "E-post" },
  { value: "note", label: "Logg" },
];

const OUTBOX_STATUS: Record<string, { label: string; cls: string }> = {
  queued: { label: "Köad", cls: "bg-amber-100 text-amber-800" },
  sending: { label: "Skickas…", cls: "bg-blue-100 text-blue-800" },
  failed: { label: "Misslyckades", cls: "bg-red-100 text-red-800" },
  draft: { label: "Utkast", cls: "bg-violet-100 text-violet-800" },
};

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "d MMM yyyy HH:mm", { locale: sv });
}

export function OwnerTimeline({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const { data, isLoading } = useSWR<{ items: TimelineItem[] }>(
    `/api/crm/owners/${ownerId}/timeline`,
    swrFetcher,
    { refreshInterval: 15000 },
  );
  const items = data?.items ?? [];
  const filtered = kindFilter === "all"
    ? items
    : items.filter((i) => (kindFilter === "note" ? i.kind === "note" || i.kind === "outreach" : i.kind === kindFilter));

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Kommunikation</p>
        <div className="flex items-center gap-1 ml-auto">
          {KIND_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setKindFilter(f.value)}
              className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                kindFilter === f.value
                  ? "bg-nordic-800 text-white border-nordic-800"
                  : "bg-white text-nordic-700 border-input hover:bg-nordic-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" /> Hämtar historik…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-3">Ingen kommunikation loggad ännu.</p>
      ) : (
        <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isOut = item.direction === "out";
            const border =
              item.kind === "sms"
                ? isOut ? "border-l-blue-300" : "border-l-green-300"
                : item.kind === "email"
                  ? isOut ? "border-l-blue-200" : "border-l-green-200"
                  : item.kind === "note"
                    ? "border-l-amber-300"
                    : "border-l-nordic-300";
            const statusBadge = item.status ? OUTBOX_STATUS[item.status] : null;
            return (
              <div key={item.id} className={`rounded-md border border-l-4 ${border} bg-white px-3 py-2`}>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px]">
                  <span className="font-semibold text-nordic-800">
                    {item.kind === "sms"
                      ? isOut ? "SMS till uthyraren" : "SMS från uthyraren"
                      : item.kind === "email"
                        ? isOut ? "Mejl skickat" : "Mejl mottaget"
                        : item.kind === "note"
                          ? `Kontaktlogg · ${item.title ?? ""}`
                          : item.title ?? "Kontaktrunda"}
                  </span>
                  {item.kind === "email" && item.title && <span className="text-muted-foreground italic truncate max-w-[40%]">{item.title}</span>}
                  {statusBadge && <span className={`px-1.5 py-0.5 rounded font-medium ${statusBadge.cls}`}>{statusBadge.label}</span>}
                  {item.service && <span className="text-muted-foreground">{item.service}</span>}
                  {item.propertyAddress && (
                    <button
                      onClick={() => item.propertyId && router.push(`/crm/properties?id=${item.propertyId}`)}
                      className="px-1.5 py-0.5 rounded bg-nordic-100 text-nordic-700 hover:bg-nordic-200 transition-colors"
                    >
                      {item.propertyAddress}
                    </button>
                  )}
                  <span className="text-muted-foreground ml-auto">{timeLabel(item.at)}</span>
                </div>
                {item.body && (
                  <p className="text-sm text-nordic-800 mt-1 whitespace-pre-wrap break-words">{item.body}</p>
                )}
                {item.error && <p className="text-[11px] text-red-700 mt-1">{item.error}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
