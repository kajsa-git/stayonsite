// Only call a message delivered when there is one unambiguous matching row and
// Messages explicitly reports delivery. SMS often has no delivery receipt.
export function classifyDelivery(rows, pending) {
  if (typeof pending.body !== "string" || !Number.isFinite(pending.sentAtMs)) return "unknown";
  const matches = rows.filter((row) => row.body === pending.body
    && row.atMs >= pending.sentAtMs - 10_000
    && row.atMs <= pending.sentAtMs + 120_000);
  if (matches.length !== 1) return "unknown";
  if (Number(matches[0].error ?? 0) > 0) return "failed";
  if (Number(matches[0].isDelivered ?? 0) === 1) return "delivered";
  return "unknown";
}
