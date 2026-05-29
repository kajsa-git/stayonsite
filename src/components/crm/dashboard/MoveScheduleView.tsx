"use client";

import { toast } from "@/components/ui/use-toast";
import {
  MOVE_IN_CHECKLIST,
  MOVE_OUT_CHECKLIST,
  isMoveInChecklistComplete,
  isMoveOutChecklistComplete,
  type ChecklistItem,
} from "@/lib/crm/move-checklists";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { sv } from "date-fns/locale";
import { ArrowRight, Check, LogIn, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface MoveItem {
  requestId: string;
  requestNumber: number | null;
  companyId: string;
  companyName: string;
  propertyId: string | null;
  address: string | null;
  city: string | null;
  status: string;
  date: string;
  checklist: string[];
  doneAt: string | null;
}

interface MoveData {
  moveIns: MoveItem[];
  moveOuts: MoveItem[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const nowIso = () => new Date().toISOString();

export function MoveScheduleView() {
  const { data, mutate, isLoading } = useSWR<MoveData>("/api/crm/move-schedule", fetcher, {
    refreshInterval: 30000,
  });
  const moveIns = data?.moveIns ?? [];
  const moveOuts = data?.moveOuts ?? [];

  async function patch(requestId: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/crm/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast({ title: err?.message ?? "Kunde inte spara", variant: "destructive" });
      return false;
    }
    return true;
  }

  async function toggleItem(kind: "in" | "out", item: MoveItem, key: string) {
    const has = item.checklist.includes(key);
    const next = has ? item.checklist.filter((k) => k !== key) : [...item.checklist, key];
    const field = kind === "in" ? "moveInChecklist" : "moveOutChecklist";
    await mutate(
      async () => {
        const ok = await patch(item.requestId, { [field]: next });
        return ok ? undefined : data; // undefined → revalidate
      },
      {
        optimisticData: patchLocal(data, kind, item.requestId, (it) => ({ ...it, checklist: next })),
        rollbackOnError: true,
        revalidate: true,
      },
    );
  }

  async function markDone(kind: "in" | "out", item: MoveItem) {
    const field = kind === "in" ? "moveInDoneAt" : "moveOutDoneAt";
    const stamp = nowIso();
    const ok = await patch(item.requestId, { [field]: stamp });
    if (ok) {
      toast({ title: kind === "in" ? "Inflytt klarmarkerad ✓" : "Avflytt klarmarkerad ✓" });
      mutate();
    }
  }

  async function undoDone(kind: "in" | "out", item: MoveItem) {
    const field = kind === "in" ? "moveInDoneAt" : "moveOutDoneAt";
    const ok = await patch(item.requestId, { [field]: null });
    if (ok) mutate();
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-nordic-900">In- & avflyttningar</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bocka av hela checklistan innan du klarmarkerar. Aktuella poster (inom 3 dagar) är markerade.
        </p>
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, c) => (
            <div key={c} className="space-y-2">
              <div className="h-4 w-40 rounded bg-nordic-100 animate-pulse mb-3" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-white p-4 space-y-2">
                  <div className="h-3.5 w-2/3 rounded bg-nordic-100 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-nordic-100 animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Column
            kind="in"
            title="Inflyttningar"
            icon={<LogIn className="h-4 w-4 text-blue-600" />}
            template={MOVE_IN_CHECKLIST}
            items={moveIns}
            onToggle={toggleItem}
            onDone={markDone}
            onUndo={undoDone}
          />
          <Column
            kind="out"
            title="Avflyttningar"
            icon={<LogOut className="h-4 w-4 text-rose-600" />}
            template={MOVE_OUT_CHECKLIST}
            items={moveOuts}
            onToggle={toggleItem}
            onDone={markDone}
            onUndo={undoDone}
          />
        </div>
      )}
    </div>
  );
}

function Column({
  kind,
  title,
  icon,
  template,
  items,
  onToggle,
  onDone,
  onUndo,
}: {
  kind: "in" | "out";
  title: string;
  icon: React.ReactNode;
  template: ChecklistItem[];
  items: MoveItem[];
  onToggle: (kind: "in" | "out", item: MoveItem, key: string) => void;
  onDone: (kind: "in" | "out", item: MoveItem) => void;
  onUndo: (kind: "in" | "out", item: MoveItem) => void;
}) {
  const [showDone, setShowDone] = useState(false);
  const open = items.filter((i) => !i.doneAt);
  const done = items.filter((i) => i.doneAt);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {open.length}
        </span>
      </div>
      <div className="space-y-3">
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Inget på gång</p>
        ) : (
          open.map((item) => (
            <MoveCard key={item.requestId} kind={kind} item={item} template={template} onToggle={onToggle} onDone={onDone} />
          ))
        )}
      </div>

      {done.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setShowDone((v) => !v)}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {showDone ? "Dölj" : "Visa"} klara ({done.length})
          </button>
          {showDone && (
            <div className="space-y-2 mt-2">
              {done.map((item) => (
                <div key={item.requestId} className="rounded-lg border bg-nordic-50 px-4 py-2.5 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{item.companyName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {[item.address, item.city].filter(Boolean).join(" · ")} · {item.date}
                    </div>
                  </div>
                  <button
                    onClick={() => onUndo(kind, item)}
                    className="ml-auto text-[11px] text-muted-foreground hover:text-foreground underline shrink-0"
                  >
                    Ångra
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MoveCard({
  kind,
  item,
  template,
  onToggle,
  onDone,
}: {
  kind: "in" | "out";
  item: MoveItem;
  template: ChecklistItem[];
  onToggle: (kind: "in" | "out", item: MoveItem, key: string) => void;
  onDone: (kind: "in" | "out", item: MoveItem) => void;
}) {
  const router = useRouter();
  const complete = kind === "in" ? isMoveInChecklistComplete(item.checklist) : isMoveOutChecklistComplete(item.checklist);
  const checkedCount = template.filter((t) => item.checklist.includes(t.key)).length;

  const diff = differenceInCalendarDays(parseISO(item.date), new Date());
  const overdue = diff < 0;
  const within = diff >= 0 && diff <= 3;
  const dateLabel =
    diff < 0 ? `Försenad · ${Math.abs(diff)} d` : diff === 0 ? "Idag" : diff === 1 ? "Imorgon" : `Om ${diff} dagar`;
  const dateCls = overdue
    ? "bg-red-100 text-red-800"
    : within
      ? "bg-amber-100 text-amber-800"
      : "bg-nordic-100 text-nordic-700";

  return (
    <div className={`rounded-lg border bg-white ${within || overdue ? "border-amber-300" : "border-border"}`}>
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium text-sm">{item.companyName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {[item.address, item.city].filter(Boolean).join(" · ") || "—"}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${dateCls}`}>{dateLabel}</span>
            <span className="text-[11px] text-muted-foreground">
              {format(parseISO(item.date), "d MMM yyyy", { locale: sv })}
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {template.map((t) => {
            const checked = item.checklist.includes(t.key);
            return (
              <label key={t.key} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(kind, item, t.key)}
                  className="h-4 w-4 rounded border-nordic-300 accent-[#ff6300]"
                />
                <span className={checked ? "line-through text-muted-foreground" : ""}>{t.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 border-t bg-nordic-50/50 rounded-b-lg">
        <span className="text-[11px] text-muted-foreground">
          {checkedCount}/{template.length} klart
        </span>
        <button
          onClick={() => router.push(`/crm/company/${item.companyId}`)}
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          Öppna uppdrag <ArrowRight className="h-3 w-3" />
        </button>
        <button
          onClick={() => onDone(kind, item)}
          disabled={!complete}
          title={complete ? "Klarmarkera" : "Bocka av hela checklistan först"}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-green-300 bg-green-50 text-green-800 hover:bg-green-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="h-3.5 w-3.5" />
          {kind === "in" ? "Klarmarkera inflytt" : "Klarmarkera avflytt"}
        </button>
      </div>
    </div>
  );
}

// Optimistisk lokal patch av SWR-datan (uppdaterar rätt post i rätt lista).
function patchLocal(
  data: MoveData | undefined,
  kind: "in" | "out",
  requestId: string,
  fn: (item: MoveItem) => MoveItem,
): MoveData {
  const empty: MoveData = { moveIns: [], moveOuts: [] };
  const d = data ?? empty;
  const apply = (arr: MoveItem[]) => arr.map((it) => (it.requestId === requestId ? fn(it) : it));
  return kind === "in" ? { ...d, moveIns: apply(d.moveIns) } : { ...d, moveOuts: apply(d.moveOuts) };
}
