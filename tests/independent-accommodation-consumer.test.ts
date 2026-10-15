import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { independentAccommodationEnabled } from "../src/lib/independent-accommodation";
const mocks = vi.hoisted(() => ({
  db: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: { getUser: vi.fn() },
    storage: { from: vi.fn() },
  },
}));
vi.mock("../src/lib/supabase/public", () => ({
  createSupabasePublicClient: () => mocks.db,
}));
vi.mock("../src/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mocks.db,
}));
vi.mock("../src/lib/feature-flags", () => ({
  loadFeatureFlags: async () => ({ venue_relevance: true }),
}));
import { GET as catalogue } from "../src/app/api/stays/route";
import { GET as viewport } from "../src/app/api/map/stays/route";
import { GET as mapDetail } from "../src/app/api/map/venue/[id]/route";
import { GET as bookings } from "../src/app/api/stays/bookings/route";
import { GET as saved, POST as save } from "../src/app/api/stays/saved/route";
import { loadStayDetail } from "../src/lib/stay-detail";
const id = "00000000-0000-4000-8000-000000000001";
const legacyId = "00000000-0000-4000-8000-000000000002";
const property = {
  id,
  legacy_venue_id: null,
  slug: `stay-${id}`,
  name: "Independent stay",
  address: "Controlled fixture address",
  city: "Málaga",
  accommodation_type: "hotel",
  website_url: null,
  description_es: "Descripción",
  description_en: "Description",
  longitude: -4.4,
  latitude: 36.7,
};
type Result = { data: unknown; error: null | { message: string } };
function chain(result: Result) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    not: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    range: vi.fn(),
    maybeSingle: vi.fn(),
    then: (resolve: (value: Result) => unknown) =>
      Promise.resolve(result).then(resolve),
  };
  for (const [key, method] of Object.entries(query))
    if (key !== "then")
      (method as ReturnType<typeof vi.fn>).mockReturnValue(query);
  return query;
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AKISUITE_INDEPENDENT_ACCOMMODATION_ENABLED", "true");
  mocks.db.auth.getUser.mockResolvedValue({ data: { user: { id: "caller" } } });
  mocks.db.from.mockReturnValue(chain({ data: [], error: null }));
  mocks.db.rpc.mockImplementation(async (name: string) => ({
    data:
      name === "accommodation_public_properties"
        ? { rows: [property], total: 1 }
        : name === "accommodation_property_by_slug" ||
            name === "accommodation_property_public"
          ? property
          : name === "accommodation_public_settings"
            ? { mode: "request" }
            : [],
    error: null,
  }));
});
afterEach(() => vi.unstubAllEnvs());
it.each([undefined, "false", "TRUE", "1"])(
  "requires exacttrue readiness (%s)",
  (flag) => {
    vi.stubEnv("AKISUITE_INDEPENDENT_ACCOMMODATION_ENABLED", flag);
    expect(independentAccommodationEnabled()).toBe(false);
  },
);
it("uses one combined paginated catalogue with preserved legacy IDs", async () => {
  mocks.db.rpc.mockResolvedValue({
    data: {
      rows: [
        property,
        {
          ...property,
          id: legacyId,
          legacy_venue_id: legacyId,
          slug: "legacy-stay",
        },
      ],
      total: 37,
    },
    error: null,
  });
  const response = await catalogue(
    new Request("https://akiduermo.com/api/stays?q=Málaga&type=hotel&page=2"),
  );
  expect(response.status).toBe(200);
  expect(mocks.db.rpc).toHaveBeenCalledWith("accommodation_public_properties", {
    p_search: "Málaga",
    p_type: "hotel",
    p_limit: 12,
    p_offset: 12,
  });
  expect(mocks.db.from).not.toHaveBeenCalled();
  expect(await response.json()).toMatchObject({
    rows: [{ id, city: "Málaga" }, { id: legacyId }],
    total: 37,
    page: 2,
  });
});
it.each([
  null,
  { rows: [{ ...property, legacy_venue_id: "invalid" }], total: 1 },
])("fails closed on incomplete union responses", async (data) => {
  mocks.db.rpc.mockResolvedValue({ data, error: null });
  expect(
    (await catalogue(new Request("https://akiduermo.com/api/stays"))).status,
  ).toBe(503);
  expect(mocks.db.from).not.toHaveBeenCalled();
});
it("passes canonical property identity to unchanged availability RPC", async () => {
  mocks.db.rpc.mockImplementation(async (name: string) => ({
    data:
      name === "accommodation_public_properties"
        ? { rows: [property], total: 1 }
        : [{ room_type_id: "room" }],
    error: null,
  }));
  const response = await catalogue(
    new Request(
      "https://akiduermo.com/api/stays?checkIn=2026-11-10&checkOut=2026-11-12&guests=2",
    ),
  );
  expect(response.status).toBe(200);
  expect(mocks.db.rpc).toHaveBeenCalledWith("accommodation_available_rooms", {
    p_venue: id,
    p_in: "2026-11-10",
    p_out: "2026-11-12",
    p_guests: 2,
  });
});
it("loads only explicitly selected independent media from the private property bucket", async () => {
  const media = chain({
    data: [
      {
        id: "photo",
        storage_path: `${id}/photo.webp`,
        public_position: 0,
        alt_text: "Controlled room",
      },
    ],
    error: null,
  });
  mocks.db.from.mockReturnValue(media);
  const createSignedUrl = vi
    .fn()
    .mockResolvedValue({
      data: { signedUrl: "https://example.invalid/signed-photo" },
      error: null,
    });
  mocks.db.storage.from.mockReturnValue({ createSignedUrl });
  const detail = await loadStayDetail(property.slug);
  expect(detail).toMatchObject({
    id,
    latitude: 36.7,
    longitude: -4.4,
    bookingMode: "request",
    photos: [{ altEn: "Controlled room" }],
  });
  expect(mocks.db.from).toHaveBeenCalledWith("accommodation_property_media");
  expect(media.eq).toHaveBeenCalledWith("property_id", id);
  expect(media.not).toHaveBeenCalledWith("public_position", "is", null);
  expect(mocks.db.storage.from).toHaveBeenCalledWith("accommodation-media");
  expect(mocks.db.rpc).toHaveBeenCalledWith("accommodation_public_settings", {
    p_venue: id,
  });
});
it("keeps legacy header media queries when union detail maps to an existing venue", async () => {
  mocks.db.rpc.mockResolvedValue({
    data: { ...property, legacy_venue_id: id },
    error: null,
  });
  await loadStayDetail("legacy-stay");
  expect(mocks.db.from).toHaveBeenCalledWith("venue_media_placements");
  expect(mocks.db.from).not.toHaveBeenCalledWith(
    "accommodation_property_media",
  );
});
it("returns no detail for unpublished or ambiguous slug projections", async () => {
  mocks.db.rpc.mockResolvedValue({ data: null, error: null });
  expect(await loadStayDetail(property.slug)).toBeNull();
  expect(mocks.db.from).not.toHaveBeenCalled();
});
it("does not sign photos assigned to another property", async () => {
  mocks.db.from.mockReturnValue(
    chain({ data: [{ storage_path: `${legacyId}/photo.webp` }], error: null }),
  );
  await expect(loadStayDetail(property.slug)).rejects.toThrow(
    "Invalid accommodation photo",
  );
  expect(mocks.db.storage.from).not.toHaveBeenCalled();
});
it("uses the coordinated viewport and marks independent popup identity", async () => {
  const response = await viewport(
    new Request(
      "https://akiduermo.com/api/map/stays?west=-5&east=-4&south=36&north=37",
    ),
  );
  expect(response.status).toBe(200);
  expect(mocks.db.rpc).toHaveBeenCalledWith("accommodation_public_viewport", {
    p_west: -5,
    p_east: -4,
    p_south: 36,
    p_north: 37,
    p_type: "all",
    p_query: "",
  });
  expect(
    await (
      await mapDetail(new Request("https://akiduermo.com"), {
        params: Promise.resolve({ id }),
      })
    ).json(),
  ).toMatchObject({
    id,
    independentProperty: true,
    discoveryVertical: "accommodation",
  });
});
it("reads canonical history and saved IDs without reassigning legacy records", async () => {
  const query = chain({
    data: [{ property_id: id, venue_id: null }],
    error: null,
  });
  mocks.db.from.mockReturnValue(query);
  await bookings(
    new Request("https://akiduermo.com/api/stays/bookings?action=history"),
  );
  expect(query.select).toHaveBeenCalledWith(
    expect.stringContaining("property_id"),
  );
  expect(query.eq).toHaveBeenCalledWith("profile_id", "caller");
  const response = await saved();
  expect(await response.json()).toMatchObject({ savedIds: [id] });
  expect(query.select).toHaveBeenCalledWith("property_id");
  await save(
    new Request("https://akiduermo.com/api/stays/saved", {
      method: "POST",
      headers: { Origin: "https://akiduermo.com" },
      body: JSON.stringify({
        action: "set-saved",
        venueId: id,
        saved: true,
        locale: "en",
      }),
    }),
  );
  expect(mocks.db.rpc).toHaveBeenCalledWith("suite_save_stay", {
    p_venue: id,
    p_saved: true,
    p_locale: "en",
  });
});
