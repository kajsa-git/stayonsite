"use client";

export async function billingFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store", ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
  return data as T;
}

export function billingMoney(minor: number): string {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(minor / 100);
}
