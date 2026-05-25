"use client";
import { QueueProvider } from "@/contexts/crm/QueueContext";
import { QueueBanner } from "./QueueBanner";
import { CompanyCard } from "../company/CompanyCard";
import type { QueueItem } from "@/lib/crm/queue";

interface WorkViewProps {
  queue: string;
  companyId: string;
  requestId: string | null;
  items: QueueItem[];
}

export function WorkView({ queue, companyId, requestId, items }: WorkViewProps) {
  return (
    <QueueProvider queue={queue} items={items} currentCompanyId={companyId} currentRequestId={requestId}>
      <div className="max-w-4xl mx-auto p-6">
        <QueueBanner requestId={requestId} />
        <CompanyCard companyId={companyId} activeRequestId={requestId} />
      </div>
    </QueueProvider>
  );
}
