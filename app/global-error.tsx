"use client";

// Global felfångare. Vanligaste klientfelet i praktiken: en flik med gamla
// JS-chunkar efter en ny deploy (chunkarna finns inte kvar på CDN:et) →
// "Application error: a client-side exception". Då räcker en omladdning —
// vi gör den automatiskt, EN gång (sessionStorage-vakt mot loopar).
// Övriga fel får en enkel svensk felsida med omladdningsknapp.

import { useEffect } from "react";

const CHUNK_ERROR = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported|Importing a module script failed/i;

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    const isStale = CHUNK_ERROR.test(error.message) || error.name === "ChunkLoadError";
    if (isStale && !sessionStorage.getItem("chunk-reload")) {
      sessionStorage.setItem("chunk-reload", "1");
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="sv">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#faf8f4", color: "#1a1a1a" }}>
        <div style={{ maxWidth: 480, margin: "20vh auto 0", padding: "0 24px", textAlign: "center" }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>Något gick fel</h1>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
            Sidan kan ha uppdaterats sedan den laddades. Prova att ladda om — hjälper inte det, hör av dig till
            StayOnSite.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem("chunk-reload");
              window.location.reload();
            }}
            style={{
              background: "#ff6300",
              color: "#fff",
              border: 0,
              borderRadius: 999,
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ladda om sidan
          </button>
        </div>
      </body>
    </html>
  );
}
