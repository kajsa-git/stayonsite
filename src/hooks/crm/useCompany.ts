"use client";

import type { Company, Contact, Note, Request } from "@/lib/crm/schema";
import useSWR from "swr";

export interface CompanyFull extends Company {
  contacts: Contact[];
  requests: Request[];
  notes: Note[];
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCompany(id: string | null) {
  const { data, error, mutate } = useSWR<CompanyFull>(
    id ? `/api/crm/companies/${id}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  return { company: data, isLoading: !data && !error, error, mutate };
}
