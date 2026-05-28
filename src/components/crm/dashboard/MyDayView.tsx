"use client";

import { format } from "date-fns";
import { sv } from "date-fns/locale";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
function fireConfetti() {
  import("canvas-confetti").then((mod) =>
    mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#ff6300", "#ffd700", "#22c55e", "#3b82f6"] }),
  );
}

const CHASE_TOAST: Record<string, string> = {
  snooze3: "Uppskjuten 3 dagar",
  snooze7: "Uppskjuten 7 dagar",
  answered: "Markerad: fick svar",
  off_market: "Objektet markerat av marknaden",
};

const STEPS = [
  { emoji: "📞", title: "Att kontakta", text: "Företag du lovat höra av dig till idag. Ring eller mejla och boka ny återkomst." },
  { emoji: "📋", title: "Öppna uppdrag", text: "Företag med aktiva förfrågningar och ingen inplanerad återkomst. Sätt en återkomst så försvinner de härifrån." },
  { emoji: "🧾", title: "Ska faktureras", text: "Vunna affärer — kunden har sagt ja och kontrakt signerat. Markera fakturerad när fakturan är skickad." },
  { emoji: "☎️", title: "Följ upp uthyrare", text: "Hyresvärdar att höra av sig till — för förslag som väntar svar eller för sourcing." },
];

const LOST_REASONS = ["För dyrt", "Ej passande bostad", "Hittade bättre objekt", "Övrigt"];

const STATUS_LABEL: Record<string, string> = {
  incoming: "Inkommen",
  matching: "Matchar",
  won: "Ska faktureras",
};
const STATUS_STYLE: Record<string, string> = {
  incoming: "bg-blue-50 text-blue-800",
  matching: "bg-amber-50 text-amber-800",
  won: "bg-green-50 text-green-800",
};

const VERSES: { text: string; ref: string }[] = [
  { text: "Var inte rädd, för jag är med dig.", ref: "Jesaja 41:10" },
  { text: "Herren är min herde, mig ska inget fattas.", ref: "Psaltaren 23:1" },
  { text: "Allt förmår jag genom honom som ger mig kraft.", ref: "Filipperbrevet 4:13" },
  { text: "Var stark och modig … Herren din Gud är med dig vart du än går.", ref: "Josua 1:9" },
  { text: "Kom till mig, alla ni som är tyngda av bördor, så ska jag ge er vila.", ref: "Matteus 11:28" },
  { text: "Kasta alla era bekymmer på honom, för han har omsorg om er.", ref: "1 Petrus 5:7" },
  { text: "Jag vet vilka tankar jag har för er: tankar om frid, framtid och hopp.", ref: "Jeremia 29:11" },
  { text: "Herren är nära alla som ropar till honom.", ref: "Psaltaren 145:18" },
  { text: "Gud är vår tillflykt och styrka, en hjälp i nöden.", ref: "Psaltaren 46:2" },
  { text: "Min nåd är nog för dig.", ref: "2 Korinthierbrevet 12:9" },
  { text: "Frid lämnar jag åt er, min frid ger jag er.", ref: "Johannes 14:27" },
  { text: "Se, jag är med er alla dagar till tidens slut.", ref: "Matteus 28:20" },
];

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

interface OpenRequest {
  id: string;
  requestNumber: number | null;
  companyId: string;
  city?: string | null;
  status: string;
}

interface CompanyCard {
  id: string;
  name: string;
  followUpDate?: string | null;
  followUpReason?: string | null;
  followUpTime?: string | null;
  openRequests: OpenRequest[];
}

interface ChaseRow {
  propertyId: string;
  address: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  earliestDate: string | null;
  reason: string | null;
  requestCount: number;
  sourcing: boolean;
}

interface QueueData {
  followUps: CompanyCard[];
  openWithoutFollowUp: CompanyCard[];
  toInvoice: CompanyCard[];
  chaseLandlords: ChaseRow[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MyDayView() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];
  const [showHelp, setShowHelp] = useState(true);
  const [verse, setVerse] = useState<{ text: string; ref: string } | null>(null);

  function blessKajsa() {
    const pool = VERSES.filter((v) => v.ref !== verse?.ref);
    setVerse(pool[Math.floor(Math.random() * pool.length)]);
  }

  useEffect(() => {
    if (localStorage.getItem("crm_minday_help") === "hidden") setShowHelp(false);
  }, []);

  function dismissHelp() {
    localStorage.setItem("crm_minday_help", "hidden");
    setShowHelp(false);
  }
  function openHelp() {
    localStorage.removeItem("crm_minday_help");
    setShowHelp(true);
  }

  const { data, mutate, isLoading } = useSWR<QueueData>("/api/crm/queues", fetcher, { refreshInterval: 15000 });
  const queues = data ?? { followUps: [], openWithoutFollowUp: [], toInvoice: [], chaseLandlords: [] };
  const loading = isLoading && !data;

  async function chaseAction(propertyId: string, action: string) {
    try {
      const res = await fetch(`/api/crm/properties/${propertyId}/chase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: CHASE_TOAST[action] ?? "Sparat" });
    } catch {
      toast({ title: "Kunde inte spara", variant: "destructive" });
    }
  }

  async function clearFollowUp(companyId: string) {
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: null, followUpTime: null, followUpReason: null }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: "Återkomst borttagen" });
    } catch {
      toast({ title: "Kunde inte ta bort", variant: "destructive" });
    }
  }

  async function snoozeFollowUp(companyId: string, days: number) {
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: plusDays(days) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: days === 1 ? "Flyttad till imorgon" : `Flyttad fram ${days} dagar` });
    } catch {
      toast({ title: "Kunde inte flytta fram", variant: "destructive" });
    }
  }

  async function scheduleFollowUp(companyId: string, date: string, time: string) {
    if (!date) return;
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: date, followUpTime: time || null }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: `Återkomst bokad ${date}${time ? ` kl. ${time}` : ""}` });
    } catch {
      toast({ title: "Kunde inte boka", variant: "destructive" });
    }
  }

  async function markWon(requests: OpenRequest[]) {
    const active = requests.filter((r) => r.status === "incoming" || r.status === "matching");
    if (!active.length) return;
    await Promise.all(
      active.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "won" }),
        }),
      ),
    );
    mutate();
    fireConfetti();
    toast({ title: active.length === 1 ? "🎉 Ska faktureras!" : `🎉 ${active.length} förfrågningar — ska faktureras!` });
  }

  async function markLost(requests: OpenRequest[], reason: string) {
    if (!requests.length) return;
    await Promise.all(
      requests.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "lost", lostReason: reason }),
        }),
      ),
    );
    mutate();
    toast({ title: requests.length === 1 ? "Förfrågan stängd" : `${requests.length} förfrågningar stängda` });
  }

  async function markInvoiced(requests: OpenRequest[]) {
    const won = requests.filter((r) => r.status === "won");
    if (!won.length) return;
    await Promise.all(
      won.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "invoiced" }),
        }),
      ),
    );
    mutate();
    toast({ title: won.length === 1 ? "Fakturerad ✓" : `${won.length} förfrågningar markerade som fakturerade` });
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-nordic-900">Min dag</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: sv })}
          </p>
        </div>
        {!showHelp && (
          <button onClick={openHelp} className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">
            Så funkar Min dag
          </button>
        )}
      </div>

      {showHelp && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 p-4 relative">
          <button onClick={dismissHelp} className="absolute top-3 right-3 text-amber-700/70 hover:text-amber-900" title="Dölj">
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-amber-900 mb-1">Så funkar din dag 👋</p>
          <p className="text-xs text-amber-800/90 mb-3">
            Varje kort är ett företag. Jobba dig igenom kolumnerna — klicka på ett kort för att öppna företaget, eller använd snabbvalen direkt på kortet.
          </p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-lg bg-white/70 border border-amber-100 p-2.5">
                <div className="text-sm font-medium text-nordic-900 mb-0.5">
                  <span className="mr-1">{s.emoji}</span>{s.title}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, c) => (
            <div key={c}>
              <div className="h-4 w-32 rounded bg-nordic-100 animate-pulse mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border bg-white p-3 space-y-2">
                    <div className="h-3.5 w-2/3 rounded bg-nordic-100 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-nordic-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <QueueSection
            title="Att kontakta"
            emoji="📞"
            items={queues.followUps}
            emptyText="Inga återkomster idag"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="followup"
                onOpen={() => router.push(`/crm/work/followups/${item.id}`)}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkWon={() => markWon(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
                onClearFollowUp={() => clearFollowUp(item.id)}
              />
            )}
          />

          <QueueSection
            title="Öppna uppdrag"
            emoji="📋"
            items={queues.openWithoutFollowUp}
            emptyText="Inga öppna uppdrag"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="open"
                onOpen={() => router.push(`/crm/work/followups/${item.id}`)}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkWon={() => markWon(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
              />
            )}
          />

          <QueueSection
            title="Ska faktureras"
            emoji="🧾"
            items={queues.toInvoice}
            emptyText="Inget att fakturera"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="invoice"
                onOpen={() => router.push(`/crm/work/followups/${item.id}`)}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkInvoiced={() => markInvoiced(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
              />
            )}
          />

          <QueueSection
            title="Följ upp uthyrare"
            emoji="☎️"
            items={queues.chaseLandlords}
            emptyText="Inget att följa upp"
            renderItem={(item) => (
              <ChaseCard
                key={item.propertyId}
                item={item}
                today={today}
                onOpen={() => router.push(`/crm/properties?id=${item.propertyId}`)}
                onAction={(action) => chaseAction(item.propertyId, action)}
              />
            )}
          />
        </div>
      )}

      <div className="mt-12 flex justify-end items-end gap-3 pr-2">
        <div className="relative bg-white border rounded-2xl rounded-br-none shadow-sm px-4 py-2.5 mb-5 max-w-sm">
          {verse ? (
            <>
              <p className="text-sm text-nordic-900 italic">"{verse.text}"</p>
              <p className="text-xs text-muted-foreground mt-1">— {verse.ref}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-nordic-900">Jag är med dig, Kajsa! ✝️</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Klicka på mig för ett bibelord</p>
            </>
          )}
        </div>
        <button type="button" onClick={blessKajsa} title="Klicka för ett bibelord" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jesus-kajsa.png"
            alt="Glad tecknad Jesus som vinkar"
            className="h-28 w-28 object-contain select-none cursor-pointer transition-transform hover:scale-105"
            draggable={false}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Snabbval-knappar ────────────────────────────────────────────────────────

function QBtn({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "success" | "danger" | "primary";
}) {
  const styles = {
    default: "border-input bg-white text-muted-foreground hover:bg-nordic-100",
    primary: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium",
    success: "border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-medium",
    danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] px-2 py-0.5 rounded border transition-colors disabled:opacity-40 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ─── Universellt företagskort med snabbval ────────────────────────────────────

type CardVariant = "followup" | "open" | "invoice";

function CompanyDayCard({
  item,
  today,
  variant,
  onOpen,
  onSnooze,
  onSchedule,
  onMarkWon,
  onMarkInvoiced,
  onMarkLost,
  onClearFollowUp,
}: {
  item: CompanyCard;
  today: string;
  variant: CardVariant;
  onOpen: () => void;
  onSnooze: (days: number) => void | Promise<void>;
  onSchedule: (date: string, time: string) => void | Promise<void>;
  onMarkWon?: () => void | Promise<void>;
  onMarkInvoiced?: () => void | Promise<void>;
  onMarkLost: (reason: string) => void | Promise<void>;
  onClearFollowUp?: () => void | Promise<void>;
}) {
  const [action, setAction] = useState<"återkomst" | "nej" | null>(null);
  const [date, setDate] = useState(item.followUpDate ?? today);
  const [time, setTime] = useState(item.followUpTime ?? "08:00");
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [busy, setBusy] = useState(false);

  const isPast = !!item.followUpDate && item.followUpDate < today;
  const isToday = item.followUpDate === today;

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setAction(null); }
  }

  const activeRequests = item.openRequests.filter((r) => r.status !== "won");
  const hasActive = activeRequests.length > 0;
  const wonRequests = item.openRequests.filter((r) => r.status === "won");

  return (
    <div className={`rounded-lg bg-white border transition-colors ${isPast ? "border-red-300" : "border-border"}`}>
      {/* Klickbar huvud */}
      <button
        className="w-full text-left p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-t-lg"
        onClick={onOpen}
      >
        <div className="font-medium text-sm">{item.name}</div>

        {/* Återkomst-badge (followup-variant) */}
        {variant === "followup" && item.followUpDate && (
          <div className="mt-1.5">
            <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded ${
              isPast ? "bg-red-100 text-red-800" : isToday ? "bg-amber-100 text-amber-800" : "bg-nordic-100 text-nordic-700"
            }`}>
              {isPast ? `Försenad · ${item.followUpDate}` : isToday ? "Återkomst idag" : item.followUpDate}
              {item.followUpTime && ` kl. ${item.followUpTime}`}
            </span>
            {item.followUpReason && (
              <span className="text-xs text-muted-foreground ml-1.5">{item.followUpReason}</span>
            )}
          </div>
        )}

        {/* Request-badges */}
        {item.openRequests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.openRequests.map((r) => (
              <span key={r.id} className={`inline-block text-[11px] px-1.5 py-0.5 rounded ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                {r.city ? `${r.city} · ` : ""}{STATUS_LABEL[r.status] ?? r.status}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Snabbvals-rad */}
      <div className="flex flex-wrap items-center gap-1 px-2.5 pb-2 pt-1 border-t border-dashed">
        <QBtn variant="primary" onClick={() => setAction(action === "återkomst" ? null : "återkomst")}>
          ↩ Återkomst
        </QBtn>
        {variant === "followup" && onClearFollowUp && (
          <QBtn disabled={busy} onClick={() => run(async () => { await onClearFollowUp(); })}>
            Ta bort återkomst
          </QBtn>
        )}
        {variant !== "invoice" && hasActive && (
          <QBtn variant="success" disabled={busy} onClick={() => run(async () => { await onMarkWon?.(); })}>
            ✓ Ska faktureras
          </QBtn>
        )}
        {variant === "invoice" && (
          <QBtn variant="success" disabled={busy} onClick={() => run(async () => { await onMarkInvoiced?.(); })}>
            ✓ Fakturerad
          </QBtn>
        )}
        <QBtn variant="danger" onClick={() => setAction(action === "nej" ? null : "nej")}>
          ✕ Nej
        </QBtn>
      </div>

      {/* Återkomst — inline datumval */}
      {action === "återkomst" && (
        <div className="px-2.5 pb-2.5 pt-1 border-t bg-amber-50/50 rounded-b-lg space-y-1.5">
          <p className="text-[11px] font-medium text-amber-800">Ny återkomst</p>
          <div className="flex flex-wrap gap-1">
            <QBtn onClick={() => run(async () => { await onSnooze(1); })}>Imorgon</QBtn>
            <QBtn onClick={() => run(async () => { await onSnooze(3); })}>+3 d</QBtn>
            <QBtn onClick={() => run(async () => { await onSnooze(7); })}>+7 d</QBtn>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border rounded px-1.5 py-0.5 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <QBtn variant="primary" onClick={() => run(async () => { await onSchedule(date, time); })}>
              Spara
            </QBtn>
          </div>
        </div>
      )}

      {/* Nej — inline anledningsval */}
      {action === "nej" && (
        <div className="px-2.5 pb-2.5 pt-1 border-t bg-red-50/60 rounded-b-lg space-y-1.5">
          <p className="text-[11px] font-medium text-red-800">
            Stäng {item.openRequests.length === 1 ? "förfrågan" : `${item.openRequests.length} förfrågningar`} — varför?
          </p>
          <div className="flex flex-wrap gap-1">
            {LOST_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setLostReason(r)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  lostReason === r
                    ? "border-red-400 bg-red-100 text-red-800 font-semibold"
                    : "border-input bg-white text-muted-foreground hover:bg-red-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <QBtn variant="danger" disabled={busy} onClick={() => run(async () => { await onMarkLost(lostReason); })}>
              Ja, stäng
            </QBtn>
            <QBtn onClick={() => setAction(null)}>Avbryt</QBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Uthyrare-korten (oförändrade) ────────────────────────────────────────────

function ChaseCard({
  item,
  today,
  onOpen,
  onAction,
}: {
  item: ChaseRow;
  today: string;
  onOpen: () => void;
  onAction: (action: string) => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  async function act(action: string) {
    if (
      action === "off_market" &&
      !window.confirm("Markera objektet som av marknaden? Det slutar visas som ledigt.")
    ) return;
    setBusy(true);
    await onAction(action);
    setBusy(false);
  }
  const overdue = !!item.earliestDate && item.earliestDate <= today;
  return (
    <div className="p-3 rounded-lg bg-white border">
      <button className="w-full text-left" onClick={onOpen}>
        <div className="font-medium text-sm truncate">{item.address ?? "(adress saknas)"}</div>
        <div className="text-xs text-muted-foreground truncate">
          {[item.ownerName, item.ownerPhone].filter(Boolean).join(" · ") || "—"}
        </div>
        <div className="text-xs mt-1">
          {item.sourcing ? (
            <span className="italic text-nordic-500">Uthyrarkontakt att följa upp</span>
          ) : (
            <span className="text-amber-700 font-medium">
              {item.requestCount === 1 ? "Skickat förslag väntar svar" : `${item.requestCount} skickade förslag väntar svar`}
            </span>
          )}
          {item.reason && <span className="text-muted-foreground"> · {item.reason}</span>}
        </div>
        {item.earliestDate && (
          <div className={`text-[11px] mt-0.5 ${overdue ? "text-rose-600" : "text-muted-foreground"}`}>
            {overdue ? "idag/försenad" : item.earliestDate}
          </div>
        )}
      </button>
      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
        {(["snooze3", "snooze7", "answered", "off_market"] as const).map((a) => (
          <button
            key={a}
            onClick={() => act(a)}
            disabled={busy}
            className="text-[11px] px-1.5 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40"
          >
            {a === "snooze3" ? "Ringd · +3 d" : a === "snooze7" ? "+7 d" : a === "answered" ? "Fick svar" : "Av marknaden"}
          </button>
        ))}
        <button
          onClick={onOpen}
          disabled={busy}
          className="text-[11px] px-1.5 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40"
        >
          Anteckning
        </button>
      </div>
    </div>
  );
}

// ─── Generisk kösektion ───────────────────────────────────────────────────────

function QueueSection<T>({
  title,
  emoji,
  items,
  emptyText,
  renderItem,
}: {
  title: string;
  emoji: string;
  items: T[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span>{emoji}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{emptyText}</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}
