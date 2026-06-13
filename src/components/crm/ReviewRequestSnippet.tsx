"use client";

import { toast } from "@/components/ui/use-toast";
import { Check, Copy, Star } from "lucide-react";
import { useState } from "react";

// Direkt skriv-recension-länk till StayOnSites Google-profil.
const REVIEW_URL = "https://g.page/r/CcBH36cXOKj8EBM/review";

/** Färdig copy-paste-text att skicka i mejl/SMS efter en lyckad/avslutad uthyrning. */
export function reviewRequestText(name: string | null | undefined, variant: "company" | "owner") {
  const hej = name?.trim() ? `Hej ${name.trim()}!` : "Hej!";
  if (variant === "owner") {
    return `${hej} Tack för att du hyr ut din bostad via StayOnSite. Om du är nöjd med samarbetet skulle ett kort omdöme på Google betyda mycket för oss – det tar bara 30 sekunder: ${REVIEW_URL}\n\nStort tack!\nKajsa, StayOnSite`;
  }
  return `${hej} Tack för att ni valde StayOnSite för ert boende. Om ni är nöjda hjälper ett kort omdöme på Google oss enormt – det tar bara 30 sekunder: ${REVIEW_URL}\n\nStort tack!\nKajsa, StayOnSite`;
}

/**
 * Snabb recensionsbegäran: knapp som visar en färdig text och kopierar den till urklipp.
 * Skicka texten i mejl/SMS till nöjda kunder/uthyrare för att samla fler Google-omdömen.
 */
export function ReviewRequestSnippet({
  name,
  variant = "company",
}: {
  name?: string | null;
  variant?: "company" | "owner";
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = reviewRequestText(name, variant);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Recensionstext kopierad" });
    } catch {
      toast({ title: "Kunde inte kopiera", variant: "destructive" });
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-input bg-white hover:bg-muted transition-colors"
        title="Färdig text för att be om ett Google-omdöme"
      >
        <Star className="h-3.5 w-3.5 text-amber-500" /> Be om recension
      </button>
      {open && (
        <div className="mt-2 rounded-md border bg-muted/30 p-3 max-w-md">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1.5">
            Skicka i mejl/SMS efter lyckad uthyrning
          </p>
          <p className="text-sm whitespace-pre-wrap text-nordic-800">{text}</p>
          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-md border border-primary-200 bg-primary-50/60 text-primary-800 hover:bg-primary-50 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Kopierat" : "Kopiera text"}
          </button>
        </div>
      )}
    </div>
  );
}
