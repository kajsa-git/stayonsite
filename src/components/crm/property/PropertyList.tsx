"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { crmFetch, crmFetchJson, crmErrorMessage } from "@/lib/crm/fetcher";
import type { PropertyWithOwner } from "@/lib/crm/owners";
import { Image as ImageIcon, LayoutList, Plus, Search, Table2 } from "lucide-react";

type PropertyWithThumb = PropertyWithOwner & { thumbnailUrl?: string | null };
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { PropertyView } from "./PropertyView";
import { OwnerPicker, type OwnerPickerValue } from "./OwnerPicker";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PROP_STATUS: Record<string, { label: string; cls: string }> = {
  available: { label: "Tillgänglig", cls: "bg-green-100 text-green-800" },
  reserved: { label: "Reserverad", cls: "bg-amber-100 text-amber-800" },
  rented: { label: "Uthyrd", cls: "bg-blue-100 text-blue-800" },
  off_market: { label: "Av marknaden", cls: "bg-gray-100 text-gray-600" },
};

export function PropertyList() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PropertyWithOwner | null>(null);
  const [adding, setAdding] = useState(false);
  const [justCreatedId, setJustCreatedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");
  const [statusFilter, setStatusFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  const { data: properties = [], mutate, isLoading } = useSWR<PropertyWithThumb[]>(
    `/api/crm/properties?q=${encodeURIComponent(search)}&ownerId=${encodeURIComponent(ownerFilter)}`,
    fetcher
  );
  const loading = isLoading && properties.length === 0;

  const cities = useMemo(
    () => [...new Set(properties.map((p) => p.city).filter(Boolean) as string[])].sort(),
    [properties]
  );

  const filtered = useMemo(() => {
    const minBr = minBedrooms ? parseInt(minBedrooms) : 0;
    return properties.filter((p) => {
      if (statusFilter && (p.status ?? "available") !== statusFilter) return false;
      if (cityFilter && p.city !== cityFilter) return false;
      if (minBr && (p.bedrooms ?? 0) < minBr) return false;
      if (publishedFilter === "yes" && !p.published) return false;
      if (publishedFilter === "no" && p.published) return false;
      return true;
    });
  }, [properties, statusFilter, cityFilter, minBedrooms, publishedFilter]);

  // Deep-link från global sök: /crm/properties?id=… öppnar objektet direkt (en gång).
  // Läs query först efter mount (useEffect kör aldrig på servern → ingen hydreringskrock).
  const [deepId, setDeepId] = useState<string | null>(null);
  const applied = useRef(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDeepId(params.get("id"));
    setOwnerFilter(params.get("ownerId") ?? "");
  }, []);
  useEffect(() => {
    if (deepId && !applied.current && properties.length) {
      const p = properties.find((x) => x.id === deepId);
      if (p) {
        setSelected(p);
        setViewMode("list");
        applied.current = true;
      }
    }
  }, [deepId, properties]);

  async function handleAdd(data: Omit<PropertyWithOwner, "id" | "createdAt">) {
    try {
      const created = await crmFetchJson<PropertyWithOwner>("/api/crm/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      mutate();
      setAdding(false);
      setSelected(created);
      setJustCreatedId(created.id);
      setViewMode("list");
      toast({ title: "Bostad sparad" });
    } catch (e) {
      toast({ title: crmErrorMessage(e), variant: "destructive" });
    }
  }

  // Kastar vidare vid fel så att anropare (PropertyView snabbåtgärder) kan hoppa
  // över sin success-toast; feltoasten visas här.
  async function handleUpdate(id: string, data: Partial<PropertyWithOwner>) {
    try {
      const updated = await crmFetchJson<PropertyWithOwner>(`/api/crm/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSelected((current) => (current?.id === id ? { ...current, ...updated } : current));
      mutate();
    } catch (e) {
      toast({ title: crmErrorMessage(e), variant: "destructive" });
      throw e;
    }
  }

  async function handleDelete(id: string) {
    try {
      await crmFetch(`/api/crm/properties/${id}`, { method: "DELETE" });
      setSelected(null);
      mutate();
      toast({ title: "Bostad borttagen" });
    } catch (e) {
      toast({ title: crmErrorMessage(e), variant: "destructive" });
    }
  }

  const toggleBtn = (mode: "list" | "table", label: string, Icon: typeof Table2) => (
    <button
      onClick={() => setViewMode(mode)}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md transition-colors ${
        viewMode === mode ? "bg-nordic-200 text-nordic-900 font-medium" : "text-muted-foreground hover:bg-nordic-100"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top bar: search + view toggle + add */}
      <div className="flex items-center gap-3 p-3 border-b bg-white shrink-0">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Sök bostäder…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {toggleBtn("list", "Lista", LayoutList)}
          {toggleBtn("table", "Tabell", Table2)}
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} objekt</span>
        <Button size="sm" className="ml-auto gap-1 text-xs" onClick={() => { setAdding(true); setSelected(null); }}>
          <Plus className="h-3 w-3" /> Ny bostad
        </Button>
      </div>

      {/* Filterrad */}
      {!adding && (
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-nordic-50 shrink-0 flex-wrap text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-7 border rounded px-2 bg-white text-xs"
          >
            <option value="">Alla statusar</option>
            {Object.entries(PROP_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="h-7 border rounded px-2 bg-white text-xs"
          >
            <option value="">Alla orter</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-muted-foreground">
            Min sovrum
            <input
              type="number"
              min={0}
              value={minBedrooms}
              onChange={(e) => setMinBedrooms(e.target.value)}
              className="h-7 w-16 border rounded px-2 bg-white text-xs"
            />
          </label>
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="h-7 border rounded px-2 bg-white text-xs"
          >
            <option value="">Alla (publicering)</option>
            <option value="yes">Publicerad</option>
            <option value="no">Ej publicerad</option>
          </select>
          {ownerFilter && (
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-teal-800">
              Uthyrare-filter
            </span>
          )}
          {(statusFilter || cityFilter || minBedrooms || publishedFilter || ownerFilter) && (
            <button
              onClick={() => { setStatusFilter(""); setCityFilter(""); setMinBedrooms(""); setPublishedFilter(""); setOwnerFilter(""); }}
              className="text-muted-foreground hover:text-foreground underline"
            >
              Rensa
            </button>
          )}
        </div>
      )}

      {/* Body */}
      {adding ? (
        <div className="flex-1 overflow-y-auto p-6">
          <PropertyForm onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      ) : viewMode === "table" ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden [&>div]:overflow-visible">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-nordic-100 [&_th]:h-auto [&_th]:py-2.5 [&_th]:text-[11px] [&_th]:uppercase [&_th]:tracking-wide [&_th]:font-semibold [&_th]:whitespace-nowrap [&_th]:text-nordic-900">
                <TableRow className="border-b border-nordic-200 hover:bg-transparent">
                  <TableHead className="w-14" />
                  <TableHead>Adress</TableHead>
                  <TableHead>Postnummer</TableHead>
                  <TableHead>Ort</TableHead>
                  <TableHead>Uthyrare</TableHead>
                  <TableHead>m²</TableHead>
                  <TableHead>Sovrum</TableHead>
                  <TableHead>Bäddar</TableHead>
                  <TableHead>Hyra ut</TableHead>
                  <TableHead>Möblerat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tillgänglig</TableHead>
                  <TableHead>Hemsida</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td]:py-2.5 [&_td]:whitespace-nowrap">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-t border-nordic-100">
                      <TableCell colSpan={13}><div className="h-5 w-full rounded bg-nordic-100 animate-pulse" /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow className="hover:bg-transparent"><TableCell colSpan={13} className="py-10 text-center text-muted-foreground italic">Inga bostäder.</TableCell></TableRow>
                ) : (
                  filtered.map((p) => {
                    const st = PROP_STATUS[p.status ?? "available"] ?? PROP_STATUS.available;
                    return (
                      <TableRow
                        key={p.id}
                        tabIndex={0}
                        onClick={() => { setSelected(p); setJustCreatedId(null); setViewMode("list"); }}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(p); setJustCreatedId(null); setViewMode("list"); } }}
                        className="even:bg-nordic-100 hover:bg-primary-50/70 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
                      >
                        <TableCell>
                          {p.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.thumbnailUrl} alt="" className="h-9 w-9 rounded object-cover border" />
                          ) : (
                            <div className="h-9 w-9 rounded border bg-nordic-100 flex items-center justify-center text-nordic-300"><ImageIcon className="h-3.5 w-3.5" /></div>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{p.address || "(saknas)"}</TableCell>
                        <TableCell className="text-foreground">{p.postalCode || "–"}</TableCell>
                        <TableCell className="text-foreground">{p.city || "–"}</TableCell>
                        <TableCell className="text-foreground">{p.ownerName || "–"}</TableCell>
                        <TableCell className="text-foreground">{p.squareMeters ?? "–"}</TableCell>
                        <TableCell className="text-foreground">{p.bedrooms ?? "–"}</TableCell>
                        <TableCell className="text-foreground">{p.beds ?? "–"}</TableCell>
                        <TableCell className="text-foreground">{p.rentOut ? `${p.rentOut.toLocaleString("sv-SE")} kr` : "–"}</TableCell>
                        <TableCell className="text-foreground">{p.furnished ? "Ja" : "–"}</TableCell>
                        <TableCell>
                          <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                        </TableCell>
                        <TableCell className="text-foreground">{p.moveInFrom || "–"}</TableCell>
                        <TableCell className="text-foreground">{p.published ? "✓" : "–"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 min-h-0">
          {/* Sidebar list */}
          <div className="w-72 border-r bg-white overflow-y-auto shrink-0">
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b">
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 rounded bg-nordic-100 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-nordic-100 animate-pulse" />
                  </div>
                  <div className="h-11 w-11 shrink-0 rounded-md bg-nordic-100 animate-pulse" />
                </div>
              ))}
            {!loading && filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground italic">Inga bostäder.</div>
            )}
            {!loading && filtered.map((p) => (
              <button
                key={p.id}
                className={`w-full flex items-center gap-3 text-left px-3 py-2.5 border-b text-sm hover:bg-nordic-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400 ${selected?.id === p.id ? "bg-nordic-100 font-medium" : ""}`}
                onClick={() => { setSelected(p); setJustCreatedId(null); }}
              >
                <div className="flex-1 min-w-0">
                  <div className="truncate">{p.address || "(Adress saknas)"}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {[p.city, p.bedrooms && `${p.bedrooms} sovrum`].filter(Boolean).join(" · ")}
                  </div>
                </div>
                {p.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumbnailUrl} alt="" className="h-11 w-11 shrink-0 rounded-md border object-cover" />
                ) : (
                  <div className="h-11 w-11 shrink-0 rounded-md border bg-nordic-100 flex items-center justify-center text-nordic-300">
                    <ImageIcon className="h-4 w-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {/* Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            {selected ? (
              <PropertyView
                key={selected.id}
                property={selected}
                onUpdate={(data) => handleUpdate(selected.id, data)}
                onDelete={() => handleDelete(selected.id)}
                startEditing={selected.id === justCreatedId}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Välj en bostad i listan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyForm({
  onSave,
  onCancel,
}: {
  onSave: (data: Omit<PropertyWithOwner, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<PropertyWithOwner>>({ status: "available" });

  function set(key: keyof PropertyWithOwner, value: string | number | boolean | undefined) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setOwnerFields(patch: Partial<OwnerPickerValue>) {
    setForm((f) => ({
      ...f,
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerId") ? { ownerId: patch.ownerId ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerType") ? { ownerType: patch.ownerType ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerArrangement") ? { ownerArrangement: patch.ownerArrangement ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerName") ? { ownerName: patch.ownerName ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerOrgNr") ? { ownerOrgNr: patch.ownerOrgNr ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerContactPerson") ? { ownerContactPerson: patch.ownerContactPerson ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerPhone") ? { ownerPhone: patch.ownerPhone ?? null } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, "ownerEmail") ? { ownerEmail: patch.ownerEmail ?? null } : {}),
    }));
  }
  const num = (v: string) => (v ? parseFloat(v) : undefined);

  return (
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold">Ny bostad</h2>
      <Field label="Adress" value={form.address} onChange={(v) => set("address", v)} required />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Postnummer" value={form.postalCode} onChange={(v) => set("postalCode", v)} />
        <Field label="Ort" value={form.city} onChange={(v) => set("city", v)} />
        <Field label="Land" value={form.country} onChange={(v) => set("country", v)} placeholder="Sverige" />
        <Field label="Yta (m²)" value={form.squareMeters?.toString()} onChange={(v) => set("squareMeters", num(v))} type="number" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Sovrum" value={form.bedrooms?.toString()} onChange={(v) => set("bedrooms", num(v))} type="number" />
        <Field label="Bäddar" value={form.beds?.toString()} onChange={(v) => set("beds", num(v))} type="number" />
        <Field label="Badrum" value={form.bathrooms?.toString()} onChange={(v) => set("bathrooms", num(v))} type="number" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Tvättmaskin (antal)" value={form.washingMachines?.toString()} onChange={(v) => set("washingMachines", num(v))} type="number" />
        <Field label="Tumlare (antal)" value={form.dryers?.toString()} onChange={(v) => set("dryers", num(v))} type="number" />
        <Field label="Parkering (antal)" value={form.parkingSpaces?.toString()} onChange={(v) => set("parkingSpaces", num(v))} type="number" />
      </div>
      <div className="flex flex-wrap gap-4 py-1">
        <Check label="Möblerat" checked={!!form.furnished} onChange={(v) => set("furnished", v)} />
        <Check label="Kök" checked={!!form.kitchen} onChange={(v) => set("kitchen", v)} />
        <Check label="Diskmaskin" checked={!!form.dishwasher} onChange={(v) => set("dishwasher", v)} />
        <Check label="Garage" checked={!!form.garage} onChange={(v) => set("garage", v)} />
        <Check label="Bredband ingår" checked={!!form.broadband} onChange={(v) => set("broadband", v)} />
        <Check label="Eget boende" checked={!!form.egetBoende} onChange={(v) => set("egetBoende", v)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Skick (fritext)</label>
        <textarea
          value={form.skick ?? ""}
          onChange={(e) => set("skick", e.target.value)}
          placeholder="T.ex. fint och fräscht, äldre standard, lantligt…"
          className="w-full text-sm border rounded px-2 py-1.5 min-h-[48px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50/60 px-3 py-2">
        <Check label="Publicera på hemsidan (visar endast postnummer, aldrig adress)" checked={!!form.published} onChange={(v) => set("published", v)} />
      </div>
      <div className="rounded-md border p-3 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Uthyrare</p>
        <OwnerPicker value={form} onChange={setOwnerFields} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Typ</label>
            <select
              value={form.ownerType ?? "privatperson"}
              onChange={(e) => set("ownerType", e.target.value)}
              className="w-full h-8 text-sm border rounded px-2 bg-white"
            >
              <option value="privatperson">Privatperson</option>
              <option value="foretag">Företag</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Upplägg</label>
            <select
              value={form.ownerArrangement ?? "direkt"}
              onChange={(e) => set("ownerArrangement", e.target.value)}
              className="w-full h-8 text-sm border rounded px-2 bg-white"
            >
              <option value="direkt">Direkt</option>
              <option value="formedlare">Förmedlare</option>
            </select>
          </div>
        </div>
        <Field label={form.ownerType === "foretag" ? "Företagsnamn" : "Namn"} value={form.ownerName} onChange={(v) => set("ownerName", v)} />
        {form.ownerType === "foretag" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Org.nr" value={form.ownerOrgNr} onChange={(v) => set("ownerOrgNr", v)} />
            <Field label="Kontaktperson" value={form.ownerContactPerson} onChange={(v) => set("ownerContactPerson", v)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefon" value={form.ownerPhone} onChange={(v) => set("ownerPhone", v)} />
          <Field label="E-post" value={form.ownerEmail} onChange={(v) => set("ownerEmail", v)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vi hyr för (kr/mån)" value={form.rentIn?.toString()} onChange={(v) => set("rentIn", num(v))} type="number" />
        <Field label="Vi hyr ut för (kr/mån)" value={form.rentOut?.toString()} onChange={(v) => set("rentOut", num(v))} type="number" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tillgänglig från" value={form.moveInFrom} onChange={(v) => set("moveInFrom", v)} type="date" />
        <Field label="Tillgänglig till" value={form.availableTo} onChange={(v) => set("availableTo", v)} type="date" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Intern beskrivning (visas aldrig publikt)</label>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          className="w-full text-sm border rounded px-2 py-1.5 min-h-[60px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Extern beskrivning (visas på hemsidan)</label>
        <textarea
          value={form.publicDescription ?? ""}
          onChange={(e) => set("publicDescription", e.target.value)}
          className="w-full text-sm border rounded px-2 py-1.5 min-h-[60px] resize-y focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" onClick={onCancel}>Avbryt</Button>
        <Button onClick={() => onSave(form as Omit<PropertyWithOwner, "id" | "createdAt">)} disabled={!form.address}>
          Spara bostad
        </Button>
      </div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}{required ? " *" : ""}</label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
}
