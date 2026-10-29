"use client";

import { recordRecent, type RecentKind } from "@/lib/crm/recent";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useId, useState } from "react";
import { activeNavItem } from "./nav";

export interface Crumb {
  label: string;
  href?: string;
}

type Trail = { owner: string; crumbs: Crumb[] } | null;

const PageTrailContext = createContext<{ trail: Trail; setTrail: React.Dispatch<React.SetStateAction<Trail>> }>({
  trail: null,
  setTrail: () => {},
});

export function PageTrailProvider({ children }: { children: React.ReactNode }) {
  const [trail, setTrail] = useState<Trail>(null);
  return <PageTrailContext.Provider value={{ trail, setTrail }}>{children}</PageTrailContext.Provider>;
}

/**
 * Detaljvyer talar om var de ligger: sektionen (t.ex. "Företagsbank") läggs till
 * automatiskt från sökvägen, vyn skickar bara det som kommer efter. Med `recent`
 * hamnar sidan också i "Senast besökta".
 */
export function usePageTrail(crumbs: Crumb[] | null, recent?: { kind: RecentKind; label: string; href: string }) {
  const { setTrail } = useContext(PageTrailContext);
  const owner = useId();
  const key = JSON.stringify(crumbs);
  const recentKey = recent ? `${recent.kind}|${recent.label}|${recent.href}` : "";

  useEffect(() => {
    setTrail(crumbs ? { owner, crumbs } : null);
    return () => setTrail((t) => (t?.owner === owner ? null : t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, owner, setTrail]);

  useEffect(() => {
    if (recent) recordRecent(recent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentKey]);
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const { trail } = useContext(PageTrailContext);
  const section = activeNavItem(pathname);
  if (!section) return null;

  const crumbs = trail?.crumbs ?? [];
  const SectionIcon = section.icon;

  return (
    <nav aria-label="Du är här" className="flex min-w-0 items-center gap-1 text-sm">
      <Link
        href={section.href}
        className={`flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-nordic-100 ${
          crumbs.length ? "text-nordic-500 hover:text-nordic-900" : "font-semibold text-nordic-900"
        }`}
      >
        <SectionIcon className="h-4 w-4" />
        {section.label}
      </Link>
      <AnimatePresence initial={false} mode="popLayout">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <motion.span
              key={`${i}-${c.label}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              className={`flex items-center gap-1 ${last ? "min-w-0" : "shrink-0"}`}
            >
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-nordic-300" />
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="max-w-[16rem] truncate rounded-md px-1.5 py-1 text-nordic-500 transition-colors hover:bg-nordic-100 hover:text-nordic-900"
                >
                  {c.label}
                </Link>
              ) : !last ? (
                <span className="max-w-[16rem] truncate px-1.5 py-1 text-nordic-500">{c.label}</span>
              ) : (
                <span aria-current="page" className="truncate px-1.5 py-1 font-semibold text-nordic-900">
                  {c.label}
                </span>
              )}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </nav>
  );
}
