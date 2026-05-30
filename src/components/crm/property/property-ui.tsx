// Delade presentationshjälpare för objektvyn/redigeringsformuläret. Ren utbrytning
// ur PropertyView — oförändrat utseende och beteende.
import type React from "react";

export const FIELD_CLS =
  "w-full text-sm border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function Equip({ label, value, yes }: { label: string; value?: string; yes?: boolean }) {
  const display = value ?? (yes ? "Ja" : "Nej");
  const color = value
    ? "text-nordic-900"
    : yes
      ? "text-green-700 font-medium"
      : "text-muted-foreground";
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${color}`}>{display}</dd>
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      {label}
    </label>
  );
}

export function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
