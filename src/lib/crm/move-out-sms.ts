import { MOVE_OUT_LANDLORD_MESSAGE_KEY, MOVE_OUT_TENANT_MESSAGE_KEY } from "./move-checklists";

// Varje utskick hör till ett visst uppdrag, inte bara till ett telefonnummer.
export type MoveOutRecipient = "tenant" | "landlord";
export const moveOutSmsSource = (requestId: string, recipient: MoveOutRecipient) => `move_out_sms:${recipient}:${requestId}`;

export const hasUnfilledMoveOutSmsFields = (body: string) => /\[[^\]]+\]/.test(body);

// CRM-utskick räknas först när Macen rapporterar "sent". WhatsApp och andra
// externa utskick kan i stället markeras manuellt för respektive mottagare.
export function withSentMoveOutSms(
  checklist: string[] | null | undefined,
  sent: Record<MoveOutRecipient, boolean>,
): string[] {
  return Array.from(new Set([
    ...(checklist ?? []),
    ...(sent.tenant ? [MOVE_OUT_TENANT_MESSAGE_KEY] : []),
    ...(sent.landlord ? [MOVE_OUT_LANDLORD_MESSAGE_KEY] : []),
  ]));
}
