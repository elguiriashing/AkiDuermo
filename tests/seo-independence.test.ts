import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: "akiduermo.com" }),
}));
import robots from "../src/app/robots";
import { languageUrls, siteOrigin } from "../src/lib/seo";

describe("independent AkiDuermo SEO", () => {
  it("publishes its own sitemap while keeping private journeys out of crawl", async () => {
    const policy = await robots();
    expect(policy.host).toBe("https://akiduermo.com");
    expect(policy.sitemap).toBe("https://akiduermo.com/sitemap.xml");
    expect(JSON.stringify(policy.rules)).toContain("/stays/");
    for (const route of ["/account", "/api/", "/bookings", "/saved"]) {
      expect(JSON.stringify(policy.rules)).toContain(route);
    }
  });

  it("uses only canonical AkiDuermo URLs in sitemap source", () => {
    const source = readFileSync("src/app/sitemap.ts", "utf8");
    expect(source).toContain('"https://akiduermo.com"');
    expect(source).toContain('"accommodation"');
    expect(source).not.toContain("akipasa.com");
  });

  it("keeps shared metadata helpers on the independent canonical origin", () => {
    expect(siteOrigin).toBe("https://akiduermo.com");
    expect(languageUrls("/privacy")).toEqual({
      es: "https://akiduermo.com/es/privacy",
      en: "https://akiduermo.com/en/privacy",
      "x-default": "https://akiduermo.com/es/privacy",
    });
  });

  it("registers the PWA only on the canonical AkiDuermo production host", () => {
    const source = readFileSync("src/components/PwaRegistration.tsx", "utf8");
    expect(source).toContain('window.location.hostname === "akiduermo.com"');
    expect(source).not.toContain('window.location.hostname === "akipasa.com"');
    expect(source).not.toContain("business.akipasa.com");
    expect(source).not.toContain("akiconduzco.akipasa.com");
  });

  it("keeps generic privacy and terms journeys on AkiDuermo", () => {
    for (const component of ["AkiDuermo.tsx", "StayProperty.tsx"]) {
      const source = readFileSync(`src/components/${component}`, "utf8");
      expect(source).toContain("/${locale}/privacy");
      expect(source).toContain("/${locale}/terms");
      expect(source).not.toContain("akipasa.com/${locale}/privacy");
      expect(source).not.toContain("akipasa.com/${locale}/terms");
    }
    for (const route of ["privacy", "terms"]) {
      const source = readFileSync(`src/app/[locale]/${route}/page.tsx`, "utf8");
      expect(source).toContain("https://akiduermo.com/");
    }
  });
});
