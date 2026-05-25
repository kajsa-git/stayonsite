"use client";

import { Badge } from "@/components/ui/badge";
import type { Company, Contact } from "@/lib/crm/schema";
import { Mail, Phone, User } from "lucide-react";

interface Props {
  company: Company;
  primaryContact?: Contact | null;
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

const LEAD_SOURCE_LABELS: Record<string, string> = {
  kallt: "Kallt samtal",
  webb: "Webb",
  befintlig: "Befintlig kund",
  referens: "Referens",
};

export function CompanyHeader({ company, primaryContact }: Props) {
  const colorClass = company.category
    ? (categoryColors[company.category] ?? "bg-nordic-200 text-nordic-800")
    : "bg-nordic-200 text-nordic-800";

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="h-14 w-14 rounded-2xl bg-nordic-700 text-white flex items-center justify-center text-xl font-bold shrink-0">
        {initials(company.name)}
      </div>
      <div className="min-w-0">
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
          {company.leadSource && LEAD_SOURCE_LABELS[company.leadSource] && (
            <Badge variant="outline" className="text-xs">
              {LEAD_SOURCE_LABELS[company.leadSource]}
            </Badge>
          )}
        </div>

        {primaryContact && (
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-nordic-800">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              {primaryContact.name}
            </span>
            {primaryContact.phone && (
              <a href={`tel:${primaryContact.phone}`} className="flex items-center gap-1.5 text-nordic-700 hover:text-primary-600">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                {primaryContact.phone}
              </a>
            )}
            {primaryContact.email && (
              <a href={`mailto:${primaryContact.email}`} className="flex items-center gap-1.5 text-nordic-700 hover:text-primary-600">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {primaryContact.email}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
