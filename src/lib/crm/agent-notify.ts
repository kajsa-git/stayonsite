// Säger till Kajsas agent (eve/, eget Vercel-projekt) att en ny förfrågan finns, så att
// agenten kan söka boende direkt i stället för att fråga CRM:et om och om igen.
// Avstängt tills KAJSA_AGENT_URL och KAJSA_AGENT_SECRET finns i miljön. Ett fel här får
// aldrig påverka själva förfrågan: anropet körs efter svaret och fel loggas bara.
export type NewRequestSource = "webb" | "crm";

export async function notifyAgentNewRequest(
  requestId: string,
  source: NewRequestSource,
  opts: { fetchImpl?: typeof fetch; env?: Record<string, string | undefined> } = {},
): Promise<"sent" | "disabled" | "failed"> {
  const env = opts.env ?? process.env;
  const base = env.KAJSA_AGENT_URL?.trim().replace(/\/+$/, "");
  const secret = env.KAJSA_AGENT_SECRET?.trim();
  if (!base || !secret) return "disabled";
  try {
    const res = await (opts.fetchImpl ?? fetch)(`${base}/crm/ny-forfragan`, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ requestId, source }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) {
      console.error("Agenten kunde inte ta emot förfrågan", res.status);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("Agenten kunde inte nås", error instanceof Error ? error.message : "okänt fel");
    return "failed";
  }
}
