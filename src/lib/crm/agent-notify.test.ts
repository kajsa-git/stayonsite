import { describe, expect, it, vi } from "vitest";
import { notifyAgentNewRequest } from "./agent-notify";

describe("notifyAgentNewRequest", () => {
  it("gör ingenting när agenten inte är konfigurerad", async () => {
    const fetchImpl = vi.fn();
    expect(await notifyAgentNewRequest("r1", "webb", { fetchImpl, env: {} })).toBe("disabled");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("skickar förfrågans id med hemligheten", async () => {
    const fetchImpl = vi.fn(async () => new Response("ok", { status: 202 }));
    const result = await notifyAgentNewRequest("r1", "crm", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env: { KAJSA_AGENT_URL: "https://agent.example/", KAJSA_AGENT_SECRET: "hemlis" },
    });
    expect(result).toBe("sent");
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://agent.example/crm/ny-forfragan");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer hemlis");
    expect(JSON.parse(String(init.body))).toEqual({ requestId: "r1", source: "crm" });
  });

  it("sväljer fel så att förfrågan aldrig påverkas", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("nere");
    });
    const result = await notifyAgentNewRequest("r1", "webb", {
      fetchImpl: fetchImpl as unknown as typeof fetch,
      env: { KAJSA_AGENT_URL: "https://agent.example", KAJSA_AGENT_SECRET: "hemlis" },
    });
    expect(result).toBe("failed");
  });
});
