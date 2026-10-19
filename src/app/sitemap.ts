import type { MetadataRoute } from "next";
import { createSupabasePublicClient } from "@/lib/supabase/public";

export const revalidate = 21_600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = "https://akiduermo.com";
  const routes: MetadataRoute.Sitemap = [
    { url: origin, changeFrequency: "daily", priority: 1 },
    {
      url: origin + "/membership",
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...(["en", "es"] as const).flatMap((locale) => [
      {
        url: `${origin}/${locale}/privacy`,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      },
      {
        url: `${origin}/${locale}/terms`,
        changeFrequency: "monthly" as const,
        priority: 0.3,
      },
    ]),
  ];
  try {
    const supabase = createSupabasePublicClient();
    const pageSize = 1_000;
    for (let page = 0; page < 30; page += 1) {
      const { data, error } = await supabase
        .from("venues")
        .select("slug,updated_at")
        .eq("status", "published")
        .eq("discovery_vertical", "accommodation")
        .order("id")
        .range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;
      for (const stay of data || []) {
        if (!stay.slug) continue;
        routes.push({
          url: origin + "/stays/" + encodeURIComponent(stay.slug),
          lastModified: stay.updated_at || undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      if (!data || data.length < pageSize) break;
    }
  } catch {
    // A provider outage must not remove the canonical static sitemap entries.
  }
  return routes;
}
