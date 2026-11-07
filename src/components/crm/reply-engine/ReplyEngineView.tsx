"use client";

// Svarsmotorn i CRM:et: läge, inlärning, playbook, förhandsgranskning och logg
// över allt motorn gjort. Mejlförslag godkänns härifrån; SMS-/WhatsApp-förslag
// hamnar i Utkast-panelen i Min dag.
import { toast } from "@/components/ui/use-toast";
import { crmErrorMessage, crmFetchJson, swrFetcher } from "@/lib/crm/fetcher";
import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

type Mode = "off" | "shadow" | "draft" | "auto";

interface Decision {
  id: string;
  source_type: string;
  channel: string;
  owner_id: string | null;
  company_id: string | null;
  to_address: string | null;
  inbound_at: string | null;
  inbound_text: string | null;
  party_role: string | null;
  intent: string | null;
  stage: string | null;
  outcome_goal: string | null;
  summary: string | null;
  action: string;
  reply_text: string | null;
  reply_subject: string | null;
  reason: string | null;
  confidence: number | null;
  feedback: string | null;
  final_text: string | null;
  follow_up_at: string | null;
  follow_up_status: string | null;
  created_at: string;
}

interface Payload {
  settings: { mode: Mode; activatedAt: string | null; playbook: string; playbookUpdatedAt: string | null; learnStatus: string | null };
  decisions: Decision[];
  stats: { smsIn: number; smsOut: number; emailIn: number; emailOut: number };
}

interface Preview {
  channel: string;
  inbound: string;
  at: string;
  decision: { intent: string; outcomeGoal: string; nextStep: string | null; reply: string | null; kajsaTask: string | null; confidence: number } | null;
  wouldDo: string;
  reasons: string[];
  error?: string;
}

const MODES: { value: Mode; label: string; hint: string }[] = [
  { value: "off", label: "Av", hint: "Motorn gör ingenting." },
  { value: "shadow", label: "Skugga", hint: "Tolkar och loggar, skickar och skapar inget." },
  { value: "draft", label: "Utkast", hint: "Allt blir utkast som du godkänner." },
  { value: "auto", label: "Rutin direkt", hint: "Rutinsvar skickas direkt, resten blir utkast eller hamnar hos dig." },
];

const ACTION_LABEL: Record<string, { label: string; cls: string }> = {
  auto_sent: { label: "Skickat", cls: "bg-emerald-100 text-emerald-800" },
  draft: { label: "Utkast", cls: "bg-violet-100 text-violet-800" },
  handover: { label: "Till dig", cls: "bg-amber-100 text-amber-900" },
  no_reply: { label: "Inget svar behövs", cls: "bg-nordic-100 text-nordic-700" },
  shadow: { label: "Skugga", cls: "bg-sky-100 text-sky-800" },
  skipped: { label: "Hoppat över", cls: "bg-nordic-100 text-nordic-500" },
  error: { label: "Fel", cls: "bg-red-100 text-red-800" },
};

const CHANNEL_LABEL: Record<string, string> = { sms: "SMS", whatsapp: "WhatsApp", email: "Mejl" };

function when(at: string | null) {
  if (!at) return "";
  const iso = at.includes("T") ? at : `${at.replace(" ", "T")}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? at : d.toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" });
}

export function ReplyEngineView() {
  const { data, mutate } = useSWR<Payload>("/api/crm/reply-engine", swrFetcher, { refreshInterval: 15000 });
  const [busy, setBusy] = useState<string | null>(null);
  const [playbookDraft, setPlaybookDraft] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview[] | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "action">("action");

  const decisions = useMemo(() => {
    const all = data?.decisions ?? [];
    return filter === "all" ? all : all.filter((d) => d.action !== "skipped");
  }, [data, filter]);
  const emailDrafts = (data?.decisions ?? []).filter((d) => d.channel === "email" && ["draft", "handover"].includes(d.action) && d.reply_text && !d.feedback);

  async function run<T>(key: string, fn: () => Promise<T>, ok?: string) {
    setBusy(key);
    try {
      const result = await fn();
      if (ok) toast({ title: ok });
      await mutate();
      return result;
    } catch (e) {
      toast({ title: "Det gick inte", description: crmErrorMessage(e), variant: "destructive" });
    } finally {
      setBusy(null);
    }
  }

  const setMode = (mode: Mode) => run("mode", () => crmFetchJson("/api/crm/reply-engine", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }),
  }), "Läget är ändrat");

  const learn = () => run("learn", () => crmFetchJson("/api/crm/reply-engine/learn", { method: "POST" }), "Inlärningen har startat – det tar några minuter");
  const runNow = () => run("run", () => crmFetchJson("/api/cron/reply-engine"), "Motorn har körts");
  const savePlaybook = () => run("playbook", async () => {
    await crmFetchJson("/api/crm/reply-engine", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playbook: playbookDraft ?? "" }) });
    setPlaybookDraft(null);
  }, "Playbooken är sparad");
  const runPreview = () => run("preview", async () => {
    const res = await crmFetchJson<{ results: Preview[] }>("/api/crm/reply-engine/preview", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limit: 6 }),
    });
    setPreview(res.results);
  });
  const sendEmail = (d: Decision) => run(`send-${d.id}`, () => crmFetchJson(`/api/crm/reply-engine/decisions/${d.id}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body: edits[d.id] ?? d.reply_text ?? "" }),
  }), "Mejlet är skickat");
  const discardEmail = (d: Decision) => run(`discard-${d.id}`, () => crmFetchJson(`/api/crm/reply-engine/decisions/${d.id}`, { method: "DELETE" }), "Förslaget är borttaget");

  if (!data) return <div className="p-6 text-sm text-muted-foreground">Laddar svarsmotorn…</div>;
  const { settings, stats } = data;
  const playbook = playbookDraft ?? settings.playbook;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold text-nordic-900">Svarsmotorn</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Läser nya SMS, WhatsApp och mejl från kunder och uthyrare, svarar på rutinfrågor och för varje kontakt mot nästa steg. Allt som rör pris, avtal eller löften blir ett utkast eller hamnar hos dig.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-sm font-semibold text-nordic-900">Läge</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              disabled={busy === "mode"}
              onClick={() => setMode(m.value)}
              className={`rounded-lg border p-3 text-left text-sm transition-colors ${settings.mode === m.value ? "border-[#ff6300] bg-orange-50" : "hover:bg-nordic-50"}`}
            >
              <div className="font-semibold text-nordic-900">{m.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{m.hint}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Aktiv 07–21. Hanterar meddelanden från {settings.activatedAt ? when(settings.activatedAt) : "–"}.</span>
          <button type="button" onClick={runNow} disabled={busy === "run"} className="rounded-md border px-2.5 py-1 font-medium text-nordic-800 hover:bg-nordic-50">
            {busy === "run" ? "Kör…" : "Kör nu"}
          </button>
          <button type="button" onClick={runPreview} disabled={busy === "preview"} className="rounded-md border px-2.5 py-1 font-medium text-nordic-800 hover:bg-nordic-50">
            {busy === "preview" ? "Testar…" : "Testa på senaste meddelandena"}
          </button>
        </div>
      </section>

      {preview && (
        <section className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-nordic-900">Test – så här hade motorn gjort (inget skickat)</h2>
            <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => setPreview(null)}>Stäng</button>
          </div>
          <div className="mt-3 space-y-3">
            {preview.map((p, i) => (
              <div key={i} className="rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{CHANNEL_LABEL[p.channel] ?? p.channel}</span><span>{when(p.at)}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${ACTION_LABEL[p.wouldDo]?.cls ?? ""}`}>{ACTION_LABEL[p.wouldDo]?.label ?? p.wouldDo}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-nordic-700">“{p.inbound}”</p>
                {p.decision && (
                  <>
                    <p className="mt-2 text-xs text-muted-foreground">{p.decision.intent} → {p.decision.outcomeGoal}{p.decision.nextStep ? ` · nästa: ${p.decision.nextStep}` : ""}</p>
                    {p.decision.reply && <p className="mt-2 whitespace-pre-wrap rounded-md bg-nordic-50 p-2 text-nordic-900">{p.decision.reply}</p>}
                    {p.decision.kajsaTask && <p className="mt-1 text-xs text-amber-800">Att göra för dig: {p.decision.kajsaTask}</p>}
                  </>
                )}
                {p.reasons.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Varför: {p.reasons.join("; ")}</p>}
                {p.error && <p className="mt-1 text-xs text-red-700">{p.error}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {emailDrafts.length > 0 && (
        <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4">
          <h2 className="text-sm font-semibold text-nordic-900">Mejlförslag att godkänna</h2>
          <div className="mt-3 space-y-3">
            {emailDrafts.map((d) => (
              <div key={d.id} className="rounded-lg border bg-white p-3 text-sm">
                <div className="text-xs text-muted-foreground">Till {d.to_address} · {d.reply_subject}</div>
                {d.reason && <div className="mt-1 text-xs text-amber-800">{d.reason}</div>}
                <textarea
                  className="mt-2 h-36 w-full rounded-md border p-2 text-sm"
                  value={edits[d.id] ?? d.reply_text ?? ""}
                  onChange={(e) => setEdits((x) => ({ ...x, [d.id]: e.target.value }))}
                />
                <div className="mt-2 flex gap-2">
                  <button type="button" disabled={busy === `send-${d.id}`} onClick={() => sendEmail(d)} className="rounded-md bg-[#ff6300] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#e55a00]">Skicka</button>
                  <button type="button" disabled={busy === `discard-${d.id}`} onClick={() => discardEmail(d)} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-nordic-50">Släng</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-nordic-900">Playbook – det motorn har lärt sig</h2>
          <button type="button" onClick={learn} disabled={busy === "learn"} className="rounded-md border px-2.5 py-1 text-xs font-medium text-nordic-800 hover:bg-nordic-50">
            Lär av all historik
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Historik: {stats.smsIn + stats.smsOut} SMS/WhatsApp och {stats.emailIn + stats.emailOut} mejl. {settings.learnStatus ? `Senast: ${settings.learnStatus.replace(/^\S+\s/, "")} (${when(settings.learnStatus.split(" ")[0])}).` : "Inte körd än."} Du kan rätta texten direkt – motorn följer den.
        </p>
        <textarea
          className="mt-3 h-64 w-full rounded-md border p-2 font-mono text-xs"
          placeholder="Tom – kör inlärningen eller skriv egna regler här."
          value={playbook}
          onChange={(e) => setPlaybookDraft(e.target.value)}
        />
        {playbookDraft !== null && (
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={savePlaybook} disabled={busy === "playbook"} className="rounded-md bg-[#ff6300] px-3 py-1.5 text-xs font-semibold text-white">Spara</button>
            <button type="button" onClick={() => setPlaybookDraft(null)} className="rounded-md border px-3 py-1.5 text-xs">Ångra</button>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-nordic-900">Logg</h2>
          <div className="flex gap-1 text-xs">
            <button type="button" onClick={() => setFilter("action")} className={`rounded-md px-2 py-1 ${filter === "action" ? "bg-nordic-100 font-medium" : ""}`}>Händelser</button>
            <button type="button" onClick={() => setFilter("all")} className={`rounded-md px-2 py-1 ${filter === "all" ? "bg-nordic-100 font-medium" : ""}`}>Allt</button>
          </div>
        </div>
        {decisions.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Inget ännu.</p>
        ) : (
          <div className="mt-3 divide-y">
            {decisions.map((d) => {
              const badge = ACTION_LABEL[d.action] ?? { label: d.action, cls: "bg-nordic-100" };
              const href = d.company_id ? `/crm/company/${d.company_id}` : d.owner_id ? `/crm/uthyrare/${d.owner_id}` : null;
              return (
                <div key={d.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{when(d.created_at)}</span>
                    <span>{CHANNEL_LABEL[d.channel] ?? d.channel}{d.source_type === "followup" ? " · påminnelse" : ""}</span>
                    <span className={`rounded-full px-2 py-0.5 font-medium ${badge.cls}`}>{badge.label}</span>
                    {d.feedback && <span className="rounded-full bg-nordic-100 px-2 py-0.5">{d.feedback === "approved" ? "du godkände" : d.feedback === "edited" ? "du ändrade" : "du slängde"}</span>}
                    {d.follow_up_status === "pending" && d.follow_up_at && <span>påminner {when(d.follow_up_at)}</span>}
                    {href && <Link href={href} className="text-nordic-700 underline-offset-2 hover:underline">Öppna kort</Link>}
                  </div>
                  {d.inbound_text && <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-nordic-700">“{d.inbound_text}”</p>}
                  {(d.intent || d.outcome_goal) && <p className="mt-1 text-xs text-muted-foreground">{[d.intent, d.outcome_goal].filter(Boolean).join(" → ")}</p>}
                  {d.reply_text && <p className="mt-1 whitespace-pre-wrap rounded-md bg-nordic-50 p-2 text-nordic-900">{d.final_text ?? d.reply_text}</p>}
                  {d.reason && <p className="mt-1 text-xs text-muted-foreground">{d.reason}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        SMS- och WhatsApp-förslag godkänner du i <Link href="/crm" className="underline">Utkast i Min dag</Link>. WhatsApp skickas av WhatsApp-agenten på din Mac.
      </p>
    </div>
  );
}
