export interface LandlordMatchStatus {
  sms: string;
  email: string;
}

export function landlordMatchStatusText(status: LandlordMatchStatus): string {
  const sms: Record<string, string> = {
    queued: "sms köat", sending: "sms skickas", sent: "sms skickat", delivered: "sms levererat",
    failed: "sms kunde inte skickas", missing_phone: "telefonnummer saknas eller är ogiltigt",
    too_long: "sms är för långt", cancelled: "sms avbrutet", unknown: "sms-status okänd",
  };
  const email: Record<string, string> = {
    sent: "mejl skickat", pending: "mejlstatus behöver kontrolleras", failed: "mejl kunde inte skickas",
    unknown: "kontrollera om mejlet skickades", missing_email: "mejladress saknas eller är ogiltig",
  };
  return `${sms[status.sms] ?? "sms-status okänd"} · ${email[status.email] ?? "mejlstatus okänd"}`;
}

export function landlordMatchNeedsAttention(status: LandlordMatchStatus): boolean {
  return !["queued", "sending", "sent", "delivered"].includes(status.sms) || status.email !== "sent";
}
