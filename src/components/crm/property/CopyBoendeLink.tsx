"use client";

import { Check, ExternalLink } from "lucide-react";
import { useState } from "react";

// Kopierar/öppnar den publika, indexerbara boende-URL:en (www.stayonsite.se/boenden/{slug}).
export function CopyBoendeLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/boenden/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.open(url, "_blank");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="text-xs px-2.5 py-1 rounded-md border border-input bg-white hover:bg-muted transition-colors inline-flex items-center gap-1.5"
      title="Kopiera publik länk (visas i listan /boenden — aldrig adress/ägare/pris)"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <ExternalLink className="h-3.5 w-3.5" />}
      {copied ? "Kopierad!" : "Kopiera publik länk"}
    </button>
  );
}
