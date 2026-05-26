"use client";

import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";

// Rating lagras som 0–10 och visas som 10 små stjärnor.
export function RatingControl({
  value,
  onChange,
  label = "Rating",
}: {
  value: number | null | undefined;
  onChange: (value: number | null) => void | Promise<void>;
  label?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [localValue, setLocalValue] = useState<number | null>(value ?? null);
  const display = hover ?? localValue ?? 0;

  useEffect(() => {
    setLocalValue(value ?? null);
  }, [value]);

  async function commit(next: number | null) {
    const previous = localValue;
    setLocalValue(next);
    setHover(null);
    try {
      await onChange(next);
    } catch {
      setLocalValue(previous);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: 10 }, (_, i) => {
          const starVal = i + 1;
          const filled = display >= starVal;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Sätt ${starVal} av 10`}
              title={`${starVal} / 10`}
              className="relative h-4 w-4 cursor-pointer"
              onMouseEnter={() => setHover(starVal)}
              onClick={() => commit(starVal)}
            >
              <Star
                className={`absolute inset-0 h-4 w-4 ${filled ? "text-amber-400" : "text-nordic-300"}`}
                fill="currentColor"
                strokeWidth={0}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs font-medium text-nordic-700 tabular-nums w-9">
        {localValue != null ? `${localValue}/10` : "–"}
      </span>
      {localValue != null && (
        <button
          type="button"
          onClick={() => commit(null)}
          className="text-muted-foreground hover:text-foreground"
          title="Rensa skattning"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
