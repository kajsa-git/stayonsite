"use client";

import useSWR from "swr";

interface QueueCounts {
  followUps: number;
  matching: number;
  invoiced: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useQueueCounts() {
  const { data, error } = useSWR<QueueCounts>("/api/crm/queue-counts", fetcher, {
    refreshInterval: 15000,
  });

  return {
    counts: data ?? { followUps: 0, matching: 0, invoiced: 0 },
    isLoading: !data && !error,
  };
}
