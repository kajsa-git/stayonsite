"use client";
import { CompanyCard } from "@/components/crm/company/CompanyCard";
import { useParams, useSearchParams } from "next/navigation";

export default function CompanyPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const activeRequestId = searchParams.get("request");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CompanyCard companyId={params.id} activeRequestId={activeRequestId} />
    </div>
  );
}
