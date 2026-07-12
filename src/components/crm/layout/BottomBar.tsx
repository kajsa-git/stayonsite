"use client";

import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Arbetsbeskrivningarna på /crm/guide — sektions-id:n måste matcha GuideView.tsx.
const GUIDE_LINKS = [
  { label: "Förfrågan", anchor: "forfragan" },
  { label: "Matchning", anchor: "matchning" },
  { label: "Uthyrare", anchor: "uthyrare" },
  { label: "Fakturera", anchor: "vinna-fakturera" },
];

export function BottomBar() {
  const { counts } = useQueueCounts();
  const router = useRouter();

  return (
    <div className="h-10 border-t bg-white hidden md:flex items-center px-4 gap-6 text-xs text-muted-foreground sticky bottom-0">
      <span className="text-muted-foreground/70">Din kö idag:</span>
      <button className="hover:text-foreground transition-colors" onClick={() => router.push("/crm")}>
        <span className="font-semibold text-foreground">{counts.followUps}</span> att kontakta
      </button>
      <button className="hover:text-foreground transition-colors" onClick={() => router.push("/crm")}>
        <span className="font-semibold text-foreground">{counts.openWithoutFollowUp}</span> öppna uppdrag
      </button>
      <button className="hover:text-foreground transition-colors" onClick={() => router.push("/crm")}>
        <span className="font-semibold text-foreground">{counts.toInvoice}</span> ska faktureras
      </button>
      <button className="hover:text-foreground transition-colors" onClick={() => router.push("/crm")}>
        <span className="font-semibold text-foreground">{counts.chaseLandlords}</span> jaga hyresvärdar
      </button>

      <span className="ml-auto text-muted-foreground/70">Så arbetar vi:</span>
      <div className="flex items-center gap-4">
        {GUIDE_LINKS.map((g) => (
          <Link key={g.anchor} href={`/crm/guide#${g.anchor}`} className="hover:text-foreground transition-colors">
            {g.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
