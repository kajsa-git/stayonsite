"use client";

import { Button } from "@/components/ui/button";
import { matchScore } from "@/lib/crm/matching";
import type { Property, Request } from "@/lib/crm/schema";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { MatchScore } from "./MatchScore";

interface Props {
  request: Request;
  companyName: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MatchingView({ request, companyName }: Props) {
  const router = useRouter();
  const { data: properties = [], isLoading } = useSWR<Property[]>(
    `/api/crm/properties?q=`,
    fetcher
  );

  const scored = properties
    .map((p) => ({ property: p, score: matchScore(request, p) }))
    .sort((a, b) => b.score - a.score);

  async function handleAddSuggestion(propertyId: string) {
    await fetch(`/api/crm/requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wonPropertyId: propertyId }),
    });
    router.push(`/crm/company/${request.companyId}`);
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/crm/company/${request.companyId}`)}
          className="text-sm text-muted-foreground hover:text-foreground mb-2 block"
        >
          ← {companyName}
        </button>
        <h1 className="text-xl font-bold">Matcha förfrågan #{request.requestNumber}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {[request.city, request.persons && `${request.persons} pers.`, request.startDate]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Request criteria */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold mb-3">Kriterier</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Ort" value={request.city} />
            <Row label="Antal personer" value={request.persons?.toString()} />
            <Row label="Inflytt" value={request.startDate} />
            <Row label="Utflytt" value={request.endDate} />
          </dl>
        </div>

        {/* Properties */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Tillgängliga bostäder ({properties.length})</h2>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Laddar…</p>
          ) : scored.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Inga bostäder inlagda ännu.</p>
          ) : (
            scored.map(({ property, score }) => (
              <div key={property.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="font-medium text-sm">{property.address}</div>
                    <div className="text-xs text-muted-foreground">
                      {[property.city, property.beds && `${property.beds} bäddar`, property.bedrooms && `${property.bedrooms} sovrum`]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>
                  <MatchScore score={score} />
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
                  <Row label="Uthyrare" value={property.ownerName} />
                  <Row label="Hyra ut" value={property.rentOut ? `${property.rentOut} kr/mån` : undefined} />
                  <Row label="Tillgänglig" value={property.moveInFrom} />
                  <Row label="Status" value={property.status} />
                </dl>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => handleAddSuggestion(property.id)}
                >
                  Välj denna bostad
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground shrink-0">{label}:</dt>
      <dd>{value}</dd>
    </div>
  );
}
