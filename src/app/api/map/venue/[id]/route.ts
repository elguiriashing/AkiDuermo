import {
  independentAccommodationEnabled,
  publicAccommodationSchema,
} from "@/lib/independent-accommodation";
import { z } from "zod";
import { normalizeAddressLabel } from "@/lib/maps";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const parsed = z
    .string()
    .uuid()
    .safeParse((await context.params).id);
  if (!parsed.success)
    return Response.json({ error: "Invalid venue" }, { status: 400 });
  const db = createSupabasePublicClient();
  const independent = independentAccommodationEnabled();
  const result = independent
    ? await db.rpc("accommodation_property_public", { p_property: parsed.data })
    : await db
        .from("venues")
        .select("id,slug,name,address,accessibility,discovery_vertical")
        .eq("id", parsed.data)
        .eq("status", "published")
        .maybeSingle();
  const { error } = result;
  const projection =
    independent && result.data
      ? publicAccommodationSchema.safeParse(result.data)
      : null;
  if (projection && !projection.success)
    return Response.json(
      { error: "Stay temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  const data = independent
    ? projection?.success
      ? {
          ...projection.data,
          discovery_vertical: "accommodation",
          accessibility: null,
        }
      : null
    : result.data;
  if (error)
    return Response.json(
      { error: "Venue temporarily unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  if (!data)
    return Response.json(
      { error: "Venue no longer available" },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  return Response.json(
    {
      id: data.id,
      slug: data.slug,
      name: data.name,
      address: data.address
        ? normalizeAddressLabel(data.address)
        : data.address,
      discoveryVertical: data.discovery_vertical,
      independentProperty: independent && data.legacy_venue_id === null,
      claimStatus:
        data.accessibility?.claim_status === "unclaimed"
          ? "unclaimed"
          : "claimed",
    },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } },
  );
}
