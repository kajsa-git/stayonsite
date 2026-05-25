"use client";

import { Star, X } from "lucide-react";
import { useState } from "react";

// Rating lagras som 0–10. Visas som 5 stjärnor (varje stjärna = 2 poäng).
// Enkelklick på en stjärna sätter värdet (stjärna N = N×2). Halva stjärnor
// visas för befintliga udda värden, men klick sätter hela stjärnor — lätt att träffa.
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
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: 5 }, (_, i) => {
          const starVal = (i + 1) * 2; // 2,4,6,8,10
          const points = Math.max(0, Math.min(2, display - i * 2)); // 0, 1 (halv), 2 (hel)
          const fillPct = (points / 2) * 100;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Sätt ${starVal} av 10`}
              title={`${starVal} / 10`}
              className="relative h-6 w-6 cursor-pointer"
              onMouseEnter={() => setHover(starVal)}
              onClick={() => onChange(starVal)}
            >
              {/* tom stjärna (botten) */}
              <Star className="absolute inset-0 h-6 w-6 text-nordic-300" fill="currentColor" strokeWidth={0} />
              {/* fylld stjärna, klippt till fillPct */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${fillPct}%` }}>
                <Star className="h-6 w-6 text-amber-400" fill="currentColor" strokeWidth={0} />
              </span>
            </button>
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
