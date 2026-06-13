"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import { shareLink, smsHref, waHref } from "@/lib/crm/share";
import { Check, ExternalLink, Link as LinkIcon, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

// Touch-vänlig dela-kontroll för publika objektlänkar (prospekt + hemsida).
// På mobil öppnar "Dela…" systemets delningsmeny; WhatsApp/SMS/Kopiera finns alltid.
// path/text får BARA innehålla publikt säkra fält (aldrig adress/ägare/pris).
export function ShareLinkButton({
  path,
  title,
  text,
  label = "Dela",
}: {
  path: string; // relativ, t.ex. "/prospekt/abc" — origin läggs på efter mount
  title?: string;
  text?: string;
  label?: string;
}) {
  const [origin, setOrigin] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // Origin + share-stöd läses efter mount → absolut URL utan SSR/hydrerings-mismatch
  // (server och första klient-render använder båda "" → href = relativ path).
  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const url = origin + path;

  // Meddelandetext med länk för deep links (WhatsApp/SMS).
  const message = [text, url].filter(Boolean).join(" ");

  async function nativeShare() {
    const outcome = await shareLink({ url, title, text });
    if (outcome === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Länk kopierad" });
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Länk kopierad" });
    } catch {
      window.open(url, "_blank");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-1.5 h-9 px-3 text-sm rounded-md border border-input bg-white hover:bg-muted transition-colors"
          title={label}
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[12rem]">
        {canNativeShare && (
          <>
            <DropdownMenuItem onSelect={nativeShare} className="gap-2 py-2.5 text-sm">
              <Share2 className="h-4 w-4" /> Dela…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild className="gap-2 py-2.5 text-sm">
          <a href={waHref(message)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 py-2.5 text-sm">
          <a href={smsHref(message)}>
            <MessageCircle className="h-4 w-4 text-blue-600" /> SMS
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={copy} className="gap-2 py-2.5 text-sm">
          <LinkIcon className="h-4 w-4" /> Kopiera länk
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 py-2.5 text-sm">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" /> Öppna
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
