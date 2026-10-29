export type BillingSnapshot = {
  planId: string;
  planVersion: number;
  month: string;
  companyName: string;
  customerNumber: string;
  fortnoxCustomerName: string | null;
  accommodation: string;
  periodStart: string;
  periodEnd: string;
  partialMonth: boolean;
  amountMinor: number;
  vatRate: number;
  vatIncluded: boolean;
  netMinor: number;
  vatMinor: number;
  totalMinor: number;
  invoiceDate: string;
  dueDate: string;
  reference: string;
  externalReference: string;
  articleNumber: string | null;
  accountNumber: number | null;
};

export type BillingPeriodState = "review" | "creating" | "draft" | "failed" | "uncertain";

export type BillingPreview = {
  snapshot: BillingSnapshot;
  blockers: string[];
  periodId: string | null;
  reviewId: string | null;
};
