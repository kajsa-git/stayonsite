"use client";

import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { useRouter } from "next/navigation";

export function BottomBar() {
  const { counts } = useQueueCounts();
  const router = useRouter();

  return (
    <div className="h-10 border-t bg-white flex items-center px-4 gap-6 text-xs text-muted-foreground sticky bottom-0">
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
    </div>
  );
}
