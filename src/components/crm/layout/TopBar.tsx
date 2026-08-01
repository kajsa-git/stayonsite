"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewCompanyModal } from "@/components/crm/company/NewCompanyModal";
import { ProfitCalculatorDialog } from "@/components/crm/ProfitCalculatorDialog";
import { useGlobalSearch } from "@/components/crm/search/GlobalSearch";
import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { Calculator, ChevronLeft, ChevronRight, LogOut, Plus, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS: { href: string; label: string; exact?: boolean; title?: string }[] = [
  { href: "/crm", label: "Min dag", exact: true },
  { href: "/crm/oversikt", label: "Översikt" },
  { href: "/crm/foretag", label: "Företagsbank" },
  { href: "/crm/properties", label: "Objektsbank" },
  { href: "/crm/uthyrare", label: "Uthyrare" },
  { href: "/crm/flyttar", label: "In- & avflyttningar", title: "In- & avflyttningar att hantera" },
  { href: "/crm/sok", label: "Sök" },
];

interface TopBarProps {
  currentIndex?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function TopBar({ currentIndex, total, onPrev, onNext }: TopBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { counts } = useQueueCounts();
  const { open: openSearch } = useGlobalSearch();
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  return (
    <div className="h-14 border-b bg-white flex items-center px-4 gap-4 sticky top-0 z-40">
      <button
        onClick={() => router.push("/crm")}
        className="flex items-center gap-2 shrink-0"
        title="Till Min dag"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-5 w-auto" />
        <span className="text-xs font-medium text-muted-foreground border-l pl-2">CRM</span>
      </button>

      <nav className="hidden md:flex items-center gap-0.5 shrink-0">
        {NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              title={item.title}
              aria-current={active ? "page" : undefined}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                active ? "bg-nordic-100 text-nordic-900 font-semibold" : "text-nordic-700 hover:bg-nordic-100"
              }`}
            >
              {item.label}
              {item.href === "/crm/flyttar" && counts.moveSchedule > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff6300] text-white text-[10px] font-bold tabular-nums align-middle">
                  {counts.moveSchedule}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {total != null && (
        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onPrev} disabled={currentIndex === 0}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span>
            {(currentIndex ?? 0) + 1} / {total}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onNext} disabled={currentIndex === total - 1}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}

      <button
        onClick={openSearch}
        title="Sök allt (⌘K)"
        className="relative flex-1 max-w-sm hidden md:flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground bg-nordic-50 border rounded-md hover:bg-nordic-100 transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Sök företag, förfrågan, objekt…</span>
        <kbd className="ml-auto text-[10px] border rounded px-1.5 py-0.5 bg-white shrink-0">⌘K</kbd>
      </button>

      <div className="hidden md:flex items-center gap-2 ml-auto shrink-0">
        {/* Kö-badges dubblerar Min dags räknare — visas bara när de får plats.
            Hela raden (logo+nav+sök+badges+knappar) kräver ~1570px, så 1600 är
            första säkra brytpunkten; under den trängde badgen ut Ny kund. */}
        <div className="hidden min-[1600px]:flex items-center gap-2">
          <Badge
            variant="secondary"
            className="cursor-pointer text-xs"
            onClick={() => router.push("/crm")}
            title="Återkomster idag"
          >
            {counts.followUps} återkomster
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer text-xs"
            onClick={() => router.push("/crm")}
            title="Öppna uppdrag utan återkomst"
          >
            {counts.openWithoutFollowUp} öppna
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer text-xs"
            onClick={() => router.push("/crm")}
            title="Ska faktureras"
          >
            {counts.toInvoice} fakturera
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowCalc(true)}
          title="Vinstkalkylator"
        >
          <Calculator className="h-4 w-4" />
        </Button>

          <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setShowNewCompany(true)}
          title="Ny kund"
        >
          <Plus className="h-3.5 w-3.5" />
          Ny kund
        </Button>

        {session?.user?.name && (
          <span className="text-xs text-muted-foreground hidden md:block">
            {session.user.name}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => signOut({ callbackUrl: "/crm/login" })}
          title="Logga ut"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobil: kompakt högercluster — global sök (navigation via bottom-tabbar) */}
      <div className="flex md:hidden items-center ml-auto shrink-0">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={openSearch} title="Sök allt">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <NewCompanyModal open={showNewCompany} onClose={() => setShowNewCompany(false)} />
      <ProfitCalculatorDialog open={showCalc} onOpenChange={setShowCalc} />
    </div>
  );
}
