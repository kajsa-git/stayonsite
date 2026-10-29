"use client";

import { useState, type FormEvent } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-translation";
import type { BillingCandidate, BillingOverview, BillingPlanRow } from "@/lib/crm/billing";
import { parseBillingAmount } from "@/lib/crm/billing-calendar";
import { billingFetch } from "./billing-client";

type Props = {
  plan?: BillingPlanRow;
  candidate?: BillingCandidate;
  customers: BillingOverview["customers"];
  defaultMonth: string;
  onClose: () => void;
  onSaved: () => void;
};

export function BillingPlanDialog({ plan, candidate, customers, defaultMonth, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const source = plan ?? candidate;
  const [companyId, setCompanyId] = useState(source?.companyId ?? "");
  const [customerNumber, setCustomerNumber] = useState(plan?.customerNumber ?? customers.find((c) => c.id === source?.companyId)?.customerNumber ?? "");
  const [accommodation, setAccommodation] = useState(source?.accommodation ?? "");
  const [amount, setAmount] = useState(source?.monthlyAmountMinor ? String(source.monthlyAmountMinor / 100).replace(".", ",") : "");
  const [vatRate, setVatRate] = useState(plan ? String(plan.vatRate) : "");
  const [priceBasis, setPriceBasis] = useState(plan ? (plan.vatIncluded ? "incl" : "excl") : "");
  const [startDate, setStartDate] = useState(source?.startDate ?? "");
  const [endDate, setEndDate] = useState(source?.endDate ?? "");
  const [ongoing, setOngoing] = useState(!source?.endDate);
  const [firstMonth, setFirstMonth] = useState(plan?.firstBillingMonth ?? (source?.startDate?.slice(0, 7) > defaultMonth ? source.startDate.slice(0, 7) : defaultMonth));
  const [terms, setTerms] = useState(plan ? String(plan.paymentTermsDays) : "");
  const [reference, setReference] = useState(source?.reference ?? "");
  const [active, setActive] = useState(plan?.active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault();
    const monthlyAmountMinor = parseBillingAmount(amount);
    if (!monthlyAmountMinor) { setError(t("billing.invalidAmount")); return; }
    if (!vatRate || !priceBasis || terms === "") return;
    setBusy(true); setError("");
    try {
      await billingFetch(plan ? `/api/crm/billing/${plan.id}` : "/api/crm/billing", {
        method: plan ? "PATCH" : "POST",
        body: JSON.stringify({
          companyId, requestId: source?.requestId ?? null, propertyId: source?.propertyId ?? null,
          accommodation, customerNumber, monthlyAmountMinor, vatRate: Number(vatRate), vatIncluded: priceBasis === "incl",
          startDate, endDate: ongoing ? null : endDate, firstBillingMonth: firstMonth,
          paymentTermsDays: Number(terms), reference, active, ...(plan ? { version: plan.version } : {}),
        }),
      });
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{plan ? t("billing.edit") : t("billing.add")}</DialogTitle>
          <DialogDescription>{t("billing.planHelp")}</DialogDescription>
        </DialogHeader>
        <form id="billing-plan" onSubmit={save}>
          <FieldGroup className="gap-4 sm:grid sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="billing-company">{t("billing.customer")}</FieldLabel>
              <Select name="company" required disabled={!!plan || !!candidate || busy} value={companyId} onValueChange={(value) => { setCompanyId(value); setCustomerNumber(customers.find((c) => c.id === value)?.customerNumber ?? ""); }}>
                <SelectTrigger id="billing-company"><SelectValue placeholder={t("billing.chooseCustomer")} /></SelectTrigger>
                <SelectContent><SelectGroup>{customers.map((customer) => <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-customer-number">{t("billing.customerNumber")}</FieldLabel>
              <Input id="billing-customer-number" required maxLength={30} value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} disabled={busy} />
              <FieldDescription>{t("billing.customerNumberHelp")}</FieldDescription>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="billing-accommodation">{t("billing.accommodation")}</FieldLabel>
              <Input id="billing-accommodation" required maxLength={150} value={accommodation} onChange={(e) => setAccommodation(e.target.value)} disabled={busy} />
            </Field>
            <Field data-invalid={!!error && !parseBillingAmount(amount)}>
              <FieldLabel htmlFor="billing-monthly-amount">{t("billing.monthlyAmount")}</FieldLabel>
              <Input id="billing-monthly-amount" required inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={busy} aria-invalid={!!error && !parseBillingAmount(amount)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-price-basis">{t("billing.priceBasis")}</FieldLabel>
              <Select name="priceBasis" required value={priceBasis} onValueChange={setPriceBasis} disabled={busy}>
                <SelectTrigger id="billing-price-basis"><SelectValue placeholder={t("billing.priceBasis")} /></SelectTrigger>
                <SelectContent><SelectGroup><SelectItem value="excl">{t("billing.excluding")}</SelectItem><SelectItem value="incl">{t("billing.including")}</SelectItem></SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-vat">{t("billing.vatRate")}</FieldLabel>
              <Select name="vat" required value={vatRate} onValueChange={setVatRate} disabled={busy}>
                <SelectTrigger id="billing-vat"><SelectValue placeholder={t("billing.chooseVat")} /></SelectTrigger>
                <SelectContent><SelectGroup>{[0, 6, 12, 25].map((rate) => <SelectItem key={rate} value={String(rate)}>{rate} %</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-terms">{t("billing.terms")}</FieldLabel>
              <Input id="billing-terms" type="number" min={0} max={365} step={1} required value={terms} onChange={(e) => setTerms(e.target.value)} disabled={busy} />
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-start">{t("billing.start")}</FieldLabel>
              <Input id="billing-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={busy} />
            </Field>
            <Field>
              <FieldLabel htmlFor="billing-end">{t("billing.end")}</FieldLabel>
              <Input id="billing-end" type="date" required={!ongoing} min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={ongoing || busy} />
              <Field orientation="horizontal"><Checkbox id="billing-ongoing" checked={ongoing} onCheckedChange={(value) => setOngoing(value === true)} disabled={busy} /><FieldLabel htmlFor="billing-ongoing">{t("billing.ongoing")}</FieldLabel></Field>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="billing-first-month">{t("billing.firstMonth")}</FieldLabel>
              <Input id="billing-first-month" type="month" required value={firstMonth} onChange={(e) => setFirstMonth(e.target.value)} disabled={busy} />
              <FieldDescription>{t("billing.firstMonthHelp")}</FieldDescription>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="billing-reference">{t("billing.reference")}</FieldLabel>
              <Input id="billing-reference" maxLength={100} value={reference} onChange={(e) => setReference(e.target.value)} disabled={busy} />
            </Field>
            <Field orientation="horizontal" className="sm:col-span-2"><Checkbox id="billing-active" checked={active} onCheckedChange={(value) => setActive(value === true)} disabled={busy} /><FieldLabel htmlFor="billing-active">{t("billing.active")}</FieldLabel></Field>
          </FieldGroup>
        </form>
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        <DialogFooter><Button variant="outline" onClick={onClose} disabled={busy}>{t("billing.cancel")}</Button><Button type="submit" form="billing-plan" disabled={busy}>{busy ? t("billing.saving") : t("billing.save")}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
