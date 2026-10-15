import {
  independentAccommodationEnabled,
  publicAccommodationSchema,
} from "./independent-accommodation";
import { parseDatabasePoint } from "./repository";
import { cache } from "react";
import { createSupabaseServerClient } from "./supabase/server";
import { createSupabasePublicClient } from "./supabase/public";
import { cleanStayName, safePropertyWebsite, type Stay } from "./akiduermo";
import { normalizeAddressLabel } from "./maps";
export type StayDetail = Stay & {
  latitude?: number;
  longitude?: number;
  descriptionEs: string;
  descriptionEn: string;
  photos: { url: string; altEs: string; altEn: string }[];
  bookingMode?: "disabled" | "external" | "request";
  bookingUrl?: string;
};
export const loadStayDetail = cache(
  async (slug: string): Promise<StayDetail | null> => {
    if (!slug || slug.length > 300) return null;
    const independent = independentAccommodationEnabled();
    const client = independent
      ? await createSupabaseServerClient()
      : createSupabasePublicClient();
    const result = independent
      ? await client.rpc("accommodation_property_by_slug", { p_slug: slug })
      : await client
          .from("venues")
          .select(
            "id,slug,name,address,location,description_es,description_en,accommodation_type,website_url,cities(name_es)",
          )
          .eq("slug", slug)
          .eq("status", "published")
          .eq("discovery_vertical", "accommodation")
          .maybeSingle();
    if (result.error)
      throw new Error("Accommodation is temporarily unavailable");
    if (!result.data) return null;
    const projection = independent
      ? publicAccommodationSchema.safeParse(result.data)
      : null;
    if (projection && !projection.success)
      throw new Error("Accommodation is temporarily unavailable");
    const data = projection?.success
      ? { ...projection.data, cities: { name_es: projection.data.city } }
      : result.data;
    const independentProperty = independent && data.legacy_venue_id === null;
    const { data: booking } = await client.rpc(
      "accommodation_public_settings",
      { p_venue: data.id },
    );
    const photos = independentProperty
      ? await (async () => {
          const { data: media, error } = await client
            .from("accommodation_property_media")
            .select("id,storage_path,alt_text,public_position")
            .eq("property_id", data.id)
            .not("public_position", "is", null)
            .order("public_position")
            .limit(12);
          if (error)
            throw new Error("Accommodation photos are temporarily unavailable");
          return await Promise.all(
            (media || []).map(async (photo) => {
              if (!photo.storage_path.startsWith(`${data.id}/`))
                throw new Error("Invalid accommodation photo");
              const { data: signed, error: signError } = await client.storage
                .from("accommodation-media")
                .createSignedUrl(photo.storage_path, 3600);
              if (signError || !signed?.signedUrl)
                throw new Error(
                  "Accommodation photos are temporarily unavailable",
                );
              return {
                url: signed.signedUrl,
                altEs: photo.alt_text || data.name,
                altEn: photo.alt_text || data.name,
              };
            }),
          );
        })()
      : await (async () => {
          // Only images explicitly assigned to the accommodation header are public.
          // The private management bin and five surface selections are independent.
          const { data: headerPlacements, error: placementError } = await client
            .from("venue_media_placements")
            .select("media_id,sort_order")
            .eq("venue_id", data.id)
            .eq("placement", "venue_gallery")
            .eq("target_key", "stay_header")
            .order("sort_order")
            .limit(12);
          if (placementError)
            throw new Error("Accommodation photos are temporarily unavailable");
          const orderedIds = (headerPlacements || []).map(
            (item) => item.media_id,
          );
          const { data: media, error: mediaError } = orderedIds.length
            ? await client
                .from("venue_media")
                .select("id,storage_path,alt_es,alt_en")
                .eq("venue_id", data.id)
                .in("id", orderedIds)
            : { data: [], error: null };
          if (mediaError)
            throw new Error("Accommodation photos are temporarily unavailable");
          const mediaById = new Map(
            (media || []).map((item) => [item.id, item]),
          );
          return (
            await Promise.all(
              orderedIds.map(async (id) => {
                const photo = mediaById.get(id);
                if (!photo) return null;
                const { data: signed } = await client.storage
                  .from("event-media")
                  .createSignedUrl(photo.storage_path, 3600);
                return signed?.signedUrl
                  ? {
                      url: signed.signedUrl,
                      altEs: photo.alt_es || data.name,
                      altEn: photo.alt_en || photo.alt_es || data.name,
                    }
                  : null;
              }),
            )
          ).filter(
            (photo): photo is NonNullable<typeof photo> => photo !== null,
          );
        })();
    return {
      ...parseDatabasePoint(data.location),
      ...(typeof data.latitude === "number" &&
      typeof data.longitude === "number"
        ? { latitude: data.latitude, longitude: data.longitude }
        : {}),
      id: data.id,
      slug: data.slug,
      name: cleanStayName(data.name),
      address: normalizeAddressLabel(data.address || ""),
      accommodationType: data.accommodation_type || "hotel",
      website: safePropertyWebsite(data.website_url),
      city:
        (Array.isArray(data.cities) ? data.cities[0] : data.cities)?.name_es ||
        "España",
      descriptionEs: data.description_es || "",
      descriptionEn: data.description_en || "",
      photos,
      bookingMode: booking?.mode || "disabled",
      bookingUrl: safePropertyWebsite(booking?.external_url) || undefined,
    };
  },
);
