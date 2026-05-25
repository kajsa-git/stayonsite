"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";

interface SearchResult {
  id: string;
  name: string;
  orgNr: string | null;
  category: string | null;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSearch() {
  const [query, setQuery] = useState("");

  const { data: results = [] } = useSWR<SearchResult[]>(
    query.length >= 2 ? `/api/crm/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );

  const clear = useCallback(() => setQuery(""), []);

  return { query, setQuery, results, clear };
}
