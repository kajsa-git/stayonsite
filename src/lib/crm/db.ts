import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Lazy libSQL-klient: createClient() validerar URL:en synkront, så om den körs
// vid module-load kraschar `next build` ("Collecting page data") när
// TURSO_DATABASE_URL saknas — t.ex. i Vercels preview-miljö.
//
// Vi gör KLIENTEN lat, inte drizzle-db:n: drizzle(client, …) rör aldrig klienten
// vid konstruktion utan bara när en query körs. Då förblir `db` en riktig
// LibSQLDatabase (så att `is(db, BaseSQLiteDatabase)` i @auth/drizzle-adapter,
// instanceof m.m. funkar), medan uppkopplingen sker först vid request. Saknas
// URL:en i drift kastar getClient() högljutt — ingen tyst fallback.
let client: Client | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// Ett namngivet "constructor" så att drizzles isConfig() — som läser
// client.constructor.name för att skilja en config från en klientinstans —
// kan svara utan att skapa klienten. name !== "Object" ⇒ behandlas som klient.
function LazyLibSQLClient() {}

const lazyClient = new Proxy({} as Client, {
  get(_target, prop) {
    if (prop === "constructor") return LazyLibSQLClient;
    const real = getClient() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export const db = drizzle(lazyClient, { schema });
