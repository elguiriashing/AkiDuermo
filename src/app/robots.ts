import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isCanonicalCrawlHost } from "@/lib/public-crawl";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") || "";
  if (!isCanonicalCrawlHost(host))
    return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/stays/", "/membership"],
      disallow: [
        "/account",
        "/api/",
        "/bookings",
        "/en/auth",
        "/es/auth",
        "/saved",
        "/settings",
        "/map",
        "/en/terms/accept",
        "/es/terms/accept",
      ],
    },
    sitemap: "https://akiduermo.com/sitemap.xml",
    host: "https://akiduermo.com",
  };
}
