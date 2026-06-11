"use client";

import type { Company, Contact, Note, Request } from "@/lib/crm/schema";
import useSWR from "swr";
import { swrFetcher } from "@/lib/crm/fetcher";

export interface CompanyFull extends Company {
  contacts: Contact[];
  requests: Request[];
  notes: Note[];
}

const fetcher = swrFetcher;

export function useCompany(id: string | null) {
  const { data, error, mutate } = useSWR<CompanyFull>(
    id ? `/api/crm/companies/${id}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  return { company: data, isLoading: !data && !error, error, mutate };
}
