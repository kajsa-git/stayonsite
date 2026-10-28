type InboxSms = { id: string; direction: string; fromPhone: string; body: string; sentAt: string };
type OutboxSms = { id: string; toPhone: string; body: string; status: string; sentAt: string | null; createdAt: string | null; deliveredAt: string | null };

function timestamp(value: string | null) {
  if (!value) return NaN;
  return Date.parse(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

// Matcha bara exakt text och telefon i ett kort tidsfönster och bara när
// kopplingen är entydig åt båda håll. Osäkra träffar får ingen leveransetikett.
export function matchOutgoingSms(inbox: InboxSms[], outbox: OutboxSms[]): Map<string, OutboxSms> {
  const pairs: [InboxSms, OutboxSms][] = [];
  for (const incoming of inbox) {
    if (incoming.direction !== "out") continue;
    for (const outgoing of outbox) {
      if (outgoing.status !== "sent" || incoming.fromPhone !== outgoing.toPhone || incoming.body.trim() !== outgoing.body.trim()) continue;
      if (Math.abs(timestamp(incoming.sentAt) - timestamp(outgoing.sentAt ?? outgoing.createdAt)) <= 120_000) pairs.push([incoming, outgoing]);
    }
  }
  const result = new Map<string, OutboxSms>();
  const inboxCounts = new Map<string, number>();
  const outboxCounts = new Map<string, number>();
  for (const [incoming, outgoing] of pairs) {
    inboxCounts.set(incoming.id, (inboxCounts.get(incoming.id) ?? 0) + 1);
    outboxCounts.set(outgoing.id, (outboxCounts.get(outgoing.id) ?? 0) + 1);
  }
  for (const [incoming, outgoing] of pairs) {
    if (inboxCounts.get(incoming.id) === 1 && outboxCounts.get(outgoing.id) === 1) {
      result.set(incoming.id, outgoing);
    }
  }
  return result;
}
