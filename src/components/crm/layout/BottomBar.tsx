"use client";

import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { useRouter } from "next/navigation";

export function BottomBar() {
  const { counts } = useQueueCounts();
  const router = useRouter();

  return (
    <div className="h-10 border-t bg-white flex items-center px-4 gap-6 text-xs text-muted-foreground sticky bottom-0">
      <button
        className="hover:text-foreground transition-colors"
        onClick={() => router.push("/crm")}
      >
        <span className="font-semibold text-foreground">{counts.followUps}</span> återkomster idag
      </button>
      <button
        className="hover:text-foreground transition-colors"
        onClick={() => router.push("/crm")}
      >
        <span className="font-semibold text-foreground">{counts.matching}</span> pågående matchningar
      </button>
      <button
        className="hover:text-foreground transition-colors"
        onClick={() => router.push("/crm")}
      >
        <span className="font-semibold text-foreground">{counts.invoiced}</span> att fakturera
      </button>
      <div className="ml-auto text-[10px] text-muted-foreground/50">
        F1 Matcha · F2 Återkom · F3 Fakturerad · F4 Nej tack · F5 Arkivera
      </div>
    </div>
  );
}
