import { MatchingView } from "@/components/crm/matching/MatchingView";
import { db } from "@/lib/crm/db";
import { companies, requests } from "@/lib/crm/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function MatchingPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;

  const [request] = await db.select().from(requests).where(eq(requests.id, requestId));
  if (!request) notFound();

  const [company] = await db.select().from(companies).where(eq(companies.id, request.companyId));

  return <MatchingView request={request} companyName={company?.name ?? ""} />;
}
