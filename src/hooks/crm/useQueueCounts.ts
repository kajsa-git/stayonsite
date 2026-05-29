"use client";

import useSWR from "swr";

interface QueueCounts {
  followUps: number;
  openWithoutFollowUp: number;
  toInvoice: number;
  chaseLandlords: number;
  moveSchedule: number;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useQueueCounts() {
  const { data, error } = useSWR<QueueCounts>("/api/crm/queue-counts", fetcher, {
    refreshInterval: 15000,
  });

  return {
    counts: data ?? { followUps: 0, openWithoutFollowUp: 0, toInvoice: 0, chaseLandlords: 0, moveSchedule: 0 },
    isLoading: !data && !error,
  };
}
