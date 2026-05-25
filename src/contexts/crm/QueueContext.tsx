"use client";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";
import type { QueueItem } from "@/lib/crm/queue";

export const QUEUE_LABELS: Record<string, string> = {
  followups: "Återkomster",
  incoming: "Nya förfrågningar",
  matching: "Pågående matchningar",
  won: "Att fakturera",
};

type QueueContextValue = {
  queue: string;
  label: string;
  items: QueueItem[];
  currentIndex: number;
  total: number;
  currentItem: QueueItem | null;
  goNext: () => void;
  goPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
};

const QueueContext = createContext<QueueContextValue | null>(null);

export function QueueProvider({
  queue,
  items,
  currentCompanyId,
  currentRequestId,
  children,
}: {
  queue: string;
  items: QueueItem[];
  currentCompanyId: string;
  currentRequestId?: string | null;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const currentIndex = useMemo(
    () =>
      items.findIndex((i) =>
        currentRequestId && i.requestId
          ? i.requestId === currentRequestId
          : i.companyId === currentCompanyId
      ),
    [items, currentCompanyId, currentRequestId]
  );

  const navigate = useCallback(
    (item: QueueItem) => {
      const url = item.requestId
        ? `/crm/work/${queue}/${item.companyId}?request=${item.requestId}`
        : `/crm/work/${queue}/${item.companyId}`;
      router.push(url);
    },
    [queue, router]
  );

  const goNext = useCallback(() => {
    const next = items[currentIndex + 1];
    if (next) navigate(next);
  }, [items, currentIndex, navigate]);

  const goPrev = useCallback(() => {
    const prev = items[currentIndex - 1];
    if (prev) navigate(prev);
  }, [items, currentIndex, navigate]);

  const value: QueueContextValue = {
    queue,
    label: QUEUE_LABELS[queue] ?? queue,
    items,
    currentIndex,
    total: items.length,
    currentItem: items[currentIndex] ?? null,
    goNext,
    goPrev,
    isFirst: currentIndex <= 0,
    isLast: currentIndex >= items.length - 1,
  };

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueue() {
  return useContext(QueueContext);
}
