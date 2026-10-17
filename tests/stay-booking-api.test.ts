import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  db: { auth: { getUser: vi.fn() }, rpc: vi.fn(), from: vi.fn() },
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mocks.db,
}));
import { GET, POST } from "../src/app/api/stays/bookings/route";
const id = "00000000-0000-4000-8000-000000000001";
const quote = "00000000-0000-4000-8000-000000000002";
const requestKey = "00000000-0000-4000-8000-000000000003";
function mutation(body: object, origin = "https://akiduermo.com") {
  return POST(
    new Request("https://akiduermo.com/api/stays/bookings", {
      method: "POST",
      headers: { origin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.db.auth.getUser.mockResolvedValue({ data: { user: { id } } });
  mocks.db.rpc.mockResolvedValue({ data: { id: quote }, error: null });
});
describe("stay booking authoritative server boundary", () => {
  it("rejects cross-origin mutations before authentication or database operations", async () => {
    expect(
      (
        await mutation(
          { action: "cancel", reservation: id },
          "https://akipasa.com",
        )
      ).status,
    ).toBe(403);
    expect(mocks.db.auth.getUser).not.toHaveBeenCalled();
    expect(mocks.db.rpc).not.toHaveBeenCalled();
  });
  it("requires a signed-in customer for quote, request and cancellation", async () => {
    mocks.db.auth.getUser.mockResolvedValue({ data: { user: null } });
    for (const body of [
      {
        action: "quote",
        roomType: id,
        checkIn: "2027-01-02",
        checkOut: "2027-01-04",
        guests: 2,
      },
      {
        action: "request",
        quote,
        key: requestKey,
        name: "Guest test",
        email: "guest@example.invalid",
        locale: "en",
      },
      { action: "cancel", reservation: id },
    ])
      expect((await mutation(body)).status).toBe(401);
    expect(mocks.db.rpc).not.toHaveBeenCalled();
  });
  it("revalidates quotes through the existing RPC without trusting submitted prices", async () => {
    expect(
      (
        await mutation({
          action: "quote",
          roomType: id,
          checkIn: "2027-01-02",
          checkOut: "2027-01-04",
          guests: 2,
          total_cents: 1,
        })
      ).status,
    ).toBe(200);
    expect(mocks.db.rpc).toHaveBeenCalledExactlyOnceWith(
      "accommodation_create_quote",
      { p_type: id, p_in: "2027-01-02", p_out: "2027-01-04", p_guests: 2 },
    );
  });
  it("preserves quote reference, idempotency key and localized request semantics", async () => {
    await mutation({
      action: "request",
      quote,
      key: requestKey,
      name: " Guest test ",
      email: "guest@example.invalid",
      locale: "es",
      status: "confirmed",
      total: 1,
    });
    expect(mocks.db.rpc).toHaveBeenCalledExactlyOnceWith(
      "accommodation_request_booking",
      {
        p_quote: quote,
        p_key: requestKey,
        p_name: "Guest test",
        p_email: "guest@example.invalid",
        p_locale: "es",
      },
    );
  });
  it("maps cancellation only to the authoritative state transition", async () => {
    await mutation({ action: "cancel", reservation: id, status: "confirmed" });
    expect(mocks.db.rpc).toHaveBeenCalledExactlyOnceWith(
      "accommodation_change_status",
      { p_reservation: id, p_status: "cancelled" },
    );
  });
  it("returns conflicts without success data when current quote or availability fails", async () => {
    mocks.db.rpc.mockResolvedValue({ data: null, error: { code: "409" } });
    const result = await mutation({
      action: "request",
      quote,
      key: requestKey,
      name: "Guest test",
      email: "guest@example.invalid",
      locale: "en",
    });
    expect(result.status).toBe(409);
    expect(await result.json()).toEqual({ error: "unavailable" });
  });
  it("rejects reversed dates and invalid guest counts before availability RPC", async () => {
    for (const query of [
      `venue=${id}&checkIn=2027-01-04&checkOut=2027-01-02&guests=2`,
      `venue=${id}&checkIn=2027-01-02&checkOut=2027-01-04&guests=0`,
    ])
      expect(
        (
          await GET(
            new Request(`https://akiduermo.com/api/stays/bookings?${query}`),
          )
        ).status,
      ).toBe(400);
    expect(mocks.db.rpc).not.toHaveBeenCalled();
  });
  it("scopes customer history by authenticated profile and keeps unavailable reads explicit", async () => {
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.limit.mockResolvedValue({ data: null, error: { code: "503" } });
    mocks.db.from.mockReturnValue(query);
    const result = await GET(
      new Request("https://akiduermo.com/api/stays/bookings?action=history"),
    );
    expect(query.eq).toHaveBeenCalledWith("profile_id", id);
    expect(result.status).toBe(503);
    expect(await result.json()).toEqual({ error: "unavailable" });
  });
});
