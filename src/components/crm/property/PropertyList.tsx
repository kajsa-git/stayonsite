"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Property } from "@/lib/crm/schema";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { PropertyView } from "./PropertyView";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PropertyList() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Property | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: properties = [], mutate } = useSWR<Property[]>(
    `/api/crm/properties?q=${encodeURIComponent(search)}`,
    fetcher
  );

  async function handleAdd(data: Omit<Property, "id" | "createdAt">) {
    await fetch("/api/crm/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    mutate();
    setAdding(false);
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r bg-white flex flex-col">
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Sök bostäder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {properties.map((p) => (
            <button
              key={p.id}
              className={`w-full text-left px-3 py-2.5 border-b text-sm hover:bg-nordic-100 transition-colors ${selected?.id === p.id ? "bg-nordic-100 font-medium" : ""}`}
              onClick={() => setSelected(p)}
            >
              <div className="truncate">{p.address || "(Adress saknas)"}</div>
              <div className="text-xs text-muted-foreground truncate">
                {[p.city, p.beds && `${p.beds} bäddar`].filter(Boolean).join(" · ")}
              </div>
            </button>
          ))}
        </div>
        <div className="p-3 border-t">
          <Button
            size="sm"
            className="w-full gap-1 text-xs"
            onClick={() => { setAdding(true); setSelected(null); }}
          >
            <Plus className="h-3 w-3" /> Ny bostad
          </Button>
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {adding ? (
          <PropertyForm onSave={handleAdd} onCancel={() => setAdding(false)} />
        ) : selected ? (
          <PropertyView property={selected} onUpdate={async (data) => {
            await fetch(`/api/crm/properties`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: selected.id, ...data }),
            });
            mutate();
          }} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Välj en bostad eller lägg till ny
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyForm({
  onSave,
  onCancel,
}: {
  onSave: (data: Omit<Property, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Property>>({ status: "available" });

  function set(key: keyof Property, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold">Ny bostad</h2>
      <Field label="Adress" value={form.address} onChange={(v) => set("address", v)} required />
      <Field label="Ort" value={form.city} onChange={(v) => set("city", v)} />
      <div className="grid grid-cols-3 gap-3">
        <Field label="Sovrum" value={form.bedrooms?.toString()} onChange={(v) => set("bedrooms", parseInt(v))} type="number" />
        <Field label="Bäddar" value={form.beds?.toString()} onChange={(v) => set("beds", parseInt(v))} type="number" />
        <Field label="Badrum" value={form.bathrooms?.toString()} onChange={(v) => set("bathrooms", parseInt(v))} type="number" />
      </div>
      <Field label="Uthyrare" value={form.ownerName} onChange={(v) => set("ownerName", v)} />
      <Field label="Telefon (uthyrare)" value={form.ownerPhone} onChange={(v) => set("ownerPhone", v)} />
      <Field label="E-post (uthyrare)" value={form.ownerEmail} onChange={(v) => set("ownerEmail", v)} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vi hyr för (kr/mån)" value={form.rentIn?.toString()} onChange={(v) => set("rentIn", parseFloat(v))} type="number" />
        <Field label="Vi hyr ut för (kr/mån)" value={form.rentOut?.toString()} onChange={(v) => set("rentOut", parseFloat(v))} type="number" />
      </div>
      <Field label="Tillgänglig från" value={form.moveInFrom} onChange={(v) => set("moveInFrom", v)} type="date" />
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Avbryt</Button>
        <Button onClick={() => onSave(form as Omit<Property, "id" | "createdAt">)} disabled={!form.address}>
          Spara bostad
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}{required ? " *" : ""}</label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
    </div>
  );
}
