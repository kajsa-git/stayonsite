"use client";

import { Search } from "lucide-react";
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

const GROUP_ORDER: SearchHit["entityType"][] = ["company", "request", "property", "owner", "contact", "note"];

const GlobalSearchContext = createContext<{ open: () => void }>({ open: () => {} });

export function useGlobalSearch() {
  return useContext(GlobalSearchContext);
}

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);

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
      {isOpen && <GlobalSearchOverlay onClose={() => setIsOpen(false)} />}
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
        setHits(Array.isArray(data) ? data : []);
        setSelected(0);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setHits([]);
      })
      .finally(() => setLoading(false));
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

  // Gruppera i fast ordning men behåll en platt lista för tangentnavigering
  const { grouped, flat } = useMemo(() => {
    const g = GROUP_ORDER.map((type) => ({
      type,
      items: hits.filter((h) => h.entityType === type),
    })).filter((x) => x.items.length > 0);
    return { grouped: g, flat: g.flatMap((x) => x.items) };
  }, [hits]);

  const go = useCallback(
    (hit: SearchHit | undefined) => {
      if (!hit) return;
      onClose();
      router.push(hit.route);
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

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/30 flex items-start justify-center pt-[12vh] px-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Sök företag, förfrågan, objekt, kontakt…"
            className="flex-1 h-12 text-sm bg-transparent focus:outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border rounded px-1.5 py-0.5 shrink-0">esc</kbd>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {debounced.length < 2 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">
              Skriv minst 2 tecken för att söka.
            </p>
          ) : showSpinner && flat.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Söker…</p>
          ) : !loading && flat.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Inga träffar.</p>
          ) : (
            grouped.map((group) => (
              <div key={group.type}>
                <div className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {TYPE_LABEL[group.type]}
                </div>
                {group.items.map((hit) => {
                  const idx = flat.indexOf(hit);
                  const active = idx === selected;
                  return (
                    <button
                      key={hit.id}
                      onMouseEnter={() => setSelected(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        go(hit);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 ${
                        active ? "bg-nordic-100" : "hover:bg-nordic-50"
                      }`}
                    >
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${TYPE_CLS[hit.entityType]}`}>
                        {TYPE_LABEL[hit.entityType]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium truncate">{hit.title}</span>
                        {hit.subtitle && (
                          <span className="block text-xs text-muted-foreground truncate">{hit.subtitle}</span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
