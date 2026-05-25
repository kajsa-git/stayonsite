"use client";

import { Star, X } from "lucide-react";
import { useState } from "react";

// Rating lagras som 0–10. Visas som 5 stjärnor (varje stjärna = 2 poäng),
// med halva stjärnor för udda värden — som en recensionssajt.
export function RatingControl({
  value,
  onChange,
  label = "Rating",
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  label?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value ?? 0;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex items-center" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: 5 }, (_, i) => {
          const points = Math.max(0, Math.min(2, display - i * 2)); // 0, 1 (halv) eller 2 (hel)
          const fillPct = (points / 2) * 100;
          const leftVal = i * 2 + 1; // klick vänster halva → udda
          const rightVal = i * 2 + 2; // klick höger halva → jämn
          return (
            <span key={i} className="relative inline-block h-5 w-5">
              {/* tom stjärna (botten) */}
              <Star className="absolute inset-0 h-5 w-5 text-nordic-300" fill="currentColor" strokeWidth={0} />
              {/* fylld stjärna, klippt till fillPct */}
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillPct}%` }}>
                <Star className="h-5 w-5 text-amber-400" fill="currentColor" strokeWidth={0} />
              </span>
              {/* klick-/hover-zoner: vänster halva = udda, höger halva = jämn */}
              <button
                type="button"
                aria-label={`Sätt ${leftVal} av 10`}
                className="absolute left-0 top-0 h-5 w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(leftVal)}
                onClick={() => onChange(leftVal)}
              />
              <button
                type="button"
                aria-label={`Sätt ${rightVal} av 10`}
                className="absolute right-0 top-0 h-5 w-1/2 cursor-pointer"
                onMouseEnter={() => setHover(rightVal)}
                onClick={() => onChange(rightVal)}
              />
            </span>
          );
        })}
      </div>
      <span className="text-xs font-medium text-nordic-700 tabular-nums w-9">
        {value != null ? `${value}/10` : "–"}
      </span>
      {value != null && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-foreground"
          title="Rensa skattning"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
