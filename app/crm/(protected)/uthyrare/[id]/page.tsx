"use client";

import { OwnerCard } from "@/components/crm/owner/OwnerCard";
import { useParams } from "next/navigation";

export default function OwnerDetailPage() {
  const params = useParams<{ id: string }>();
  return (
    <div className="max-w-6xl mx-auto p-6">
      <OwnerCard ownerId={params.id} />
    </div>
  );
}
