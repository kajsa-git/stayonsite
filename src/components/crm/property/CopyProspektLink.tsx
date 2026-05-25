"use client";

import { Check, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

export function CopyProspektLink({ propertyId }: { propertyId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = `${window.location.origin}/prospekt/${propertyId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback: open in new tab if clipboard is blocked
      window.open(url, "_blank");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="text-xs px-2.5 py-1 rounded-md border border-input bg-white hover:bg-muted transition-colors inline-flex items-center gap-1.5"
      title="Kopiera delbar prospekt-länk (visar inte adress/ägare/pris)"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <LinkIcon className="h-3.5 w-3.5" />}
      {copied ? "Kopierad!" : "Kopiera prospekt-länk"}
    </button>
  );
}
