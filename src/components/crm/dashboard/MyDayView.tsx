"use client";

import { format } from "date-fns";
import { sv } from "date-fns/locale";
import useSWR from "swr";
import { useRouter } from "next/navigation";

interface CompanyQueue {
  id: string;
  name: string;
  followUpDate?: string | null;
  followUpReason?: string | null;
}

interface RequestQueue {
  id: string;
  requestNumber: number | null;
  companyId: string;
  companyName?: string;
  city?: string | null;
  status: string;
}

interface QueueData {
  followUps: CompanyQueue[];
  matching: RequestQueue[];
  invoiced: RequestQueue[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MyDayView() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const { data } = useSWR<QueueData>("/api/crm/queues", fetcher, {
    refreshInterval: 15000,
  });

  const queues = data ?? { followUps: [], matching: [], invoiced: [] };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nordic-900">Min dag</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: sv })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <QueueSection
          title="Återkomster"
          emoji="📅"
          items={queues.followUps}
          emptyText="Inga återkomster idag"
          renderItem={(item) => (
            <button
              key={item.id}
              className="w-full text-left p-3 rounded-lg bg-white border hover:border-primary-400 transition-colors"
              onClick={() => router.push(`/crm/company/${item.id}`)}
            >
              <div className="font-medium text-sm">{item.name}</div>
              {item.followUpDate && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.followUpDate === today ? "Idag" : item.followUpDate}
                  {item.followUpReason && ` · ${item.followUpReason}`}
                </div>
              )}
            </button>
          )}
        />

        <QueueSection
          title="Pågående matchningar"
          emoji="🏠"
          items={queues.matching}
          emptyText="Inga aktiva matchningar"
          renderItem={(item) => (
            <button
              key={item.id}
              className="w-full text-left p-3 rounded-lg bg-white border hover:border-amber-400 transition-colors"
              onClick={() => router.push(`/crm/matching/${item.id}`)}
            >
              <div className="font-medium text-sm">#{item.requestNumber} {item.companyName}</div>
              {item.city && (
                <div className="text-xs text-muted-foreground mt-0.5">{item.city}</div>
              )}
            </button>
          )}
        />

        <QueueSection
          title="Att fakturera"
          emoji="✅"
          items={queues.invoiced}
          emptyText="Inget att fakturera"
          renderItem={(item) => (
            <button
              key={item.id}
              className="w-full text-left p-3 rounded-lg bg-white border hover:border-green-400 transition-colors"
              onClick={() => router.push(`/crm/company/${item.companyId}`)}
            >
              <div className="font-medium text-sm">#{item.requestNumber} {item.companyName}</div>
              {item.city && (
                <div className="text-xs text-muted-foreground mt-0.5">{item.city}</div>
              )}
            </button>
          )}
        />
      </div>
    </div>
  );
}

function QueueSection<T extends { id: string }>({
  title,
  emoji,
  items,
  emptyText,
  renderItem,
}: {
  title: string;
  emoji: string;
  items: T[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span>{emoji}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{emptyText}</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}
