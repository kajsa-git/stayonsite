"use client";

import type { Company, Contact } from "@/lib/crm/schema";
import { ExternalLink, Mail, Phone, User } from "lucide-react";
import { PhoneActions } from "@/components/crm/PhoneActions";

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded";

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

const LEAD_SOURCE_LABELS: Record<string, string> = {
  kallt: "Kallt samtal",
  webb: "Webb",
  befintlig: "Befintlig kund",
  referens: "Referens",
};

export function CompanyHeader({ company, primaryContact }: Props) {
  const websiteHref = company.website
    ? company.website.startsWith("http") ? company.website : `https://${company.website}`
    : null;
  const websiteLabel = company.website?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="h-14 w-14 rounded-2xl bg-nordic-700 text-white flex items-center justify-center text-xl font-bold shrink-0">
        {initials(company.name)}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-nordic-900 truncate">{company.name}</h1>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs">
          {company.orgNr && (
            <span className="font-mono text-nordic-600">{company.orgNr}</span>
          )}
          {websiteHref && (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-primary-600 hover:underline max-w-[16rem] truncate ${FOCUS}`}
            >
              <span className="truncate">{websiteLabel}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
          {company.leadSource && LEAD_SOURCE_LABELS[company.leadSource] && (
            <span className="rounded-full border border-input px-2 py-0.5 text-nordic-600">
              {LEAD_SOURCE_LABELS[company.leadSource]}
            </span>
          )}
        </div>

        {primaryContact && (
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-nordic-800">
              <User className="h-3.5 w-3.5 text-nordic-500" />
              {primaryContact.name}
            </span>
            {primaryContact.phone && (
              <span className="flex items-center gap-1.5">
                <a href={`tel:${primaryContact.phone}`} className={`flex items-center gap-1.5 text-nordic-700 hover:text-primary-600 ${FOCUS}`}>
                  <Phone className="h-3.5 w-3.5 text-nordic-500" />
                  {primaryContact.phone}
                </a>
                <PhoneActions phone={primaryContact.phone} />
              </span>
            )}
            {primaryContact.email && (
              <a href={`mailto:${primaryContact.email}`} className={`flex items-center gap-1.5 text-nordic-700 hover:text-primary-600 ${FOCUS}`}>
                <Mail className="h-3.5 w-3.5 text-nordic-500" />
                <span className="truncate max-w-[18rem]">{primaryContact.email}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
