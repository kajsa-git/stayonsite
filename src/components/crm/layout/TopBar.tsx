"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewCompanyModal } from "@/components/crm/company/NewCompanyModal";
import { useGlobalSearch } from "@/components/crm/search/GlobalSearch";
import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { ChevronLeft, ChevronRight, LogOut, Plus, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopBarProps {
  currentIndex?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function TopBar({ currentIndex, total, onPrev, onNext }: TopBarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { counts } = useQueueCounts();
  const { open: openSearch } = useGlobalSearch();
  const [showNewCompany, setShowNewCompany] = useState(false);

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

      <nav className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => router.push("/crm")}
          className="text-xs px-2 py-1 rounded text-nordic-700 hover:bg-nordic-100 transition-colors"
        >
          Min dag
        </button>
        <button
          onClick={() => router.push("/crm/oversikt")}
          className="text-xs px-2 py-1 rounded text-nordic-700 hover:bg-nordic-100 transition-colors"
        >
          Översikt
        </button>
        <button
          onClick={() => router.push("/crm/foretag")}
          className="text-xs px-2 py-1 rounded text-nordic-700 hover:bg-nordic-100 transition-colors"
        >
          Företagsbank
        </button>
        <button
          onClick={() => router.push("/crm/properties")}
          className="text-xs px-2 py-1 rounded text-nordic-700 hover:bg-nordic-100 transition-colors"
        >
          Objektsbank
        </button>
        <button
          onClick={() => router.push("/crm/flyttar")}
          className="text-xs px-2 py-1 rounded text-nordic-700 hover:bg-nordic-100 transition-colors"
          title="In- & avflyttningar att hantera"
        >
          In- & avflyttningar
          {counts.moveSchedule > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff6300] text-white text-[10px] font-bold tabular-nums align-middle">
              {String(counts.moveSchedule).padStart(2, "0")}
            </span>
          )}
        </button>
        <button
          onClick={() => router.push("/crm/sok")}
          className="text-xs px-2 py-1 rounded text-nordic-700 hover:bg-nordic-100 transition-colors"
        >
          Sök
        </button>
      </nav>

      {total != null && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
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
        className="relative flex-1 max-w-sm flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground bg-nordic-50 border rounded-md hover:bg-nordic-100 transition-colors"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span>Sök företag, förfrågan, objekt…</span>
        <kbd className="ml-auto text-[10px] border rounded px-1.5 py-0.5 bg-white shrink-0">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2 ml-auto shrink-0">
        <Badge
          variant="secondary"
          className="cursor-pointer text-xs"
          onClick={() => router.push("/crm")}
          title="Att kontakta idag"
        >
          {counts.followUps} kontakta
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

          <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setShowNewCompany(true)}
          title="Ny kund (⌘N)"
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

      <NewCompanyModal open={showNewCompany} onClose={() => setShowNewCompany(false)} />
    </div>
  );
}
