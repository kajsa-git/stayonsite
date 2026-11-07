import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReplyGroup, ReplyInbox as ReplyInboxData } from "@/lib/crm/reply-inbox";
import { ReplyInbox } from "./ReplyInbox";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
const fetchJson = vi.hoisted(() => vi.fn(async (..._args: unknown[]) => ({})));
vi.mock("@/lib/crm/fetcher", () => ({ crmFetchJson: fetchJson, crmErrorMessage: () => "fel" }));

function group(i: number, over: Partial<ReplyGroup> = {}): ReplyGroup {
  return {
    key: `contact:c${i}`, name: `Person ${i}`, context: `Bolag ${i}`, companyName: `Bolag ${i}`, companyId: `co${i}`, contactId: `c${i}`,
    ownerId: null, phone: null, email: `p${i}@bolag.se`, latestAt: `2026-11-07T0${i}:00:00Z`, preview: `Meddelande ${i}`,
    sms: [], openRequests: 1,
    mails: [{ key: `t${i}`, gmailThreadId: `t${i}`, subject: `Ämne ${i}`, fromEmail: `p${i}@bolag.se`, fromName: null, preview: `Meddelande ${i}`, sentAt: `2026-11-07T0${i}:00:00Z`, messageCount: 1, unreadIds: [`e${i}`], companyId: `co${i}`, companyName: `Bolag ${i}`, contactId: `c${i}`, contactName: `Person ${i}`, ownerId: null, ownerName: null }],
    ...over,
  };
}

function data(groups: ReplyGroup[], suggestionCount = 0): ReplyInboxData {
  return { groups, suggestionCount, mailSync: { lastRunAt: null, lastSuccessAt: null, lastError: null } };
}

function props(over: Partial<Parameters<typeof ReplyInbox>[0]> = {}) {
  return {
    data: data([group(1)]),
    onChanged: vi.fn(),
    canMarkWon: () => false,
    onMarkWon: vi.fn(),
    onCompanyFollowUp: vi.fn(async () => {}),
    onOwnerFollowUp: vi.fn(async () => {}),
    onCreateRequest: vi.fn(async () => {}),
    ...over,
  };
}

afterEach(() => fetchJson.mockClear());

describe("Att svara på", () => {
  it("is hidden when nothing is waiting", () => {
    const { container } = render(<ReplyInbox {...props({ data: data([]) })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows one compact row per person, five at a time", () => {
    render(<ReplyInbox {...props({ data: data([1, 2, 3, 4, 5, 6, 7].map((i) => group(i)), 2) })} />);
    expect(screen.getAllByText(/^Person \d$/)).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "Visa alla 7" }));
    expect(screen.getAllByText(/^Person \d$/)).toHaveLength(7);
    expect(screen.getByRole("link", { name: /2 nya avsändare att koppla/ })).toHaveAttribute("href", "/crm/foretag#nya-avsandare");
  });

  it("books a follow-up and marks the person's messages handled", async () => {
    const p = props({ data: data([group(1, { sms: [{ id: "i1", fromPhone: "+46701", body: "SMS", service: "SMS", sentAt: "2026-11-07T00:00:00Z", ownerId: null, contactId: "c1", companyId: "co1", ownerName: null, contactName: "Person 1", companyName: "Bolag 1", repliedTo: null, replyStatus: null }] })]) });
    render(<ReplyInbox {...p} />);
    fireEvent.click(screen.getByText("Person 1"));
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: "Återkomst om 3 d" })); });
    expect(p.onCompanyFollowUp).toHaveBeenCalledWith("co1", 3);
    expect(fetchJson).toHaveBeenCalledWith("/api/crm/emails/read", expect.objectContaining({ body: JSON.stringify({ ids: ["e1"] }) }));
    expect(fetchJson).toHaveBeenCalledWith("/api/crm/inbox/i1", expect.objectContaining({ method: "PATCH" }));
    expect(p.onChanged).toHaveBeenCalled();
  });

  it("offers Till avtal only when the funnel allows it, and a new request only without open ones", async () => {
    const p = props({ data: data([group(1), group(2, { openRequests: 0 })]), canMarkWon: (id: string) => id === "co1" });
    render(<ReplyInbox {...p} />);
    fireEvent.click(screen.getByText("Person 1"));
    expect(screen.queryByRole("button", { name: /Ny förfrågan/ })).not.toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Till avtal/ })); });
    expect(p.onMarkWon).toHaveBeenCalledWith("co1");

    fireEvent.click(screen.getByText("Person 2"));
    expect(screen.queryByRole("button", { name: /Till avtal/ })).not.toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole("button", { name: /Ny förfrågan/ })); });
    expect(p.onCreateRequest).toHaveBeenCalledWith("co2");
  });
});
