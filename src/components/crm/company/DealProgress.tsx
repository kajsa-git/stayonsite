"use client";

import { hasMoveInContractSent, hasSignedMoveInContract } from "@/lib/crm/move-checklists";
import { normalizePhoneE164 } from "@/lib/crm/phone-links";
import type { Request } from "@/lib/crm/schema";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUp, Check, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STEPS = ["Förfrågan", "Matchning", "Avtal", "Signerat", "Fakturerat"] as const;
const OPEN = ["incoming", "matching", "won"];
const EASE = [0.22, 1, 0.36, 1] as const;

type Req = Pick<Request, "id" | "requestNumber" | "city" | "status" | "moveInChecklist">;

/** Index i STEPS, eller null för stängda (Nej tack/Arkiverad). */
export function dealStepIndex(r: Req): number | null {
  if (r.status === "incoming") return 0;
  if (r.status === "matching") return 1;
  if (r.status === "won") return hasSignedMoveInContract(r.moveInChecklist) ? 3 : 2;
  if (r.status === "invoiced") return 4;
  return null;
}

export function dealNextStep(r: Req): string {
  if (r.status === "incoming") return "Kvalificera förfrågan och börja leta boende";
  if (r.status === "matching") return "Hitta boende och skicka förslag till kunden";
  if (r.status === "won") {
    if (hasSignedMoveInContract(r.moveInChecklist)) return "Fakturera";
    return hasMoveInContractSent(r.moveInChecklist) ? "Få avtalet signerat" : "Skicka avtalet";
  }
  return "Klart";
}

/** Förfrågningarna stegraden visar: öppna ärenden, vald förfrågan först. */
export function dealRequests<T extends Req>(requests: T[], selectedId: string | null): T[] {
  return requests
    .filter((r) => OPEN.includes(r.status) || r.id === selectedId)
    .sort((a, b) => (a.id === selectedId ? -1 : b.id === selectedId ? 1 : (dealStepIndex(b) ?? 0) - (dealStepIndex(a) ?? 0)));
}

export function DealProgress({
  requests,
  selectedId,
  onMatch,
  onShowRequest,
}: {
  requests: Req[];
  selectedId: string | null;
  onMatch: (requestId: string) => void;
  onShowRequest: () => void;
}) {
  const rows = dealRequests(requests, selectedId).slice(0, 3);
  const focus = rows[0];

  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-nordic-500">Var är vi?</span>
        {rows.length > 1 && <span className="text-[11px] text-muted-foreground">{rows.length} öppna förfrågningar</span>}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">Ingen öppen förfrågan just nu.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r, i) => (
            <StepRow key={r.id} request={r} dim={i > 0} />
          ))}
        </div>
      )}

      {focus && dealStepIndex(focus) != null && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="flex items-center gap-1.5 text-sm font-medium text-nordic-900">
            <ArrowRight className="h-4 w-4 shrink-0 text-[#ff6300]" />
            {rows.length > 1 && focus.requestNumber ? `#${focus.requestNumber}: ` : ""}
            {dealNextStep(focus)}
          </p>
          {(focus.status === "incoming" || focus.status === "matching") ? (
            <button
              onClick={() => onMatch(focus.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-nordic-700 px-3 text-xs font-semibold text-white transition-all hover:bg-nordic-800 active:scale-[0.97]"
            >
              Leta boenden <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onShowRequest}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-white px-3 text-xs font-semibold text-nordic-800 transition-colors hover:bg-nordic-100 active:scale-[0.97]"
            >
              Öppna förfrågan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StepRow({ request, dim }: { request: Req; dim: boolean }) {
  const current = dealStepIndex(request);
  const label = [request.requestNumber ? `#${request.requestNumber}` : null, request.city].filter(Boolean).join(" · ");

  if (current == null) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="w-24 shrink-0 truncate font-mono text-xs">{label}</span>
        Stängd
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${dim ? "opacity-60" : ""}`}>
      <span className="w-24 shrink-0 truncate text-xs font-medium text-nordic-800" title={label}>
        {label || "Förfrågan"}
      </span>
      <ol className="flex min-w-0 flex-1 items-center">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={step} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <motion.span
                  initial={active ? { scale: 0.6 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 + i * 0.05 }}
                  className={`relative flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    done
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-[#ff6300] text-white shadow-[0_0_0_4px_rgba(255,99,0,0.15)]"
                        : "border border-nordic-300 bg-white text-nordic-500"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : i + 1}
                  {active && !dim && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-[#ff6300]"
                      initial={{ opacity: 0.45, scale: 1 }}
                      animate={{ opacity: 0, scale: 2 }}
                      transition={{ duration: 1.4, ease: "easeOut", repeat: 2, repeatDelay: 0.6 }}
                    />
                  )}
                </motion.span>
                <span
                  className={`hidden whitespace-nowrap text-[10px] sm:block ${
                    active ? "font-semibold text-nordic-900" : done ? "text-nordic-700" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="relative mx-1.5 mb-0 h-[2px] flex-1 overflow-hidden rounded-full bg-nordic-200 sm:mb-4">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-green-600"
                    initial={{ width: 0 }}
                    animate={{ width: done ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: EASE, delay: 0.05 + i * 0.08 }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Smal list som glider ner under toppraden när företagshuvudet scrollats ur bild —
 * namn, nästa steg och ringknapp finns alltid inom räckhåll.
 */
export function CompanyStickyBar({
  name,
  nextStep,
  phone,
  contactName,
}: {
  name: string;
  nextStep: string | null;
  phone: string | null | undefined;
  contactName: string | null | undefined;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  // Fast positionerad (CRM:ets <main> har overflow-auto, så sticky fastnar inte) —
  // därför läser vi av kortets vänsterkant och bredd och följer dem.
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const measure = () => {
      const r = el.parentElement?.getBoundingClientRect();
      if (r) setBox({ left: r.left, width: r.width });
    };
    // -56px = toppradens höjd: listen visas när sentinel passerat under den.
    const io = new IntersectionObserver(
      ([e]) => {
        const passed = !e.isIntersecting && e.boundingClientRect.top < 56;
        if (passed) measure();
        setShow(passed);
      },
      { rootMargin: "-56px 0px 0px 0px" },
    );
    io.observe(el);
    const ro = new ResizeObserver(measure);
    if (el.parentElement) ro.observe(el.parentElement);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  const tel = normalizePhoneE164(phone);

  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <AnimatePresence>
          {show && box && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: EASE }}
              style={{ left: box.left, width: box.width }}
              className="fixed top-16 z-20 flex items-center gap-3 rounded-xl border border-nordic-200 bg-white/90 px-4 py-2 shadow-lg shadow-nordic-900/5 backdrop-blur"
            >
              <span className="min-w-0 shrink truncate text-sm font-semibold text-nordic-900">{name}</span>
              {nextStep && (
                <span className="hidden min-w-0 flex-1 items-center gap-1.5 truncate text-xs text-nordic-700 sm:flex">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#ff6300]" />
                  <span className="truncate">{nextStep}</span>
                </span>
              )}
              <div className="ml-auto flex shrink-0 items-center gap-1.5">
                {tel && (
                  <a
                    href={`tel:${tel}`}
                    className="inline-flex h-7 items-center gap-1.5 rounded-full border border-nordic-200 bg-nordic-100/60 px-2.5 text-xs text-nordic-800 transition-colors hover:border-[#ff6300]/40 hover:bg-[#fff1e8]"
                  >
                    <Phone className="h-3 w-3 text-[#ff6300]" />
                    Ring {contactName?.split(" ")[0] ?? ""}
                  </a>
                )}
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  title="Till toppen"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-nordic-500 transition-colors hover:bg-nordic-100 hover:text-nordic-900"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </>
  );
}
