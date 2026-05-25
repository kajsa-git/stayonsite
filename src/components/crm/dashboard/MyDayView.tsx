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

interface ChaseRow {
  id: string;
  requestId: string;
  followUpDate?: string | null;
  propertyAddress?: string | null;
  companyName?: string | null;
  requestNumber?: number | null;
}

interface QueueData {
  followUps: CompanyQueue[];
  incoming: RequestQueue[];
  matching: RequestQueue[];
  won: RequestQueue[];
  chaseLandlords: ChaseRow[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MyDayView() {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const { data } = useSWR<QueueData>("/api/crm/queues", fetcher, { refreshInterval: 15000 });
  const queues = data ?? { followUps: [], incoming: [], matching: [], won: [], chaseLandlords: [] };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nordic-900">Min dag</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(), "EEEE d MMMM yyyy", { locale: sv })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <QueueSection
          title="Nya förfrågningar"
          emoji="📥"
          items={queues.incoming}
          emptyText="Inga nya förfrågningar"
          renderItem={(item) => (
            <RequestRow
              key={item.id}
              item={item}
              accent="hover:border-purple-400"
              onClick={() => router.push(`/crm/work/incoming/${item.companyId}?request=${item.id}`)}
            />
          )}
        />

        <QueueSection
          title="Att kontakta"
          emoji="📞"
          items={queues.followUps}
          emptyText="Inga återkomster idag"
          renderItem={(item) => (
            <button
              key={item.id}
              className="w-full text-left p-3 rounded-lg bg-white border hover:border-primary-400 transition-colors"
              onClick={() => router.push(`/crm/work/followups/${item.id}`)}
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
            <RequestRow
              key={item.id}
              item={item}
              accent="hover:border-amber-400"
              onClick={() => router.push(`/crm/work/matching/${item.companyId}?request=${item.id}`)}
            />
          )}
        />

        <QueueSection
          title="Att fakturera"
          emoji="🧾"
          items={queues.won}
          emptyText="Inget att fakturera"
          renderItem={(item) => (
            <RequestRow
              key={item.id}
              item={item}
              accent="hover:border-green-400"
              onClick={() => router.push(`/crm/work/won/${item.companyId}?request=${item.id}`)}
            />
          )}
        />

        <QueueSection
          title="Jaga hyresvärdar"
          emoji="📲"
          items={queues.chaseLandlords}
          emptyText="Inget att jaga"
          renderItem={(item) => (
            <button
              key={item.id}
              className="w-full text-left p-3 rounded-lg bg-white border hover:border-rose-400 transition-colors"
              onClick={() => router.push(`/crm/matching/${item.requestId}`)}
            >
              <div className="font-medium text-sm truncate">{item.propertyAddress ?? "(bostad)"}</div>
              <div className="text-xs text-muted-foreground truncate">
                #{item.requestNumber} {item.companyName}
                {item.followUpDate && ` · ${item.followUpDate <= today ? "idag/försenad" : item.followUpDate}`}
              </div>
            </button>
          )}
        />
      </div>
    </div>
  );
}

function RequestRow({ item, accent, onClick }: { item: RequestQueue; accent: string; onClick: () => void }) {
  return (
    <button
      className={`w-full text-left p-3 rounded-lg bg-white border transition-colors ${accent}`}
      onClick={onClick}
    >
      <div className="font-medium text-sm">
        #{item.requestNumber} {item.companyName}
      </div>
      {item.city && <div className="text-xs text-muted-foreground mt-0.5">{item.city}</div>}
    </button>
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
