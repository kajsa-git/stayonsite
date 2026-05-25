"use client";

import { CompanyHeader } from "@/components/crm/company/CompanyHeader";
import { CompanyInfo } from "@/components/crm/company/CompanyInfo";
import { ContactsList } from "@/components/crm/company/ContactsList";
import { NotesPanel } from "@/components/crm/company/NotesPanel";
import { OutcomeButtons } from "@/components/crm/company/OutcomeButtons";
import { RequestsList } from "@/components/crm/company/RequestsList";
import { useCompany } from "@/hooks/crm/useCompany";
import { useKeyboardShortcuts } from "@/hooks/crm/useKeyboardShortcuts";
import type { Company } from "@/lib/crm/schema";
import { useParams, useRouter } from "next/navigation";
import { use, useState } from "react";

export default function CompanyPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { company, mutate } = useCompany(id);
  const [outcomeModal, setOutcomeModal] = useState<"followup" | "invoice" | "lost" | null>(null);

  const activeRequest = company?.requests?.find(
    (r) => r.status === "incoming" || r.status === "matching"
  ) ?? null;

  useKeyboardShortcuts({
    onF1: () => activeRequest && router.push(`/crm/matching/${activeRequest.id}`),
    onF2: () => setOutcomeModal("followup"),
    onF3: () => setOutcomeModal("invoice"),
    onF4: () => setOutcomeModal("lost"),
    onF5: () => activeRequest && handleStatusChange(activeRequest.id, "archived"),
  });

  async function handleSaveField(field: keyof Company, value: string) {
    await fetch(`/api/crm/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    mutate();
  }

  async function handleAddContact(data: { name?: string | null; phone?: string | null; email?: string | null; isPrimary?: boolean | null }) {
    await fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id, ...data }),
    });
    mutate();
  }

  async function handleUpdateContact(contactId: string, data: object) {
    await fetch(`/api/crm/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
  }

  async function handleDeleteContact(contactId: string) {
    await fetch(`/api/crm/contacts/${contactId}`, { method: "DELETE" });
    mutate();
  }

  async function handleStatusChange(requestId: string, status: string, extra?: Record<string, unknown>) {
    await fetch(`/api/crm/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, ...extra }),
    });
    mutate();
    setOutcomeModal(null);
  }

  async function handleFollowUp(date: string, reason: string) {
    await fetch(`/api/crm/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followUpDate: date, followUpReason: reason }),
    });
    mutate();
    setOutcomeModal(null);
  }

  async function handleAddNote(channel: string, content: string) {
    await fetch("/api/crm/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id, channel, content }),
    });
    mutate();
  }

  async function handleNewRequest() {
    await fetch("/api/crm/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId: id, status: "incoming" }),
    });
    mutate();
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Laddar…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <CompanyHeader company={company} />
      <CompanyInfo company={company} onSave={handleSaveField} />

      <OutcomeButtons
        activeRequest={activeRequest}
        companyId={id}
        onStatusChange={handleStatusChange}
        onFollowUp={handleFollowUp}
        onNavigateToMatching={(reqId) => router.push(`/crm/matching/${reqId}`)}
      />

      <div className="mt-8 grid grid-cols-2 gap-8">
        <div>
          <ContactsList
            contacts={company.contacts ?? []}
            companyId={id}
            onAdd={handleAddContact}
            onUpdate={handleUpdateContact}
            onDelete={handleDeleteContact}
          />
          <RequestsList
            requests={company.requests ?? []}
            companyId={id}
            activeRequestId={activeRequest?.id}
            onNewRequest={handleNewRequest}
          />
        </div>
        <div>
          <NotesPanel
            notes={company.notes ?? []}
            companyId={id}
            onAdd={handleAddNote}
          />
        </div>
      </div>
    </div>
  );
}
