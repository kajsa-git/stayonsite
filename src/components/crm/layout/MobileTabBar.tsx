"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { NewCompanyModal } from "@/components/crm/company/NewCompanyModal";
import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { Building2, CalendarDays, Home, LogOut, type LucideIcon, Menu, Plus, Search, Truck } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Tab = { label: string; icon: LucideIcon; href?: string; exact?: boolean; action?: "more" };

const TABS: Tab[] = [
  { label: "Min dag", icon: CalendarDays, href: "/crm", exact: true },
  { label: "Objekt", icon: Home, href: "/crm/properties" },
  { label: "Företag", icon: Building2, href: "/crm/foretag" },
  { label: "Sök", icon: Search, href: "/crm/sok" },
  { label: "Mer", icon: Menu, action: "more" },
];

// App-lik flikrad i botten, bara på mobil (md:hidden). Skalet renderas i den
// skyddade CRM-layouten; "Mer" rymmer det som inte får plats som egen flik.
export function MobileTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { counts } = useQueueCounts();
  const { data: session } = useSession();
  const [moreOpen, setMoreOpen] = useState(false);
  const [showNewCompany, setShowNewCompany] = useState(false);

  // Flyttar bor inne i "Mer" → flagga flikens prick när det finns något att hantera.
  const morePending = counts.moveSchedule > 0;

  const isActive = (tab: Tab) =>
    tab.href ? (tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(tab.href + "/")) : false;

  function go(href: string) {
    setMoreOpen(false);
    router.push(href);
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex border-t bg-white pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => (tab.action === "more" ? setMoreOpen(true) : go(tab.href!))}
              aria-current={active ? "page" : undefined}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 h-14 text-[10px] font-medium transition-colors ${
                active ? "text-[#ff6300]" : "text-nordic-500 hover:text-nordic-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
              {tab.action === "more" && morePending && (
                <span className="absolute top-2 right-1/2 translate-x-3 h-2 w-2 rounded-full bg-[#ff6300]" />
              )}
            </button>
          );
        })}
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="right" className="w-72 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Meny</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-1">
            <MoreLink label="Översikt" onClick={() => go("/crm/oversikt")} />
            <MoreLink
              label="In- & avflyttningar"
              badge={counts.moveSchedule}
              icon={Truck}
              onClick={() => go("/crm/flyttar")}
            />
          </div>

          <div className="mt-5 border-t pt-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Din kö idag</p>
            <div className="grid grid-cols-2 gap-2">
              <QueueStat value={counts.followUps} label="att kontakta" onClick={() => go("/crm")} />
              <QueueStat value={counts.openWithoutFollowUp} label="öppna uppdrag" onClick={() => go("/crm")} />
              <QueueStat value={counts.toInvoice} label="ska faktureras" onClick={() => go("/crm")} />
              <QueueStat value={counts.chaseLandlords} label="jaga hyresvärdar" onClick={() => go("/crm")} />
            </div>
          </div>

          <div className="mt-5 border-t pt-4 space-y-3">
            <button
              onClick={() => { setMoreOpen(false); setShowNewCompany(true); }}
              className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-md bg-[#ff6300] text-white text-sm font-medium hover:bg-[#e65800] transition-colors"
            >
              <Plus className="h-4 w-4" /> Ny kund
            </button>
            {session?.user?.name && (
              <p className="text-xs text-muted-foreground text-center">{session.user.name}</p>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/crm/login" })}
              className="w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-md border border-input text-sm hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logga ut
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <NewCompanyModal open={showNewCompany} onClose={() => setShowNewCompany(false)} />
    </>
  );
}

function MoreLink({
  label,
  onClick,
  badge,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  badge?: number;
  icon?: LucideIcon;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-2.5 rounded-md text-sm text-nordic-800 hover:bg-nordic-100 transition-colors"
    >
      {Icon && <Icon className="h-4 w-4 text-nordic-500" />}
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff6300] text-white text-[10px] font-bold tabular-nums">
          {badge}
        </span>
      )}
    </button>
  );
}

function QueueStat({ value, label, onClick }: { value: number; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border bg-nordic-50 px-2.5 py-2 text-left hover:bg-nordic-100 transition-colors"
    >
      <div className="text-base font-semibold text-foreground tabular-nums">{value}</div>
      <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
    </button>
  );
}
