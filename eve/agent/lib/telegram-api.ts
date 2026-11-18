// Bot API-anrop från verktyg. Verktyg har inte kanalens Telegram-handtag, så de
// skickar själva med bottens token till Kajsas chatt.
import { kajsasChatId, kravs } from "./config.ts";

export async function skickaTillKajsa(
  body: { text: string; reply_markup?: Record<string, unknown>; disable_notification?: boolean },
  opts: { fetchImpl?: typeof fetch; env?: Record<string, string | undefined> } = {},
): Promise<{ messageId: number }> {
  const env = opts.env ?? process.env;
  const token = kravs("TELEGRAM_BOT_TOKEN", env);
  const res = await (opts.fetchImpl ?? fetch)(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: kajsasChatId(env), link_preview_options: { is_disabled: true }, ...body }),
    signal: AbortSignal.timeout(15_000),
  });
  const json = (await res.json().catch(() => ({}))) as { ok?: boolean; description?: string; result?: { message_id?: number } };
  if (!res.ok || !json.ok || typeof json.result?.message_id !== "number") {
    throw new Error(`Telegram tog inte emot meddelandet: ${json.description ?? res.status}`);
  }
  return { messageId: json.result.message_id };
}
