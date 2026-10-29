"use client";

import { useSyncExternalStore } from "react";

export type RecentKind = "company" | "owner" | "property" | "request";

export interface RecentItem {
  kind: RecentKind;
  label: string;
  href: string;
  at: number;
}

// "Senast besökta" bor bara i den här webbläsaren (localStorage) — det är en
// personlig hitta-tillbaka-lista, inte delad data.
const KEY = "crm.recent.v1";
const MAX = 8;
const EMPTY: RecentItem[] = [];

let cache: RecentItem[] | null = null;
const listeners = new Set<() => void>();

function read(): RecentItem[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache!;
}

export function recordRecent(item: Omit<RecentItem, "at">) {
  if (!item.label.trim()) return;
  const current = read();
  if (current[0]?.href === item.href && current[0]?.label === item.label) return;
  cache = [{ ...item, at: Date.now() }, ...current.filter((r) => r.href !== item.href)].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    // Privat läge / blockerad lagring — listan lever då bara i minnet.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useRecent(): RecentItem[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
