"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { smsHref, waHref } from "@/lib/crm/share";
import { Check, Copy, ExternalLink, Mail, MessageCircle, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const PROPERTY_INTAKE_URL = "https://www.stayonsite.se/registrera-bostad";

function propertyIntakeMessage(url: string) {
  return `Hej! Här kan du snabbt fylla i uppgifter om bostaden du vill hyra ut via StayOnSite: ${url}\n\nTack!\nStayOnSite`;
}

export function PropertyIntakeSharePanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const message = useMemo(() => propertyIntakeMessage(PROPERTY_INTAKE_URL), []);
  const mailHref = useMemo(
    () =>
      `mailto:?subject=${encodeURIComponent("Bostadsuppgifter till StayOnSite")}&body=${encodeURIComponent(message)}`,
    [message],
  );

  async function copy(value: string, type: "link" | "message", title: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({ title });
    } catch {
      inputRef.current?.select();
      toast({ title: "Kunde inte kopiera automatiskt", variant: "destructive" });
    }
  }

  return (
    <div className="border-b bg-teal-50/70 px-3 py-3 shrink-0">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-teal-800 shadow-sm">
            <Send className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm font-semibold text-nordic-900">Intagslänk för uthyrare</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-teal-800">
                Skicka innan bostaden finns i CRM
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-2 md:flex-row">
              <Input
                ref={inputRef}
                readOnly
                value={PROPERTY_INTAKE_URL}
                onFocus={(event) => event.currentTarget.select()}
                aria-label="Länk till bostadsintag"
                className="h-9 min-w-0 flex-1 bg-white font-mono text-xs text-nordic-900"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => copy(PROPERTY_INTAKE_URL, "link", "Intagslänk kopierad")}
                >
                  {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "link" ? "Kopierat" : "Kopiera länk"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 gap-1.5 bg-white text-xs"
                  onClick={() => copy(message, "message", "Meddelande kopierat")}
                >
                  {copied === "message" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "message" ? "Kopierat" : "Kopiera text"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 bg-white text-xs">
            <a href={waHref(message)} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-3.5 w-3.5 text-green-600" />
              WhatsApp
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 bg-white text-xs">
            <a href={smsHref(message)}>
              <MessageCircle className="h-3.5 w-3.5 text-blue-600" />
              SMS
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 bg-white text-xs">
            <a href={mailHref}>
              <Mail className="h-3.5 w-3.5" />
              Mejl
            </a>
          </Button>
          <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 bg-white text-xs">
            <a href={PROPERTY_INTAKE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Öppna
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
