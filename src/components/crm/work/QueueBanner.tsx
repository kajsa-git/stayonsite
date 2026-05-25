"use client";
import { useQueue } from "@/contexts/crm/QueueContext";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutDashboard } from "lucide-react";
import { useEffect } from "react";

interface QueueBannerProps {
  requestId: string | null;
}

export function QueueBanner({ requestId }: QueueBannerProps) {
  const queue = useQueue();
  const router = useRouter();

  useEffect(() => {
    if (!queue) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const target = e.target;
      if (target instanceof HTMLElement) {
        if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
        if (target.isContentEditable) return;
        if (target.getAttribute("role") === "combobox") return;
      }
      // Bail if any Radix overlay (dialog / select / menu) is open
      if (document.querySelector('[role="dialog"],[role="listbox"],[role="menu"]')) return;
      if (e.key === "ArrowLeft" && !queue.isFirst) queue.goPrev();
      if (e.key === "ArrowRight" && !queue.isLast) queue.goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [queue]);

  if (!queue) return null;

  const isItemStillInQueue = queue.currentIndex >= 0;
  const position = isItemStillInQueue ? queue.currentIndex + 1 : null;

  return (
    <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-white border border-[#d4d4d2] rounded-[4px] text-sm">
      <button
        onClick={() => router.push("/crm")}
        className="flex items-center gap-1.5 text-[#5a5a5a] hover:text-[#1a1a1a] transition-colors shrink-0"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span className="text-xs">Min dag</span>
      </button>

      <span className="text-[#d4d4d2]">/</span>

      <span className="font-medium text-[#1a1a1a]">{queue.label}</span>

      {position !== null ? (
        <>
          <span className="text-[#8a8a8a] tabular-nums">
            {position} / {queue.total}
          </span>

          {queue.currentItem?.statusLabel && (
            <>
              <span className="text-[#d4d4d2]">·</span>
              <span className="text-[#5a5a5a] text-xs">{queue.currentItem.statusLabel}</span>
            </>
          )}

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={queue.goPrev}
              disabled={queue.isFirst}
              className="h-6 w-6 flex items-center justify-center border border-[#d4d4d2] rounded-[4px] hover:bg-[#f5f5f4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Föregående (←)"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={queue.goNext}
              disabled={queue.isLast}
              className="h-6 w-6 flex items-center justify-center border border-[#d4d4d2] rounded-[4px] hover:bg-[#f5f5f4] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Nästa (→)"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="text-[#8a8a8a] text-xs ml-1">Klar i den här kön</span>
          <div className="ml-auto flex items-center gap-2">
            {!queue.isLast && (
              <button
                onClick={queue.goNext}
                className="flex items-center gap-1 text-xs px-3 py-1 bg-[#1a1a1a] text-white rounded-[4px] hover:bg-[#333] transition-colors"
              >
                Nästa i kön
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
            {queue.isLast && (
              <button
                onClick={() => router.push("/crm")}
                className="flex items-center gap-1 text-xs px-3 py-1 border border-[#d4d4d2] rounded-[4px] hover:bg-[#f5f5f4] transition-colors"
              >
                <LayoutDashboard className="h-3 w-3" />
                Kön är klar — Till Min dag
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
