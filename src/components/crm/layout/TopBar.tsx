"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { useSearch } from "@/hooks/crm/useSearch";
import { Building2, ChevronLeft, ChevronRight, LogOut, Search } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface TopBarProps {
  currentIndex?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
  searchRef?: React.RefObject<HTMLInputElement>;
}

export function TopBar({ currentIndex, total, onPrev, onNext, searchRef }: TopBarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { counts } = useQueueCounts();
  const { query, setQuery, results, clear } = useSearch();
  const [showDropdown, setShowDropdown] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = searchRef ?? internalRef;

  useEffect(() => {
    setShowDropdown(results.length > 0 && query.length >= 2);
  }, [results, query]);

  return (
    <div className="h-14 border-b bg-white flex items-center px-4 gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-2 text-nordic-700 font-semibold text-sm shrink-0">
        <Building2 className="h-4 w-4" />
        <span>StayOnSite CRM</span>
      </div>

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

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          className="pl-8 h-9 text-sm"
          placeholder="Sök företag… (⌘F)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />
        {showDropdown && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                className="w-full text-left px-3 py-2 text-sm hover:bg-nordic-100 flex flex-col"
                onMouseDown={() => {
                  clear();
                  router.push(`/crm/company/${r.id}`);
                }}
              >
                <span className="font-medium">{r.name}</span>
                {(r.orgNr || r.category) && (
                  <span className="text-xs text-muted-foreground">
                    {[r.category, r.orgNr].filter(Boolean).join(" · ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto shrink-0">
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
          title="Aktiva matchningar"
        >
          {counts.matching} matching
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer text-xs"
          onClick={() => router.push("/crm")}
          title="Att fakturera"
        >
          {counts.invoiced} faktura
        </Badge>

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
    </div>
  );
}
