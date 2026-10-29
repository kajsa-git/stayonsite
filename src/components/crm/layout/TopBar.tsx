"use client";

import { Button } from "@/components/ui/button";
import { NewCompanyModal } from "@/components/crm/company/NewCompanyModal";
import { ProfitCalculatorDialog } from "@/components/crm/ProfitCalculatorDialog";
import { useGlobalSearch } from "@/components/crm/search/GlobalSearch";
import { Calculator, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Breadcrumbs } from "./PageTrail";

// Navigationen bor i sidomenyn (desktop) och flikraden (mobil). Toppraden svarar
// bara på "var är jag?" och har de två snabbaste genvägarna till höger.
export function TopBar() {
  const { open: openSearch } = useGlobalSearch();
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-nordic-200 bg-white/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <Link href="/crm" className="flex shrink-0 items-center gap-2 md:hidden" title="Till Min dag">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stayonsite-logo.png" alt="StayOnSite" className="h-5 w-auto" />
        <span className="border-l pl-2 text-xs font-medium text-muted-foreground">CRM</span>
      </Link>

      <div className="hidden min-w-0 flex-1 md:flex">
        <Breadcrumbs />
      </div>

      <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowCalc(true)} title="Vinstkalkylator">
          <Calculator className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-[#ff6300] text-xs text-white shadow-sm transition-all hover:bg-[#e65800] hover:shadow active:scale-[0.97]"
          onClick={() => setShowNewCompany(true)}
          title="Ny kund"
        >
          <Plus className="h-3.5 w-3.5" />
          Ny kund
        </Button>
      </div>

      {/* Mobil: kompakt högercluster — global sök (navigation via bottom-tabbar) */}
      <div className="ml-auto flex shrink-0 items-center md:hidden">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={openSearch} title="Sök allt">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <NewCompanyModal open={showNewCompany} onClose={() => setShowNewCompany(false)} />
      <ProfitCalculatorDialog open={showCalc} onOpenChange={setShowCalc} />
    </div>
  );
}
