"use client";

import { format } from "date-fns";
import { sv } from "date-fns/locale";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, FileSignature, LogIn, LogOut, Send, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useQueueCounts } from "@/hooks/crm/useQueueCounts";
import { crmErrorMessage, swrFetcher } from "@/lib/crm/fetcher";
import { formatPhoneSv } from "@/lib/crm/phone-links";
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_STYLE } from "@/lib/crm/request-status";
import { LOST_REASONS } from "@/lib/crm/lost-reasons";
import { plusDaysStockholm, todayStockholm } from "@/lib/crm/date";
import {
  hasMoveInContractSent,
  hasSignedMoveInContract,
  withMoveInContractSent,
  withSignedMoveInContract,
} from "@/lib/crm/move-checklists";
import { ownerFollowUpSms } from "@/lib/crm/sms-templates";
import { crmFetchJson } from "@/lib/crm/fetcher";
import { DraftsPanel } from "./DraftsPanel";
import { RenewalsPanel, type RenewalRow } from "./RenewalsPanel";
import { RepliesPanel } from "./RepliesPanel";
import { AnimatePresence, motion } from "framer-motion";
function fireConfetti() {
  import("canvas-confetti").then((mod) =>
    mod.default({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#ff6300", "#ffd700", "#22c55e", "#3b82f6"] }),
  );
}

// En mjuk skur av guldstjärnor från Jesus i nedre högra hörnet. Större "big"-variant
// var femte välsignelse som en liten milstolpe.
function sprinkleBlessing(big = false) {
  import("canvas-confetti").then((mod) =>
    mod.default({
      particleCount: big ? 70 : 32,
      spread: big ? 95 : 62,
      startVelocity: big ? 40 : 26,
      gravity: 0.55,
      scalar: big ? 1.1 : 0.85,
      ticks: 130,
      angle: 110,
      origin: { x: 0.9, y: 0.86 },
      colors: ["#ff6300", "#ffd700", "#ffffff", "#fcd34d"],
      shapes: ["star", "circle"],
    }),
  );
}

// Varma hälsningar i pratbubblan innan första klicket (slumpas vid sidladdning).
const GREETINGS = [
  "Jag är med dig, Kajsa! ✝️",
  "Heja dig idag, Kajsa! 🙌",
  "Du klarar det här 💪",
  "En fin dag önskas dig ☀️",
  "Frid över din dag 🕊️",
];

const CHASE_TOAST: Record<string, string> = {
  snooze3: "Uppskjuten 3 dagar",
  snooze7: "Uppskjuten 7 dagar",
  answered: "Markerad: fick svar",
  off_market: "Objektet markerat som av marknaden",
};

// Skrivna för någon som ALDRIG använt systemet — inga interna begrepp utan
// förklaring. Korten är små (text-xs), håll varje text till 2–3 rader.
const STEPS = [
  { emoji: "💬", title: "Svar", text: "Inkomna SMS från uthyrare och kunder, automatiskt inlästa. Svarar en uthyrare ja på publicering kan du publicera och skicka länken med ett klick." },
  { emoji: "🔁", title: "Förlängningar", text: "Pågående uthyrningar som snart når sitt slutdatum. Fråga kunden om förlängning innan avtalet rinner ut — färdigt SMS finns." },
  { emoji: "📞", title: "Återkomster", text: "Företag du bokat att höra av dig till idag — skälet står på kortet. Avsluta alltid med ett beslut: ny återkomst, avtal/fakturering eller nej." },
  { emoji: "📋", title: "Öppna uppdrag", text: "Företag med aktiv förfrågan men ingen bokad återkomst — utan datum glöms de bort. Boka en återkomst så flyttas de till Återkomster." },
  { emoji: "📝", title: "Avtal", text: "Affärer där kunden tackat ja men det skarpa avtalet återstår. Markera skickat och sedan signerat — då flyttas affären vidare." },
  { emoji: "🧾", title: "Ska faktureras", text: "Affärer med signerat avtal. Skicka fakturan och markera som fakturerad — då är affären i hamn." },
  { emoji: "☎️", title: "Följ upp uthyrare", text: "Uthyrare (husägare med bostäder) som vi väntar på något ifrån — bilder, pris, ok att publicera eller signerat uppdragsavtal. Kortet visar vad som väntas; ring eller SMS:a och bocka av." },
  { emoji: "✉️", title: "Utkast", text: "Sparade meddelanden som aldrig skickades — skicka eller släng dem." },
];

// Kanoniska status-etiketter + färger (delas med övriga vyer).
const STATUS_LABEL = REQUEST_STATUS_LABEL;
const STATUS_STYLE = REQUEST_STATUS_STYLE;

const VERSES: { text: string; ref: string }[] = [
  { text: "Var inte rädd, för jag är med dig.", ref: "Jesaja 41:10" },
  { text: "Herren är min herde, mig ska inget fattas.", ref: "Psaltaren 23:1" },
  { text: "Allt förmår jag genom honom som ger mig kraft.", ref: "Filipperbrevet 4:13" },
  { text: "Var stark och modig … Herren din Gud är med dig vart du än går.", ref: "Josua 1:9" },
  { text: "Kom till mig, alla ni som är tyngda av bördor, så ska jag ge er vila.", ref: "Matteus 11:28" },
  { text: "Kasta alla era bekymmer på honom, för han har omsorg om er.", ref: "1 Petrus 5:7" },
  { text: "Jag vet vilka tankar jag har för er: tankar om frid, framtid och hopp.", ref: "Jeremia 29:11" },
  { text: "Herren är nära alla som ropar till honom.", ref: "Psaltaren 145:18" },
  { text: "Gud är vår tillflykt och styrka, en hjälp i nöden.", ref: "Psaltaren 46:2" },
  { text: "Min nåd är nog för dig.", ref: "2 Korinthierbrevet 12:9" },
  { text: "Frid lämnar jag åt er, min frid ger jag er.", ref: "Johannes 14:27" },
  { text: "Se, jag är med er alla dagar till tidens slut.", ref: "Matteus 28:20" },
  { text: "Detta är dagen som Herren har gjort, låt oss jubla och vara glada.", ref: "Psaltaren 118:24" },
  { text: "Förtrösta på Herren av hela ditt hjärta, så ska han göra dina stigar jämna.", ref: "Ordspråksboken 3:5–6" },
  { text: "Gör er inga bekymmer, utan låt Gud i allt få veta era önskningar genom bön.", ref: "Filipperbrevet 4:6" },
  { text: "Min Gud ska fylla alla era behov av sin rikedom och härlighet.", ref: "Filipperbrevet 4:19" },
  { text: "Vi vet att allt samverkar till det bästa för dem som älskar Gud.", ref: "Romarbrevet 8:28" },
  { text: "Om Gud är för oss, vem kan då vara emot oss?", ref: "Romarbrevet 8:31" },
  { text: "Ingenting kan skilja oss från Guds kärlek i Kristus Jesus.", ref: "Romarbrevet 8:39" },
  { text: "Herren är mitt ljus och min frälsning, vem skulle jag frukta?", ref: "Psaltaren 27:1" },
  { text: "Herren är min styrka och min sköld, på honom förtröstar mitt hjärta.", ref: "Psaltaren 28:7" },
  { text: "Jag sökte Herren och han svarade mig, han räddade mig ur all min fruktan.", ref: "Psaltaren 34:5" },
  { text: "Överlämna din väg åt Herren, förtrösta på honom, han ska göra det.", ref: "Psaltaren 37:5" },
  { text: "Kasta din börda på Herren, han ska uppehålla dig.", ref: "Psaltaren 55:23" },
  { text: "Den dag jag är rädd förtröstar jag på dig.", ref: "Psaltaren 56:4" },
  { text: "Om än min kropp tynar bort är Gud mitt hjärtas klippa för evigt.", ref: "Psaltaren 73:26" },
  { text: "Den som bor i den Högstes skydd vilar under den Allsmäktiges skugga.", ref: "Psaltaren 91:1" },
  { text: "Han ska befalla sina änglar att bevara dig på alla dina vägar.", ref: "Psaltaren 91:11" },
  { text: "Lova Herren, min själ, och glöm inte alla hans välgärningar.", ref: "Psaltaren 103:2" },
  { text: "Min hjälp kommer från Herren, som har gjort himmel och jord.", ref: "Psaltaren 121:2" },
  { text: "Herren ska bevara din utgång och din ingång, nu och för evigt.", ref: "Psaltaren 121:8" },
  { text: "Jag tackar dig för att jag är så underbart skapad.", ref: "Psaltaren 139:14" },
  { text: "Han helar dem som har förkrossade hjärtan och förbinder deras sår.", ref: "Psaltaren 147:3" },
  { text: "De som hoppas på Herren får ny kraft, de lyfter med vingar som örnar.", ref: "Jesaja 40:31" },
  { text: "Jag är Herren din Gud som håller dig vid din högra hand.", ref: "Jesaja 41:13" },
  { text: "När du går genom vatten är jag med dig, floderna ska inte dränka dig.", ref: "Jesaja 43:2" },
  { text: "Den som har ett fast sinne bevarar du i frid, för han förtröstar på dig.", ref: "Jesaja 26:3" },
  { text: "Välsignad är den som förtröstar på Herren och har Herren till sin trygghet.", ref: "Jeremia 17:7" },
  { text: "Herrens nåd är ny varje morgon, stor är din trofasthet.", ref: "Klagovisorna 3:23" },
  { text: "Herren din Gud är hos dig, han gläder sig över dig med jubel.", ref: "Sefanja 3:17" },
  { text: "Gör er inga bekymmer för morgondagen, varje dag har nog av sin egen plåga.", ref: "Matteus 6:34" },
  { text: "Be, så ska ni få. Sök, så ska ni finna.", ref: "Matteus 7:7" },
  { text: "För människor är det omöjligt, men för Gud är allting möjligt.", ref: "Matteus 19:26" },
  { text: "Allt vad ni ber om, tro att ni har fått det, så ska det bli ert.", ref: "Markus 11:24" },
  { text: "Så älskade Gud världen att han gav sin enfödde Son.", ref: "Johannes 3:16" },
  { text: "Jag är världens ljus, den som följer mig ska ha livets ljus.", ref: "Johannes 8:12" },
  { text: "I världen möter ni lidande, men var vid gott mod: jag har övervunnit världen.", ref: "Johannes 16:33" },
  { text: "Var glada i hoppet, tåliga i lidandet, uthålliga i bönen.", ref: "Romarbrevet 12:12" },
  { text: "Hoppets Gud ska fylla er med all glädje och frid i tron.", ref: "Romarbrevet 15:13" },
  { text: "Nu består tro, hopp och kärlek, men störst av dem är kärleken.", ref: "1 Korinthierbrevet 13:13" },
  { text: "Låt allt ni gör ske i kärlek.", ref: "1 Korinthierbrevet 16:14" },
  { text: "Låt oss inte tröttna på att göra gott, vi får skörda när tiden är inne.", ref: "Galaterbrevet 6:9" },
  { text: "Han kan göra långt mer än allt vi ber om eller tänker.", ref: "Efesierbrevet 3:20" },
  { text: "Han som har börjat ett gott verk i dig ska fullborda det.", ref: "Filipperbrevet 1:6" },
  { text: "Vad ni än gör, gör det av hjärtat, så som för Herren.", ref: "Kolosserbrevet 3:23" },
  { text: "Var alltid glada, be ständigt och tacka Gud i allt.", ref: "1 Thessalonikerbrevet 5:16–18" },
  { text: "Gud har gett oss kraftens, kärlekens och självbehärskningens ande.", ref: "2 Timotheosbrevet 1:7" },
  { text: "Tron är en visshet om det man hoppas och en övertygelse om det man inte ser.", ref: "Hebreerbrevet 11:1" },
  { text: "Jag ska aldrig lämna dig eller överge dig.", ref: "Hebreerbrevet 13:5" },
  { text: "Jesus Kristus är densamme igår, idag och i evighet.", ref: "Hebreerbrevet 13:8" },
  { text: "Om någon brister i vishet ska han be till Gud, som ger åt alla villigt.", ref: "Jakobsbrevet 1:5" },
  { text: "Den fullkomliga kärleken driver ut all fruktan.", ref: "1 Johannesbrevet 4:18" },
];

const plusDays = plusDaysStockholm;

interface OpenRequest {
  id: string;
  requestNumber: number | null;
  companyId: string;
  city?: string | null;
  status: string;
  moveInChecklist?: string[] | null;
}

interface CompanyCard {
  id: string;
  name: string;
  followUpDate?: string | null;
  followUpReason?: string | null;
  followUpTime?: string | null;
  openRequests: OpenRequest[];
}

interface ChaseRow {
  propertyId: string;
  address: string | null;
  ownerId: string | null;
  ownerName: string | null;
  ownerPhone: string | null;
  earliestDate: string | null;
  reason: string | null;
  hasReply: boolean;
}

interface QueueData {
  followUps: CompanyCard[];
  openWithoutFollowUp: CompanyCard[];
  agreements: CompanyCard[];
  toInvoice: CompanyCard[];
  chaseLandlords: ChaseRow[];
  renewals: RenewalRow[];
}

const fetcher = swrFetcher;

export function MyDayView() {
  const router = useRouter();
  const today = todayStockholm();
  const [showHelp, setShowHelp] = useState(true);
  const [verse, setVerse] = useState<{ text: string; ref: string } | null>(null);
  const [blessCount, setBlessCount] = useState(0);
  const [greeting, setGreeting] = useState(GREETINGS[0]);

  function blessKajsa() {
    const pool = VERSES.filter((v) => v.ref !== verse?.ref);
    setVerse(pool[Math.floor(Math.random() * pool.length)]);
    const next = blessCount + 1;
    setBlessCount(next);
    try { localStorage.setItem(`crm_bless_${today}`, String(next)); } catch { /* privat läge */ }
    sprinkleBlessing(next % 5 === 0);
  }

  useEffect(() => {
    if (localStorage.getItem("crm_minday_help") === "hidden") setShowHelp(false);
    setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
    const saved = Number(localStorage.getItem(`crm_bless_${today}`) || 0);
    if (saved > 0) setBlessCount(saved);
  }, [today]);

  function dismissHelp() {
    localStorage.setItem("crm_minday_help", "hidden");
    setShowHelp(false);
  }
  function openHelp() {
    localStorage.removeItem("crm_minday_help");
    setShowHelp(true);
  }

  const { data, mutate, isLoading, error } = useSWR<QueueData>("/api/crm/queues", fetcher, { refreshInterval: 15000 });
  const queues = data ?? { followUps: [], openWithoutFollowUp: [], agreements: [], toInvoice: [], chaseLandlords: [], renewals: [] };
  const loading = isLoading && !data;

  // Flytt-flagga: in-/avflyttningar på gång den närmaste veckan (≤ 7 dagar, samma räknare som fliken).
  const { counts } = useQueueCounts();
  const moveData = useSWR<{ moveIns: { date: string; doneAt: string | null }[]; moveOuts: { date: string; doneAt: string | null }[] }>(
    "/api/crm/move-schedule",
    fetcher,
    { refreshInterval: 30000 },
  ).data;
  const dueSoon = (kind: "moveIns" | "moveOuts") =>
    (moveData?.[kind] ?? []).filter((i) => !i.doneAt && i.date <= plusDays(7)).length;
  const moveInsSoon = dueSoon("moveIns");
  const moveOutsSoon = dueSoon("moveOuts");

  // Dagens aktivitet — kompakt sammanfattning av vad som hänt idag.
  const todayStats = useSWR<{ notes: number; calls: number; owners: number; ownerLogs: number; ownerCalls: number; newCompanies: number; newRequests: number; won: number; lost: number }>(
    "/api/crm/today",
    fetcher,
    { refreshInterval: 30000 },
  ).data;

  async function chaseAction(propertyId: string, action: string) {
    try {
      const res = await fetch(`/api/crm/properties/${propertyId}/chase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: CHASE_TOAST[action] ?? "Sparat" });
    } catch {
      toast({ title: "Kunde inte spara", variant: "destructive" });
    }
  }

  // Uppföljnings-SMS från jaga-kortet: förifylld text som Kajsa kan justera → skickas
  // vid klick (kön → agenten inom ~30 s).
  async function chaseSendSms(item: ChaseRow, body: string) {
    if (!item.ownerPhone || !body.trim()) return;
    try {
      await crmFetchJson("/api/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: item.ownerPhone,
          ownerId: item.ownerId ?? undefined,
          body: body.trim(),
        }),
      });
      toast({ title: "Uppföljnings-SMS skickas inom ~30 sek" });
    } catch {
      toast({ title: "Kunde inte skicka", variant: "destructive" });
    }
  }

  async function clearFollowUp(companyId: string) {
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: null, followUpTime: null, followUpReason: null }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: "Återkomst borttagen" });
    } catch {
      toast({ title: "Kunde inte ta bort", variant: "destructive" });
    }
  }

  async function snoozeFollowUp(companyId: string, days: number) {
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: plusDays(days) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: days === 1 ? "Flyttad till imorgon" : `Flyttad fram ${days} dagar` });
    } catch {
      toast({ title: "Kunde inte flytta fram", variant: "destructive" });
    }
  }

  async function scheduleFollowUp(companyId: string, date: string, time: string) {
    if (!date) return;
    try {
      const res = await fetch(`/api/crm/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpDate: date, followUpTime: time || null }),
      });
      if (!res.ok) throw new Error(String(res.status));
      mutate();
      toast({ title: `Återkomst bokad ${date}${time ? ` kl. ${time}` : ""}` });
    } catch {
      toast({ title: "Kunde inte boka", variant: "destructive" });
    }
  }

  async function markWon(requests: OpenRequest[]) {
    const active = requests.filter((r) => r.status === "incoming" || r.status === "matching");
    if (!active.length) return;
    const results = await Promise.all(
      active.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "won" }),
        }).catch(() => ({ ok: false }) as Response),
      ),
    );
    mutate();
    const failed = results.filter((res) => !res.ok).length;
    if (failed) {
      toast({ title: `${failed} av ${active.length} kunde inte markeras`, variant: "destructive" });
      return;
    }
    fireConfetti();
    toast({ title: active.length === 1 ? "🎉 Vunnen — avtal nästa!" : `🎉 ${active.length} förfrågningar — avtal nästa!` });
  }

  async function markLost(requests: OpenRequest[], reason: string) {
    if (!requests.length) return;
    const results = await Promise.all(
      requests.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "lost", lostReason: reason }),
        }).catch(() => ({ ok: false }) as Response),
      ),
    );
    mutate();
    const failed = results.filter((res) => !res.ok).length;
    if (failed) {
      toast({ title: `${failed} av ${requests.length} kunde inte stängas`, variant: "destructive" });
      return;
    }
    toast({ title: requests.length === 1 ? "Förfrågan stängd" : `${requests.length} förfrågningar stängda` });
  }

  async function markContractSent(requests: OpenRequest[]) {
    const won = requests.filter((r) => r.status === "won" && !hasMoveInContractSent(r.moveInChecklist));
    if (!won.length) return;
    const results = await Promise.all(
      won.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moveInChecklist: withMoveInContractSent(r.moveInChecklist) }),
        }).catch(() => ({ ok: false }) as Response),
      ),
    );
    mutate();
    const failed = results.filter((res) => !res.ok).length;
    if (failed) {
      toast({ title: `${failed} av ${won.length} kunde inte markeras`, variant: "destructive" });
      return;
    }
    toast({ title: won.length === 1 ? "Avtal markerat skickat" : `${won.length} avtal markerade skickade` });
  }

  async function markContractSigned(requests: OpenRequest[]) {
    const won = requests.filter((r) => r.status === "won" && !hasSignedMoveInContract(r.moveInChecklist));
    if (!won.length) return;
    const results = await Promise.all(
      won.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moveInChecklist: withSignedMoveInContract(r.moveInChecklist) }),
        }).catch(() => ({ ok: false }) as Response),
      ),
    );
    mutate();
    const failed = results.filter((res) => !res.ok).length;
    if (failed) {
      toast({ title: `${failed} av ${won.length} kunde inte markeras`, variant: "destructive" });
      return;
    }
    toast({ title: won.length === 1 ? "Signerat avtal — ska faktureras" : `${won.length} signerade avtal — ska faktureras` });
  }

  async function markInvoiced(requests: OpenRequest[]) {
    const won = requests.filter((r) => r.status === "won" && hasSignedMoveInContract(r.moveInChecklist));
    if (!won.length) return;
    const results = await Promise.all(
      won.map((r) =>
        fetch(`/api/crm/requests/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "invoiced" }),
        }).catch(() => ({ ok: false }) as Response),
      ),
    );
    mutate();
    const blocked = results.filter((res) => !res.ok).length;
    if (blocked) {
      toast({
        title:
          blocked === won.length
            ? "Saknar in-/utflyttsdatum — öppna uppdraget och fyll i innan fakturering."
            : `${blocked} kunde inte faktureras (saknar datum). Öppna uppdraget och fyll i.`,
        variant: "destructive",
      });
      return;
    }
    toast({ title: won.length === 1 ? "Fakturerad ✓" : `${won.length} förfrågningar markerade som fakturerade` });
  }

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-nordic-900">Min dag</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: sv })}
          </p>
        </div>
        {!showHelp && (
          <button onClick={openHelp} className="text-xs text-muted-foreground hover:text-foreground underline shrink-0">
            Så funkar Min dag
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="font-medium">Kunde inte ladda dagens kö.</span>
          <span className="text-red-700/80">{crmErrorMessage(error)}</span>
          <button
            onClick={() => mutate()}
            className="ml-auto shrink-0 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-100"
          >
            Försök igen
          </button>
        </div>
      )}

      {todayStats && (
        <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-1.5 rounded-xl border border-nordic-200 bg-white px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0">Idag</span>
          <span className="text-sm" title={`${todayStats.calls} samtal av ${todayStats.notes} loggade kundnoteringar`}>
            <b className="tabular-nums text-nordic-900">{todayStats.notes}</b>{" "}
            <span className="text-muted-foreground">loggat</span>
          </span>
          <span className="text-sm" title={`${todayStats.ownerLogs} loggade uthyrarkontakter idag (${todayStats.ownerCalls} samtal)`}>
            <b className="tabular-nums text-nordic-900">{todayStats.owners}</b>{" "}
            <span className="text-muted-foreground">uthyrare</span>
          </span>
          <span className="text-sm">
            <b className="tabular-nums text-nordic-900">{todayStats.newCompanies}</b>{" "}
            <span className="text-muted-foreground">nya kunder</span>
          </span>
          <span className="text-sm">
            <b className="tabular-nums text-nordic-900">{todayStats.newRequests}</b>{" "}
            <span className="text-muted-foreground">nya förfrågningar</span>
          </span>
          <span className="text-sm">
            <b className="tabular-nums text-green-700">{todayStats.won}</b>{" "}
            <span className="text-muted-foreground">vunna</span>
          </span>
          <span className="text-sm">
            <b className="tabular-nums text-rose-600">{todayStats.lost}</b>{" "}
            <span className="text-muted-foreground">förlorade</span>
          </span>
        </div>
      )}

      {showHelp && (
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 p-4 relative">
          <button onClick={dismissHelp} className="absolute top-3 right-3 text-amber-700/70 hover:text-amber-900" title="Dölj">
            <X className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold text-amber-900 mb-1">Så funkar din dag 👋</p>
          <p className="text-xs text-amber-800/90 mb-3">
            Min dag samlar allt som väntar på dig just idag. Varje kort är ett företag eller en uthyrare —
            jobba dig igenom kolumnerna, klicka på ett kort för att öppna det, eller använd snabbvalen
            direkt på kortet. Målet: tom lista och ett beslut på varje kort.
          </p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {STEPS.map((s) => (
              <div key={s.title} className="rounded-lg bg-white/70 border border-amber-100 p-2.5">
                <div className="text-sm font-medium text-nordic-900 mb-0.5">
                  <span className="mr-1">{s.emoji}</span>{s.title}
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Svar + Förlängningar: dagens viktigaste — inkommande och utgående pengar. */}
      <RepliesPanel />
      <RenewalsPanel renewals={queues.renewals} onChanged={() => mutate()} />

      {counts.moveSchedule > 0 && (
        <button
          onClick={() => router.push("/crm/flyttar")}
          className="mb-6 w-full flex items-center gap-3 rounded-xl border border-[#ff6300]/30 bg-[#ff6300]/5 px-4 py-3 text-left hover:bg-[#ff6300]/10 transition-colors"
        >
          <span className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-1.5 rounded-full bg-[#ff6300] text-white text-sm font-bold tabular-nums shrink-0">
            {counts.moveSchedule}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-nordic-900">På gång den närmaste veckan</div>
            <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
              {moveInsSoon > 0 && (
                <span className="inline-flex items-center gap-1"><LogIn className="h-3.5 w-3.5 text-blue-600" />{moveInsSoon} inflytt</span>
              )}
              {moveOutsSoon > 0 && (
                <span className="inline-flex items-center gap-1"><LogOut className="h-3.5 w-3.5 text-rose-600" />{moveOutsSoon} avflytt</span>
              )}
              {moveInsSoon === 0 && moveOutsSoon === 0 && <span>In- & avflyttningar att hantera</span>}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#ff6300] ml-auto shrink-0" />
        </button>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, c) => (
            <div key={c}>
              <div className="h-4 w-32 rounded bg-nordic-100 animate-pulse mb-3" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="rounded-lg border bg-white p-3 space-y-2">
                    <div className="h-3.5 w-2/3 rounded bg-nordic-100 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-nordic-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <QueueSection
            title="Återkomster"
            emoji="📞"
            items={queues.followUps}
            emptyText="Inga återkomster idag"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="followup"
                onOpen={() => router.push(`/crm/work/followups/${item.id}`)}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkWon={() => markWon(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
                onClearFollowUp={() => clearFollowUp(item.id)}
              />
            )}
          />

          <QueueSection
            title="Öppna uppdrag"
            emoji="📋"
            items={queues.openWithoutFollowUp}
            emptyText="Inga öppna uppdrag"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="open"
                onOpen={() => {
                  const queue = item.openRequests.some((r) => r.status === "matching") ? "matching" : "incoming";
                  // Skicka med rätt förfrågan så kö-bannern landar på den (annars första för bolaget).
                  const req = item.openRequests.find((r) => r.status === queue);
                  router.push(`/crm/work/${queue}/${item.id}${req ? `?request=${req.id}` : ""}`);
                }}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkWon={() => markWon(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
              />
            )}
          />

          <QueueSection
            title="Avtal"
            emoji="📝"
            items={queues.agreements}
            emptyText="Inga avtal att hantera"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="agreement"
                onOpen={() => {
                  const req = item.openRequests.find((r) => r.status === "won" && !hasSignedMoveInContract(r.moveInChecklist));
                  router.push(`/crm/work/agreement/${item.id}${req ? `?request=${req.id}` : ""}`);
                }}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkContractSent={() => markContractSent(item.openRequests)}
                onMarkContractSigned={() => markContractSigned(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
              />
            )}
          />

          <QueueSection
            title="Ska faktureras"
            emoji="🧾"
            items={queues.toInvoice}
            emptyText="Inget att fakturera"
            renderItem={(item) => (
              <CompanyDayCard
                key={item.id}
                item={item}
                today={today}
                variant="invoice"
                onOpen={() => {
                  const req = item.openRequests.find((r) => r.status === "won" && hasSignedMoveInContract(r.moveInChecklist));
                  router.push(`/crm/work/won/${item.id}${req ? `?request=${req.id}` : ""}`);
                }}
                onSnooze={(days) => snoozeFollowUp(item.id, days)}
                onSchedule={(date, time) => scheduleFollowUp(item.id, date, time)}
                onMarkInvoiced={() => markInvoiced(item.openRequests)}
                onMarkLost={(reason) => markLost(item.openRequests, reason)}
              />
            )}
          />

          <QueueSection
            title="Följ upp uthyrare"
            emoji="☎️"
            items={queues.chaseLandlords}
            emptyText="Inget att följa upp"
            renderItem={(item) => (
              <ChaseCard
                key={item.propertyId}
                item={item}
                today={today}
                onOpen={() => router.push(`/crm/properties?id=${item.propertyId}`)}
                onAction={(action) => chaseAction(item.propertyId, action)}
                onSendSms={(body) => chaseSendSms(item, body)}
              />
            )}
          />
        </div>
      )}

      <DraftsPanel />

      <div className="mt-12 flex justify-end items-end gap-3 pr-2">
        <div className="flex flex-col items-end gap-2 mb-5 max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={verse?.ref ?? "greeting"}
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="relative bg-white border rounded-2xl rounded-br-none shadow-sm px-4 py-2.5"
            >
              {verse ? (
                <>
                  <p className="text-sm text-nordic-900 italic">"{verse.text}"</p>
                  <p className="text-xs text-muted-foreground mt-1">— {verse.ref}</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-nordic-900">{greeting}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Klicka på mig för ett bibelord ✨</p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
          {blessCount > 0 && (
            <motion.span
              key={blessCount}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="text-[11px] font-medium text-amber-600 select-none"
              title="Återställs varje dag"
            >
              ✨ {blessCount} {blessCount === 1 ? "välsignelse" : "välsignelser"} idag
            </motion.span>
          )}
        </div>

        <motion.button
          type="button"
          onClick={blessKajsa}
          title="Klicka för ett bibelord"
          aria-label="Klicka för ett bibelord"
          className="relative shrink-0 cursor-pointer"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1, rotate: -3 }}
          whileTap={{ scale: 0.9, rotate: 5 }}
        >
          {/* Mjuk pulserande gloria bakom Jesus */}
          <motion.span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full blur-xl"
            style={{ background: "radial-gradient(circle, rgba(255,215,0,0.45), transparent 70%)" }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.6, 0.35] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/jesus-kajsa.png"
            alt="Glad tecknad Jesus som vinkar"
            className="h-28 w-28 object-contain select-none pointer-events-none"
            draggable={false}
          />
        </motion.button>
      </div>
    </div>
  );
}

// ─── Snabbval-knappar ────────────────────────────────────────────────────────

function QBtn({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "success" | "danger" | "primary";
}) {
  const styles = {
    default: "border-input bg-white text-muted-foreground hover:bg-nordic-100",
    primary: "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium",
    success: "border-green-300 bg-green-50 text-green-800 hover:bg-green-100 font-medium",
    danger: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-medium",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-[11px] px-2 py-0.5 rounded border transition-colors disabled:opacity-40 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ─── Universellt företagskort med snabbval ────────────────────────────────────

type CardVariant = "followup" | "open" | "agreement" | "invoice";

function CompanyDayCard({
  item,
  today,
  variant,
  onOpen,
  onSnooze,
  onSchedule,
  onMarkWon,
  onMarkContractSent,
  onMarkContractSigned,
  onMarkInvoiced,
  onMarkLost,
  onClearFollowUp,
}: {
  item: CompanyCard;
  today: string;
  variant: CardVariant;
  onOpen: () => void;
  onSnooze: (days: number) => void | Promise<void>;
  onSchedule: (date: string, time: string) => void | Promise<void>;
  onMarkWon?: () => void | Promise<void>;
  onMarkContractSent?: () => void | Promise<void>;
  onMarkContractSigned?: () => void | Promise<void>;
  onMarkInvoiced?: () => void | Promise<void>;
  onMarkLost: (reason: string) => void | Promise<void>;
  onClearFollowUp?: () => void | Promise<void>;
}) {
  const [action, setAction] = useState<"återkomst" | "nej" | null>(null);
  const [date, setDate] = useState(item.followUpDate ?? today);
  const [time, setTime] = useState(item.followUpTime ?? "08:00");
  const [lostReason, setLostReason] = useState(LOST_REASONS[0]);
  const [busy, setBusy] = useState(false);

  const isPast = !!item.followUpDate && item.followUpDate < today;
  const isToday = item.followUpDate === today;

  async function run<T>(fn: () => Promise<T>) {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); setAction(null); }
  }

  const activeRequests = item.openRequests.filter((r) => r.status === "incoming" || r.status === "matching");
  const hasActive = activeRequests.length > 0;
  const wonRequests = item.openRequests.filter((r) => r.status === "won");
  const unsignedWonRequests = wonRequests.filter((r) => !hasSignedMoveInContract(r.moveInChecklist));
  const hasUnsignedContract = unsignedWonRequests.length > 0;
  const hasUnsentContract = unsignedWonRequests.some((r) => !hasMoveInContractSent(r.moveInChecklist));

  return (
    <div className={`rounded-lg bg-white border transition-colors ${isPast ? "border-red-300" : "border-border"}`}>
      {/* Klickbar huvud */}
      <button
        className="w-full text-left p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-t-lg"
        onClick={onOpen}
      >
        <div className="font-medium text-sm">{item.name}</div>

        {/* Återkomst-badge (followup-variant) */}
        {variant === "followup" && item.followUpDate && (
          <div className="mt-1.5">
            <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded ${
              isPast ? "bg-red-100 text-red-800" : isToday ? "bg-amber-100 text-amber-800" : "bg-nordic-100 text-nordic-700"
            }`}>
              {isPast ? `Försenad · ${item.followUpDate}` : isToday ? "Återkomst idag" : item.followUpDate}
              {item.followUpTime && ` kl. ${item.followUpTime}`}
            </span>
            {item.followUpReason && (
              <span className="text-xs text-muted-foreground ml-1.5">{item.followUpReason}</span>
            )}
          </div>
        )}

        {/* Request-badges */}
        {item.openRequests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.openRequests.map((r) => (
              <span key={r.id} className={`inline-block text-[11px] px-1.5 py-0.5 rounded ${STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-700"}`}>
                {r.city ? `${r.city} · ` : ""}{STATUS_LABEL[r.status] ?? r.status}
                {r.status === "won" && (
                  <>
                    {" · "}
                    {hasSignedMoveInContract(r.moveInChecklist)
                      ? "Avtal signerat"
                      : hasMoveInContractSent(r.moveInChecklist)
                        ? "Avtal skickat"
                        : "Avtal ej skickat"}
                  </>
                )}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Snabbvals-rad */}
      <div className="flex flex-wrap items-center gap-1 px-2.5 pb-2 pt-1 border-t border-dashed">
        <QBtn variant="primary" onClick={() => setAction(action === "återkomst" ? null : "återkomst")}>
          ↩ Återkomst
        </QBtn>
        {variant === "followup" && onClearFollowUp && (
          <QBtn disabled={busy} onClick={() => run(async () => { await onClearFollowUp(); })}>
            Ta bort återkomst
          </QBtn>
        )}
        {variant !== "invoice" && hasActive && (
          <QBtn variant="success" disabled={busy} onClick={() => run(async () => { await onMarkWon?.(); })}>
            ✓ Till avtal
          </QBtn>
        )}
        {variant === "agreement" && hasUnsignedContract && (
          <>
            {hasUnsentContract && (
              <QBtn disabled={busy} onClick={() => run(async () => { await onMarkContractSent?.(); })}>
                <span className="inline-flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  Avtal skickat
                </span>
              </QBtn>
            )}
            <QBtn variant="success" disabled={busy} onClick={() => run(async () => { await onMarkContractSigned?.(); })}>
              <span className="inline-flex items-center gap-1">
                <FileSignature className="h-3 w-3" />
                Signerat avtal
              </span>
            </QBtn>
          </>
        )}
        {variant === "invoice" && (
          <QBtn variant="success" disabled={busy} onClick={() => run(async () => { await onMarkInvoiced?.(); })}>
            ✓ Fakturerad
          </QBtn>
        )}
        <QBtn variant="danger" onClick={() => setAction(action === "nej" ? null : "nej")}>
          ✕ Nej
        </QBtn>
      </div>

      {/* Återkomst — inline datumval */}
      {action === "återkomst" && (
        <div className="px-2.5 pb-2.5 pt-1 border-t bg-amber-50/50 rounded-b-lg space-y-1.5">
          <p className="text-[11px] font-medium text-amber-800">Ny återkomst</p>
          <div className="flex flex-wrap gap-1">
            <QBtn onClick={() => run(async () => { await onSnooze(1); })}>Imorgon</QBtn>
            <QBtn onClick={() => run(async () => { await onSnooze(3); })}>+3 d</QBtn>
            <QBtn onClick={() => run(async () => { await onSnooze(7); })}>+7 d</QBtn>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border rounded px-1.5 py-0.5 text-xs w-24 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <QBtn variant="primary" onClick={() => run(async () => { await onSchedule(date, time); })}>
              Spara
            </QBtn>
          </div>
        </div>
      )}

      {/* Nej — inline anledningsval */}
      {action === "nej" && (
        <div className="px-2.5 pb-2.5 pt-1 border-t bg-red-50/60 rounded-b-lg space-y-1.5">
          <p className="text-[11px] font-medium text-red-800">
            Stäng {item.openRequests.length === 1 ? "förfrågan" : `${item.openRequests.length} förfrågningar`} — varför?
          </p>
          <div className="flex flex-wrap gap-1">
            {LOST_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setLostReason(r)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  lostReason === r
                    ? "border-red-400 bg-red-100 text-red-800 font-semibold"
                    : "border-input bg-white text-muted-foreground hover:bg-red-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <QBtn variant="danger" disabled={busy} onClick={() => run(async () => { await onMarkLost(lostReason); })}>
              Ja, stäng
            </QBtn>
            <QBtn onClick={() => setAction(null)}>Avbryt</QBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Uthyrare-korten (oförändrade) ────────────────────────────────────────────

function ChaseCard({
  item,
  today,
  onOpen,
  onAction,
  onSendSms,
}: {
  item: ChaseRow;
  today: string;
  onOpen: () => void;
  onAction: (action: string) => void | Promise<void>;
  onSendSms: (body: string) => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsText, setSmsText] = useState("");
  async function act(action: string) {
    if (
      action === "off_market" &&
      !window.confirm("Markera objektet som av marknaden? Det slutar visas som ledigt.")
    ) return;
    setBusy(true);
    await onAction(action);
    setBusy(false);
  }
  const overdue = !!item.earliestDate && item.earliestDate <= today;
  return (
    <div className={`p-3 rounded-lg bg-white border ${item.hasReply ? "border-blue-300" : ""}`}>
      <button className="w-full text-left" onClick={onOpen}>
        <div className="font-medium text-sm truncate">{item.address ?? "(adress saknas)"}</div>
        <div className="text-xs text-muted-foreground truncate">
          {[item.ownerName, formatPhoneSv(item.ownerPhone)].filter(Boolean).join(" · ") || "—"}
        </div>
        {item.hasReply && (
          <span className="inline-block text-[11px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 mt-1">
            💬 Har svarat — läs i Svar-panelen
          </span>
        )}
        <div className="text-xs mt-1">
          <span className="italic text-nordic-500">Uthyrarkontakt att följa upp</span>
          {item.reason && <span className="text-muted-foreground"> · {item.reason}</span>}
        </div>
        {item.earliestDate && (
          <div className={`text-[11px] mt-0.5 ${overdue ? "text-rose-600" : "text-muted-foreground"}`}>
            {overdue ? "idag/försenad" : item.earliestDate}
          </div>
        )}
      </button>
      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
        {item.ownerPhone && (
          <button
            onClick={() => {
              if (!smsOpen) setSmsText(ownerFollowUpSms(item.ownerName, item.address));
              setSmsOpen(!smsOpen);
            }}
            disabled={busy}
            className="text-[11px] px-1.5 py-0.5 rounded border border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 font-medium disabled:opacity-40"
            title="Förifyllt uppföljnings-SMS — justera och skicka"
          >
            ✉️ Uppföljnings-SMS
          </button>
        )}
        {(["snooze3", "snooze7", "answered", "off_market"] as const).map((a) => (
          <button
            key={a}
            onClick={() => act(a)}
            disabled={busy}
            className="text-[11px] px-1.5 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40"
          >
            {a === "snooze3" ? "Ringd · +3 d" : a === "snooze7" ? "Ringd · +7 d" : a === "answered" ? "Fick svar" : "Av marknaden"}
          </button>
        ))}
        <button
          onClick={onOpen}
          disabled={busy}
          className="text-[11px] px-1.5 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100 disabled:opacity-40"
        >
          Anteckning
        </button>
      </div>
      {smsOpen && (
        <div className="mt-2 space-y-1.5">
          <textarea
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            rows={3}
            className="w-full border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-violet-400"
          />
          <div className="flex gap-1.5">
            <button
              className="text-[11px] px-2 py-1 rounded border border-violet-300 bg-violet-50 text-violet-800 hover:bg-violet-100 font-semibold disabled:opacity-40"
              disabled={busy || !smsText.trim()}
              onClick={async () => {
                setBusy(true);
                await onSendSms(smsText);
                setBusy(false);
                setSmsOpen(false);
              }}
            >
              Skicka
            </button>
            <button
              className="text-[11px] px-1.5 py-0.5 rounded border border-input bg-white text-muted-foreground hover:bg-nordic-100"
              onClick={() => setSmsOpen(false)}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Generisk kösektion ───────────────────────────────────────────────────────

function QueueSection<T>({
  title,
  emoji,
  items,
  emptyText,
  renderItem,
}: {
  title: string;
  emoji: string;
  items: T[];
  emptyText: string;
  renderItem: (item: T) => React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span>{emoji}</span>
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="ml-auto text-xs font-bold text-muted-foreground bg-muted rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">{emptyText}</p>
        ) : (
          items.map(renderItem)
        )}
      </div>
    </div>
  );
}
