import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
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
      ],
    },
    sitemap: "https://akiduermo.com/sitemap.xml",
    host: "https://akiduermo.com",
  };
}
