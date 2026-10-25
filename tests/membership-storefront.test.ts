// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import * as React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { stayHostRoute } from "../src/lib/akiduermo-routing";
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/components/StayAppShell", () => ({
  StayAppShell: ({ children }: { children: React.ReactNode }) => children,
}));
import { headers } from "next/headers";
import StayMembershipPage from "../src/app/membership/page";
beforeEach(() => window.history.replaceState(null, "", "/membership"));
afterEach(cleanup);

describe("AkiDuermo audience-first membership", () => {
  const page = readFileSync("src/app/membership/page.tsx", "utf8");
  it("keeps native public routing and staged billing", () => {
    expect(stayHostRoute("/membership").kind).toBe("public");
    expect(page).toContain("AkiSuiteAudienceStudio");
    expect(page).not.toContain("startAkiSuiteCheckout");
    expect(page).not.toContain("AkiEnterprise");
    expect(page).toContain("<StayAppShell locale={locale}>");
  });
  for (const locale of ["en", "es"] as const) {
    it(`separates traveller and owner products in ${locale}`, async () => {
      vi.mocked(headers).mockResolvedValue(
        new Headers({ "x-akipasa-locale": locale }) as Awaited<
          ReturnType<typeof headers>
        >,
      );
      const { container } = render(await StayMembershipPage());
      expect(container.querySelectorAll("[data-offer]")).toHaveLength(2);
      expect(
        container.querySelector("#personal-premium button[disabled]"),
      ).not.toBeNull();
      expect(
        container.querySelector("#personal-premium")?.textContent,
      ).toContain(locale === "es" ? "1,99" : "€1.99");
      expect(container.querySelector("#akiduermo-listing-premium")).toBeNull();
      fireEvent.click(
        screen.getByRole("tab", {
          name: locale === "es" ? "Negocios" : "Business",
        }),
      );
      expect(container.querySelectorAll("[data-offer]")).toHaveLength(2);
      expect(container.querySelector("#akihq-free")).not.toBeNull();
      expect(
        container.querySelector("#akiduermo-listing-premium")?.textContent,
      ).toContain(locale === "es" ? "24,99" : "€24.99");
      expect(
        container.querySelector("#akiduermo-listing-premium")?.textContent,
      ).toContain(
        locale === "es"
          ? "AkiDuermo Premium (para empresas)"
          : "AkiDuermo Premium (for businesses)",
      );
      expect(
        container.querySelector('a[href*="akibusiness.com"]'),
      ).not.toBeNull();
      expect(container.querySelector("form")).toBeNull();
    });
  }
  it("uses the matching canonical audience studio in all discovery apps", () => {
    for (const [path, sha] of [
      [
        "src/components/AkiSuiteAudienceStudio.tsx",
        "949828873ce35fd5768d497c9ea86084bc732f3d",
      ],
      [
        "src/components/AkiSuiteAudienceStudio.module.css",
        "0bf1c16d123b5f7e7c93e228ef318083ef6b8a91",
      ],
    ] as const) {
      const b = readFileSync(path);
      expect(
        createHash("sha1")
          .update("blob " + b.length + "\0")
          .update(b)
          .digest("hex"),
      ).toBe(sha);
    }
  });
});
