// Formregler för MCP-verktygens svar: kompakt JSON (null-fält strippas),
// hårda tak på listlängder och textfält, CRM-djuplänkar. Allt ett verktyg
// returnerar hamnar i en LLM-kontext — håll det litet och länkbart.
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../schema";

export type DB = LibSQLDatabase<typeof schema>;

export interface ToolResult {
  content: { type: "text"; text: string }[];
  isError?: boolean;
  [key: string]: unknown;
}

// Kompakt JSON utan null-fält (LLM:en läser frånvaro som "saknas").
export function jsonContent(payload: unknown): ToolResult {
  const text = JSON.stringify(payload, (_key, value) => (value === null ? undefined : value));
  return { content: [{ type: "text", text }] };
}

// Fel som verktygssvar (inte throw) — vänligare för agenter än ett protokollfel.
export function errorContent(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

// Servern clampar alltid, oavsett vad schemat tillåter.
export function clampLimit(limit: number | undefined, def: number, max: number): number {
  if (!limit || !Number.isFinite(limit)) return def;
  return Math.max(1, Math.min(Math.floor(limit), max));
}

export function truncate(s: string | null | undefined, max: number): string | null {
  if (s == null) return null;
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

// Samma route-strängar som sökindexet skriver (search-index.ts) — prefixa med
// https://www.stayonsite.se för klickbara djuplänkar.
export const crmRoute = {
  company: (id: string) => `/crm/company/${id}`,
  owner: (id: string) => `/crm/uthyrare/${id}`,
  property: (id: string) => `/crm/properties?id=${id}`,
};

export const BASE_URL_NOTE = "crmUrl paths are relative — prepend https://www.stayonsite.se to deep-link.";
