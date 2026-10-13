import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../../app/api/crm/weekly-report/route";

const mocks = vi.hoisted(() => ({ session: vi.fn(), report: vi.fn() }));
vi.mock("./auth", () => ({ requireApprovedSession: mocks.session }));
vi.mock("./weekly-report", () => ({ computeWeeklyReport: mocks.report }));

beforeEach(() => { vi.clearAllMocks(); });

describe("GET /api/crm/weekly-report", () => {
  it("kräver godkänd CRM-session innan data läses", async () => {
    mocks.session.mockResolvedValue(null);
    const response = await GET(new Request("https://www.stayonsite.se/api/crm/weekly-report"));
    expect(response.status).toBe(401);
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it("validerar periodvalet", async () => {
    mocks.session.mockResolvedValue({ user: { approved: true } });
    const response = await GET(new Request("https://www.stayonsite.se/api/crm/weekly-report?includeCurrent=no"));
    expect(response.status).toBe(400);
    expect(mocks.report).not.toHaveBeenCalled();
  });

  it("levererar färska siffror utan delad cache och stödjer avslutade veckor", async () => {
    mocks.session.mockResolvedValue({ user: { approved: true } });
    mocks.report.mockResolvedValue({ weeks: [], totals: { properties: 1, requests: 2 } });
    const response = await GET(new Request("https://www.stayonsite.se/api/crm/weekly-report?includeCurrent=0"));
    expect(response.status).toBe(200);
    expect(mocks.report).toHaveBeenCalledWith({ includeCurrent: false });
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({ totals: { properties: 1, requests: 2 } });
  });

  it("visar hämtningsfel som fel i stället för nollor", async () => {
    mocks.session.mockResolvedValue({ user: { approved: true } });
    mocks.report.mockRejectedValue(new Error("database unavailable"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      const response = await GET(new Request("https://www.stayonsite.se/api/crm/weekly-report"));
      expect(response.status).toBe(500);
      expect(await response.json()).toMatchObject({ error: "Kunde inte hämta veckorapporten. Försök igen." });
    } finally { log.mockRestore(); }
  });
});
