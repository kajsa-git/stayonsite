import { BillingView } from "@/components/crm/billing/BillingView";
import { LanguageProvider } from "@/contexts/LanguageContext";

export default async function RentalsPage({ searchParams }: { searchParams: Promise<{ request?: string }> }) {
  const query = await searchParams;
  return <LanguageProvider><BillingView requestId={typeof query.request === "string" ? query.request : undefined} /></LanguageProvider>;
}
