"use client";

import { ALL_NAV_ITEMS, RECENT_ICON } from "@/components/crm/layout/nav";
import { useRecent } from "@/lib/crm/recent";
import { AnimatePresence, motion } from "framer-motion";
import { CornerDownLeft, Loader2, type LucideIcon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export interface SearchHit {
  id: string;
  entityType: "company" | "request" | "property" | "owner" | "contact" | "note";
  entityId: string;
  companyId: string | null;
  title: string;
  subtitle: string | null;
  route: string;
}

const TYPE_LABEL: Record<SearchHit["entityType"], string> = {
  company: "Företag",
  request: "Förfrågan",
  property: "Objekt",
  owner: "Uthyrare",
  contact: "Kontakt",
  note: "Anteckning",
};

const TYPE_CLS: Record<SearchHit["entityType"], string> = {
  company: "bg-blue-100 text-blue-800",
  request: "bg-amber-100 text-amber-800",
  property: "bg-green-100 text-green-800",
  owner: "bg-teal-100 text-teal-800",
  contact: "bg-purple-100 text-purple-800",
  note: "bg-nordic-200 text-nordic-700",
};

interface Entry {
  id: string;
  title: string;
  subtitle: string | null;
  route: string;
  type?: SearchHit["entityType"];
  icon?: LucideIcon;
  hint?: string;
}

const GROUP_ORDER: SearchHit["entityType"][] = ["company", "request", "property", "owner", "contact", "note"];

const GlobalSearchContext = createContext<{ open: () => void }>({ open: () => {} });

export function useGlobalSearch() {
  return useContext(GlobalSearchContext);
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <GlobalSearchContext.Provider value={{ open }}>
      {children}
      <AnimatePresence>{isOpen && <GlobalSearchOverlay onClose={close} />}</AnimatePresence>
    </GlobalSearchContext.Provider>
  );
}

function GlobalSearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [selected, setSelected] = useState(0);
  const recent = useRecent();

  // Autofokus när paletten öppnas
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce 150ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(input.trim()), 150);
    return () => clearTimeout(t);
  }, [input]);

  // Hämta resultat
  useEffect(() => {
    if (debounced.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetch(`/api/crm/search-all?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: SearchHit[]) => {
        if (ctrl.signal.aborted) return;
        setHits(Array.isArray(data) ? data : []);
        setSelected(0);
      })
      .catch((e) => {
        if (!ctrl.signal.aborted && e.name !== "AbortError") setHits([]);
      })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [debounced]);

  // "Söker…" visas bara om det tar lite tid (>200ms)
  useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
      return;
    }
    const t = setTimeout(() => setShowSpinner(true), 200);
    return () => clearTimeout(t);
  }, [loading]);

  // Grupper i fast ordning men en platt lista för tangentnavigering. Sidor
  // ("Gå till") och senast besökta visas direkt — innan man skrivit något.
  const { grouped, flat } = useMemo(() => {
    const q = input.trim().toLowerCase();
    const nav: Entry[] = ALL_NAV_ITEMS.filter((i) => !q || i.label.toLowerCase().includes(q)).map((i) => ({
      id: `nav:${i.href}`,
      title: i.label,
      subtitle: null,
      route: i.href,
      icon: i.icon,
      hint: `g ${i.key}`,
    }));
    const recentEntries: Entry[] = q
      ? []
      : recent.slice(0, 6).map((r) => ({ id: `recent:${r.href}`, title: r.label, subtitle: null, route: r.href, icon: RECENT_ICON[r.kind] }));
    const searchGroups = GROUP_ORDER.map((type) => ({
      key: type,
      label: TYPE_LABEL[type],
      items: hits
        .filter((h) => h.entityType === type)
        .map((h): Entry => ({ id: h.id, title: h.title, subtitle: h.subtitle, route: h.route, type: h.entityType })),
    }));
    const g = [
      { key: "recent", label: "Senast besökta", items: recentEntries },
      ...(debounced.length >= 2 ? searchGroups : []),
      { key: "nav", label: "Gå till", items: q && debounced.length >= 2 ? nav.slice(0, 3) : nav },
    ].filter((x) => x.items.length > 0);
    return { grouped: g, flat: g.flatMap((x) => x.items) };
  }, [hits, input, debounced, recent]);

  useEffect(() => {
    setSelected((i) => Math.min(i, Math.max(flat.length - 1, 0)));
  }, [flat.length]);

  const go = useCallback(
    (entry: Entry | undefined) => {
      if (!entry) return;
      onClose();
      router.push(entry.route);
    },
    [onClose, router],
  );

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[selected] ?? flat[0]);
    }
  }

  // Håll markerad rad synlig vid piltangenter
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${selected}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  const searching = debounced.length >= 2;
  const noHits = searching && !loading && hits.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] bg-nordic-900/25 backdrop-blur-[2px] flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); setSelected(0); }}
            onKeyDown={onKeyDown}
            placeholder="Sök företag, förfrågan, objekt – eller hoppa till en sida…"
            className="flex-1 h-14 text-[15px] bg-transparent focus:outline-none"
          />
          {showSpinner && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
          <kbd className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 shrink-0">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto pb-2">
          {noHits && (
            <p className="px-4 pt-5 pb-2 text-sm text-muted-foreground text-center">Inga träffar på &quot;{debounced}&quot;.</p>
          )}
          {grouped.map((group) => (
            <div key={group.key}>
              <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </div>
              {group.items.map((entry) => {
                const idx = flat.indexOf(entry);
                const active = idx === selected;
                const Icon = entry.icon;
                return (
                  <button
                    key={entry.id}
                    data-idx={idx}
                    onMouseMove={() => setSelected(idx)}
                    onClick={() => go(entry)}
                    onMouseDown={(e) => e.preventDefault()}
                    className="relative w-full text-left px-4 py-2 flex items-center gap-2.5"
                  >
                    {active && (
                      <motion.span
                        layoutId="crm-search-active"
                        transition={{ type: "spring", stiffness: 700, damping: 45 }}
                        className="absolute inset-x-2 inset-y-0 rounded-lg bg-nordic-100"
                      />
                    )}
                    {entry.type ? (
                      <span className={`relative text-[10px] px-1.5 py-0.5 rounded shrink-0 ${TYPE_CLS[entry.type]}`}>
                        {TYPE_LABEL[entry.type]}
                      </span>
                    ) : Icon ? (
                      <Icon className={`relative h-4 w-4 shrink-0 ${active ? "text-[#ff6300]" : "text-nordic-500"}`} />
                    ) : null}
                    <span className="relative min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{entry.title}</span>
                      {entry.subtitle && (
                        <span className="block text-xs text-muted-foreground truncate">{entry.subtitle}</span>
                      )}
                    </span>
                    {entry.hint && (
                      <kbd className="relative text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 bg-white shrink-0">
                        {entry.hint}
                      </kbd>
                    )}
                    {active && <CornerDownLeft className="relative h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border-t bg-nordic-100/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span><kbd className="font-sans">↑↓</kbd> välj</span>
          <span><kbd className="font-sans">↵</kbd> öppna</span>
          <span className="ml-auto">Tips: tryck <kbd className="border rounded px-1 bg-white">g</kbd> + bokstav var som helst för att hoppa</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
