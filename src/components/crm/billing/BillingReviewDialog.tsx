"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/hooks/use-translation";
import type { BillingPlanRow } from "@/lib/crm/billing";
import type { BillingPeriod } from "@/lib/crm/schema";
import type { BillingPreview } from "@/lib/crm/billing-types";
import { billingMonthBounds, billingMonthLabel, billingToday, parseBillingAmount } from "@/lib/crm/billing-calendar";
import { billingFetch, billingMoney } from "./billing-client";

export function BillingReviewDialog({ plan, month, onClose, onChanged }: { plan: BillingPlanRow; month: string; onClose: () => void; onChanged: () => void }) {
  const { t } = useTranslation();
  const bounds = billingMonthBounds(month);
  const partial = plan.startDate > bounds.start || (!!plan.endDate && plan.endDate < bounds.end);
  const [invoiceDate, setInvoiceDate] = useState(() => billingToday());
  const [amount, setAmount] = useState(partial ? "" : String(plan.monthlyAmountMinor / 100).replace(".", ","));
  const [preview, setPreview] = useState<BillingPreview | null>(null);
  const [created, setCreated] = useState<BillingPeriod | null>(null);
  const [loading, setLoading] = useState(!partial);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadPreview = useCallback(async (dateValue: string, amountValue: string) => {
    const amountMinor = parseBillingAmount(amountValue);
    if (!amountMinor) return;
    setLoading(true); setPreview(null); setError("");
    try { setPreview(await billingFetch<BillingPreview>("/api/crm/billing/preview", { method: "POST", body: JSON.stringify({ planId: plan.id, month, invoiceDate: dateValue, amountMinor }) })); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setLoading(false); }
  }, [plan.id, month]);

  useEffect(() => {
    if (partial) return;
    let active = true;
    void billingFetch<BillingPreview>("/api/crm/billing/preview", { method: "POST", body: JSON.stringify({ planId: plan.id, month, invoiceDate: billingToday(), amountMinor: plan.monthlyAmountMinor }) })
      .then((value) => { if (active) setPreview(value); })
      .catch((e) => { if (active) setError(e instanceof Error ? e.message : String(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [partial, plan.id, plan.monthlyAmountMinor, month]);

  async function createDraft() {
    if (!preview?.periodId || !preview.reviewId || preview.blockers.length || creating) return;
    setCreating(true); setError("");
    try {
      setCreated(await billingFetch<BillingPeriod>("/api/crm/billing/drafts", { method: "POST", body: JSON.stringify({ periodId: preview.periodId, reviewId: preview.reviewId }) }));
      onChanged();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); setPreview(null); onChanged(); }
    finally { setCreating(false); }
  }

  const snapshot = preview?.snapshot;
  const busy = loading || creating;
  return (
    <Dialog open onOpenChange={(open) => !open && !creating && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{t("billing.reviewTitle")} · {billingMonthLabel(month)}</DialogTitle><DialogDescription>{t("billing.reviewOnlyDescription")}</DialogDescription></DialogHeader>
        <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
          <Field><FieldLabel htmlFor="billing-invoice-date">{t("billing.invoiceDate")}</FieldLabel><Input id="billing-invoice-date" type="date" value={invoiceDate} disabled={busy || !!created} onChange={(e) => { setInvoiceDate(e.target.value); setPreview(null); }} /></Field>
          <Field><FieldLabel htmlFor="billing-period-amount">{t("billing.periodAmount")} · {plan.vatIncluded ? t("billing.including") : t("billing.excluding")}</FieldLabel><Input id="billing-period-amount" inputMode="decimal" value={amount} disabled={busy || !!created} onChange={(e) => { setAmount(e.target.value); setPreview(null); }} /></Field>
        </FieldGroup>
        {partial ? <Alert><AlertDescription>{t("billing.partial")}</AlertDescription></Alert> : null}
        {!preview && !created ? <Button variant="outline" onClick={() => void loadPreview(invoiceDate, amount)} disabled={busy || !parseBillingAmount(amount) || !invoiceDate}>{loading ? t("billing.previewLoading") : t("billing.refreshPreview")}</Button> : null}
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        {snapshot ? (
          <Card>
            <CardHeader><CardTitle>{snapshot.accommodation}</CardTitle><CardDescription>{snapshot.periodStart} – {snapshot.periodEnd}</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t("billing.customer")}</dt><dd>{snapshot.companyName}</dd>
                <dt className="text-muted-foreground">{t("billing.fortnoxCustomer")}</dt><dd>{snapshot.fortnoxCustomerName ?? t("billing.notVerified")} · {snapshot.customerNumber}</dd>
                <dt className="text-muted-foreground">{t("billing.reference")}</dt><dd>{snapshot.reference || "—"}</dd>
                <dt className="text-muted-foreground">{t("billing.invoiceDate")}</dt><dd>{snapshot.invoiceDate}</dd>
                <dt className="text-muted-foreground">{t("billing.dueDate")}</dt><dd>{snapshot.dueDate}</dd>
              </dl>
              <Separator />
              <dl className="grid grid-cols-2 gap-2 text-sm tabular-nums">
                <dt>{t("billing.net")}</dt><dd className="text-right">{billingMoney(snapshot.netMinor)}</dd>
                <dt>{t("billing.vat")} ({snapshot.vatRate} %)</dt><dd className="text-right">{billingMoney(snapshot.vatMinor)}</dd>
              </dl>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4"><span className="font-semibold">{t("billing.total")}</span><strong className="tabular-nums">{billingMoney(snapshot.totalMinor)}</strong></CardFooter>
          </Card>
        ) : null}
        {preview?.blockers.length ? <Alert><AlertTitle>{t("billing.blocked")}</AlertTitle><AlertDescription><ul className="mt-2 flex list-disc flex-col gap-1 pl-4">{preview.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul></AlertDescription></Alert> : null}
        {created ? <Alert><AlertTitle>{t("billing.draftCreated")} · #{created.invoiceNumber}</AlertTitle><AlertDescription>{t("billing.draftCreatedDescription")}<p className="mt-2 font-medium">{t("billing.actualTotal")}: {billingMoney(created.invoiceTotalMinor)}</p>{created.lastError ? <p className="mt-2">{created.lastError}</p> : null}</AlertDescription></Alert> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={creating}>{t("billing.close")}</Button>
          {created?.invoiceUrl ? <Button asChild><a href={created.invoiceUrl} target="_blank" rel="noopener noreferrer"><ExternalLink data-icon="inline-start" />{t("billing.open")}</a></Button> : <Button onClick={() => void createDraft()} disabled={busy || !preview?.reviewId || !!preview?.blockers.length}><FileText data-icon="inline-start" />{creating ? t("billing.creatingDraft") : t("billing.createDraft")}</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
