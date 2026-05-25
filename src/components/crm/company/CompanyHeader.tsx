"use client";

import { Badge } from "@/components/ui/badge";
import type { Company } from "@/lib/crm/schema";

interface Props {
  company: Company;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const categoryColors: Record<string, string> = {
  Bygg: "bg-amber-100 text-amber-800",
  Skog: "bg-green-100 text-green-800",
  Energi: "bg-blue-100 text-blue-800",
  Infrastruktur: "bg-purple-100 text-purple-800",
  Montage: "bg-orange-100 text-orange-800",
};

export function CompanyHeader({ company }: Props) {
  const colorClass = company.category
    ? (categoryColors[company.category] ?? "bg-nordic-200 text-nordic-800")
    : "bg-nordic-200 text-nordic-800";

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-14 w-14 rounded-2xl bg-nordic-700 text-white flex items-center justify-center text-xl font-bold shrink-0">
        {initials(company.name)}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-nordic-900">{company.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          {company.orgNr && (
            <span className="text-sm text-muted-foreground font-mono">{company.orgNr}</span>
          )}
          {company.category && (
            <Badge className={`text-xs ${colorClass}`}>{company.category}</Badge>
          )}
          {company.website && (
            <a
              href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline"
            >
              {company.website}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
