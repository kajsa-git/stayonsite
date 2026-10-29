"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ExternalLink, FileText, History, Plus, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationKey } from "@/data/translations";
import type { BillingCandidate, BillingOverview, BillingPlanRow } from "@/lib/crm/billing";
import { billingMonthBounds, billingMonthLabel, isBillingMonth, nextBillingMonth } from "@/lib/crm/billing-calendar";
import { BillingPlanDialog } from "./BillingPlanDialog";
import { BillingReviewDialog } from "./BillingReviewDialog";
import { billingFetch, billingMoney } from "./billing-client";

const stateKeys: Record<string, TranslationKey> = {
  review: "billing.ready", draft: "billing.draft", creating: "billing.creating", uncertain: "billing.uncertain", failed: "billing.failed", paused: "billing.paused", outside: "billing.outside", ready: "billing.ready",
};

function planApplies(plan: BillingPlanRow, month: string): boolean {
  const bounds = billingMonthBounds(month);
  return plan.active && plan.firstBillingMonth <= month && plan.startDate <= bounds.end && (!plan.endDate || plan.endDate >= bounds.start);
}

export function BillingView({ requestId }: { requestId?: string }) {
  const { t } = useTranslation();
  const { data, error, isLoading, mutate } = useSWR<BillingOverview>("/api/crm/billing", billingFetch);
  const [month, setMonth] = useState(() => nextBillingMonth());
  const [showAll, setShowAll] = useState(false);
  const [editor, setEditor] = useState<{ plan?: BillingPlanRow; candidate?: BillingCandidate } | null>(null);
  const [reviewPlan, setReviewPlan] = useState<BillingPlanRow | null>(null);
  const [historyPlan, setHistoryPlan] = useState<BillingPlanRow | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);

  const scopedPlans = data?.plans.filter((plan) => !requestId || plan.requestId === requestId) ?? [];
  const applicable = scopedPlans.filter((plan) => planApplies(plan, month));
  const createdCount = applicable.filter((plan) => data?.periods.some((period) => period.planId === plan.id && period.month === month && period.status === "draft")).length;
  const visible = scopedPlans.filter((plan) => showAll || planApplies(plan, month));
  const candidates = data?.candidates.filter((candidate) => !requestId || candidate.requestId === requestId) ?? [];

  async function reconcile(id: string) {
    setCheckingId(id);
    try { await billingFetch(`/api/crm/billing/periods/${id}/reconcile`, { method: "POST" }); toast.success(t("billing.checked")); }
    catch (e) { toast.error(e instanceof Error ? e.message : String(e)); }
    finally { setCheckingId(null); void mutate(); }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
      <Toaster richColors />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h1 className="text-2xl font-semibold tracking-tight">{t("billing.title")}</h1><p className="mt-1 text-sm text-muted-foreground">{t("billing.subtitle")}</p></div>
        <Button onClick={() => setEditor({})} disabled={!data}><Plus data-icon="inline-start" />{t("billing.add")}</Button>
      </div>
      <Alert><FileText /><AlertTitle>{t("billing.reviewOnly")}</AlertTitle><AlertDescription>{t("billing.reviewOnlyDescription")}</AlertDescription></Alert>
      {error ? <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription><Button className="mt-3" variant="outline" onClick={() => void mutate()}>{t("billing.retry")}</Button></Alert> : null}
      {isLoading ? <div className="flex flex-col gap-4" aria-label={t("billing.loading")}><Skeleton className="h-24 w-full" /><Skeleton className="h-64 w-full" /></div> : null}
      {data ? <>
        {!data.connection.connected ? <Alert><AlertTitle>{t("billing.notConnected")}</AlertTitle><AlertDescription>{t("billing.setup")}</AlertDescription>{data.connection.configured ? <Button asChild variant="outline" className="mt-3"><a href="/api/crm/fortnox/connect">{t("billing.notConnected")}</a></Button> : null}</Alert> : <div><Badge variant="secondary">{t("billing.connected")}</Badge></div>}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Field className="max-w-sm"><FieldLabel htmlFor="billing-month">{t("billing.period")}</FieldLabel><Input id="billing-month" type="month" value={month} onChange={(e) => { if (isBillingMonth(e.target.value)) setMonth(e.target.value); }} /><FieldDescription>{t("billing.advance")}</FieldDescription></Field>
          <Field orientation="horizontal" className="w-auto pb-1"><Checkbox id="billing-show-all" checked={showAll} onCheckedChange={(value) => setShowAll(value === true)} /><FieldLabel htmlFor="billing-show-all">{t("billing.all")}</FieldLabel></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">{[
          [t("billing.rentals"), applicable.length], [t("billing.created"), createdCount], [t("billing.toReview"), applicable.length - createdCount],
        ].map(([label, value]) => <Card key={label}><CardHeader className="pb-2"><CardDescription>{label}</CardDescription></CardHeader><CardContent><p className="text-3xl font-semibold tabular-nums">{value}</p></CardContent></Card>)}</div>
        <Card>
          <CardHeader><CardTitle>{billingMonthLabel(month)}</CardTitle><CardDescription>{requestId ? <Link href="/crm/uthyrningar">{t("billing.title")}</Link> : t("billing.planHelp")}</CardDescription></CardHeader>
          <CardContent>
            {visible.length ? <Table>
              <TableHeader><TableRow><TableHead>{t("billing.customer")} / {t("billing.accommodation")}</TableHead><TableHead>{t("billing.monthlyAmount")}</TableHead><TableHead>{t("billing.rentalPeriod")}</TableHead><TableHead>{t("billing.status")}</TableHead><TableHead className="text-right">{t("billing.actions")}</TableHead></TableRow></TableHeader>
              <TableBody>{visible.map((plan) => {
                const period = data.periods.find((item) => item.planId === plan.id && item.month === month);
                const eligible = planApplies(plan, month);
                const state = period?.status ?? (!plan.active ? "paused" : !eligible ? "outside" : "ready");
                const needsCheck = period && ["creating", "uncertain"].includes(period.status);
                return <TableRow key={plan.id}>
                  <TableCell><Link href={`/crm/company/${plan.companyId}`} className="font-medium hover:underline">{plan.companyName}</Link><p className="mt-1 text-muted-foreground">{plan.accommodation}</p></TableCell>
                  <TableCell className="whitespace-nowrap tabular-nums">{billingMoney(plan.monthlyAmountMinor)}<p className="text-xs text-muted-foreground">{plan.vatIncluded ? t("billing.including") : t("billing.excluding")} · {plan.vatRate} %</p></TableCell>
                  <TableCell className="whitespace-nowrap text-xs">{plan.startDate}<br />{plan.endDate ?? t("billing.ongoing")}</TableCell>
                  <TableCell className="max-w-64"><Badge variant={period?.status === "draft" ? "secondary" : "outline"}>{t(stateKeys[state])}</Badge>{period?.invoiceNumber ? <p className="mt-1 text-xs text-muted-foreground">#{period.invoiceNumber}</p> : null}{period?.lastError ? <p className="mt-2 text-xs text-muted-foreground">{period.lastError}</p> : null}</TableCell>
                  <TableCell><div className="flex flex-col items-end gap-2">
                    {period?.invoiceUrl ? <Button asChild variant="outline" size="sm"><a href={period.invoiceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink data-icon="inline-start" />{t("billing.open")}</a></Button> : needsCheck ? <Button variant="outline" size="sm" disabled={checkingId === period.id} onClick={() => void reconcile(period.id)}><RefreshCw data-icon="inline-start" />{t("billing.check")}</Button> : <Button size="sm" disabled={!eligible} onClick={() => setReviewPlan(plan)}>{t("billing.review")}</Button>}
                    <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setEditor({ plan })}>{t("billing.edit")}</Button><Button variant="ghost" size="sm" onClick={() => setHistoryPlan(plan)}><History data-icon="inline-start" />{t("billing.history")}</Button></div>
                  </div></TableCell>
                </TableRow>;
              })}</TableBody>
            </Table> : <Empty><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>{t("billing.none")}</EmptyTitle><EmptyDescription>{t("billing.noneDescription")}</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onClick={() => setEditor({})}><Plus data-icon="inline-start" />{t("billing.add")}</Button></EmptyContent></Empty>}
          </CardContent>
        </Card>
        {candidates.length ? <Card><CardHeader><CardTitle>{t("billing.candidates")}</CardTitle><CardDescription>{t("billing.candidatesDescription")}</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{candidates.map((candidate) => <div key={candidate.sourceKey} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"><div><Link href={`/crm/matching/${candidate.requestId}`} className="text-sm font-medium hover:underline">{candidate.companyName} · #{candidate.requestNumber}</Link><p className="mt-1 text-sm text-muted-foreground">{candidate.accommodation}</p>{!candidate.contractSigned ? <Badge className="mt-2" variant="outline">{t("billing.contractMissing")}</Badge> : null}</div><Button variant="outline" size="sm" onClick={() => setEditor({ candidate })}>{t("billing.addPlan")}</Button></div>)}</CardContent></Card> : null}
        {editor ? <BillingPlanDialog key={editor.plan?.id ?? editor.candidate?.sourceKey ?? "new"} plan={editor.plan} candidate={editor.candidate} customers={data.customers} defaultMonth={data.defaultMonth} onClose={() => setEditor(null)} onSaved={() => { setEditor(null); toast.success(t("billing.saved")); void mutate(); }} /> : null}
        {reviewPlan ? <BillingReviewDialog key={`${reviewPlan.id}:${month}`} plan={reviewPlan} month={month} onClose={() => setReviewPlan(null)} onChanged={() => void mutate()} /> : null}
        {historyPlan ? <Dialog open onOpenChange={(open) => !open && setHistoryPlan(null)}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>{t("billing.history")}</DialogTitle><DialogDescription>{historyPlan.companyName} · {historyPlan.accommodation}</DialogDescription></DialogHeader>{data.periods.some((period) => period.planId === historyPlan.id) ? <div className="flex flex-col gap-3">{data.periods.filter((period) => period.planId === historyPlan.id).map((period) => <div key={period.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"><div><p className="font-medium">{billingMonthLabel(period.month)}</p><Badge className="mt-1" variant="outline">{t(stateKeys[period.status])}</Badge>{period.lastError ? <p className="mt-2 text-xs text-muted-foreground">{period.lastError}</p> : null}</div>{period.invoiceUrl ? <Button asChild variant="outline" size="sm"><a href={period.invoiceUrl} target="_blank" rel="noopener noreferrer">#{period.invoiceNumber}<ExternalLink data-icon="inline-end" /></a></Button> : null}</div>)}</div> : <p className="text-sm text-muted-foreground">{t("billing.noHistory")}</p>}</DialogContent></Dialog> : null}
      </> : null}
    </div>
  );
}
