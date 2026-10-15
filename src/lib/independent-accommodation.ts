import { z } from "zod";

/** Enable only after coordinated schema/application acceptance; never infer readiness. */
export function independentAccommodationEnabled() {
  return process.env.AKISUITE_INDEPENDENT_ACCOMMODATION_ENABLED === "true";
}

// Public projections deliberately exclude owners, memberships and private contacts.
export const publicAccommodationSchema = z.object({
  id: z.string().uuid(),
  legacy_venue_id: z.string().uuid().nullable(),
  slug: z.string().min(1).max(300),
  name: z.string().min(1).max(300),
  address: z
    .string()
    .nullish()
    .transform((value) => value || ""),
  city: z
    .string()
    .nullish()
    .transform((value) => value || "España"),
  accommodation_type: z.string().nullish(),
  website_url: z
    .string()
    .nullish()
    .transform((value) => value || null),
  description_es: z
    .string()
    .nullish()
    .transform((value) => value || ""),
  description_en: z
    .string()
    .nullish()
    .transform((value) => value || ""),
  location: z.unknown().optional(),
  latitude: z.number().min(-90).max(90).nullish(),
  longitude: z.number().min(-180).max(180).nullish(),
  verified: z.boolean().optional(),
});
export const publicAccommodationListSchema = z.object({
  rows: z.array(publicAccommodationSchema).max(100),
  total: z.number().int().min(0),
});
