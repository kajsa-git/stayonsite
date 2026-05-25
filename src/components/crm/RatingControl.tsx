"use client";

function ratingColor(r: number | null | undefined): string {
  if (r == null) return "bg-white text-muted-foreground border-input";
  if (r <= 5) return "bg-red-100 text-red-800 border-red-300";
  if (r <= 7) return "bg-amber-100 text-amber-800 border-amber-300";
  return "bg-green-100 text-green-800 border-green-300";
}

export function RatingControl({
  value,
  onChange,
  label = "Rating",
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : parseInt(e.target.value, 10))}
        className={`text-xs font-semibold px-2 py-1 rounded-md border cursor-pointer focus:outline-none ${ratingColor(value)}`}
        title="0–10 (röd <6, gul 6–7, grön 8–10)"
      >
        <option value="">–</option>
        {Array.from({ length: 11 }, (_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
    </div>
  );
}
