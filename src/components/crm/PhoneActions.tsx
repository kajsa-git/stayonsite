"use client";

import { MessageCircle, MessageSquare } from "lucide-react";
import { smsHref, whatsappHref } from "@/lib/crm/phone-links";

// Snabbknappar bredvid ett telefonnummer: öppnar WhatsApp (grön) resp. SMS direkt.
// Renderar inget om numret inte går att tolka. stopPropagation så klick inte triggar
// en ev. klickbar rad runtomkring.
export function PhoneActions({ phone, className = "" }: { phone?: string | null; className?: string }) {
  const wa = whatsappHref(phone);
  const sms = smsHref(phone);
  if (!wa && !sms) return null;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Skicka WhatsApp"
          aria-label="Skicka WhatsApp"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        >
          <MessageCircle className="h-3 w-3" />
        </a>
      )}
      {sms && (
        <a
          href={sms}
          onClick={(e) => e.stopPropagation()}
          title="Skicka SMS"
          aria-label="Skicka SMS"
          className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-nordic-200 text-nordic-700 transition-colors hover:bg-nordic-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <MessageSquare className="h-3 w-3" />
        </a>
      )}
    </span>
  );
}
