import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { stayHostRoute } from "../src/lib/akiduermo-routing";

describe("AkiDuermo native membership release", () => {
  const page = readFileSync("src/app/membership/page.tsx", "utf8");
  const middleware = readFileSync("src/middleware.ts", "utf8");
  const account = readFileSync("src/app/account/page.tsx", "utf8");
  it("serves membership locally and preserves billing redirect segregation", () => {
    expect(stayHostRoute("/membership").kind).toBe("public");
    expect(middleware).toContain('membership[2] === "membership"');
    expect(middleware).toContain('membership[2] !== "membership"');
    expect(account).toContain('href="/membership"');
  });
  it("shows the accurate local AkiDuermo catalogue without unverified checkout", () => {
    for (const name of [
      "AkiDuermo Premium",
      "AkiHQ",
      "AkiBusiness Standard",
      "AkiBusiness Plus",
      "AkiBusiness Pro",
    ])
      expect(page).toContain(name);
    for (const price of ["€14.99", "€24.99", "€44.99", "€64.99"])
      expect(page).toContain(price);
    expect(page).toContain("4 of 12 tools");
    expect(page).toContain("8 of 12 tools");
    expect(page).toContain("All 12 tools");
    expect(page).not.toContain("AkiEnterprise");
    expect(page).not.toContain("personalPremiumVisible");
    expect(page).not.toContain("startAkiSuiteCheckout");
    expect(page).toContain("<StayAppShell locale={locale}>");
  });
});

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/components/StayAppShell", () => ({
  StayAppShell: ({ children }: { children: React.ReactNode }) => children,
}));
import * as React from "react";
import { vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { headers } from "next/headers";
import StayMembershipPage from "../src/app/membership/page";

for (const locale of ["en", "es"] as const) {
  it(`renders five distinct approved monthly cards in ${locale}`, async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-akipasa-locale": locale }) as Awaited<
        ReturnType<typeof headers>
      >,
    );
    const html = renderToStaticMarkup(await StayMembershipPage());
    const cards = html.match(/<article\b[\s\S]*?<\/article>/g) ?? [];
    expect(cards).toHaveLength(5);
    for (const [name, price, tools, replacements] of [
      ["Standard", "€24.99", locale === "es" ? "4 de 12" : "4 of 12", "1"],
      ["Plus", "€44.99", locale === "es" ? "8 de 12" : "8 of 12", "2"],
      [
        "Pro",
        "€64.99",
        locale === "es" ? "Las 12" : "All 12",
        locale === "es" ? "sin límite" : "Unrestricted",
      ],
    ]) {
      const card = cards.find((value) => value.includes(`AkiBusiness ${name}`));
      expect(card).toContain(price);
      expect(card).toContain(tools);
      expect(card).toContain(replacements);
      expect(card?.replace(/<[^>]+>/g, "")).not.toMatch(
        /239\.90|431\.90|623\.90|20\s?%|yearly|al año/,
      );
    }
    expect(html).not.toMatch(/Most popular|Más elegido|20\s?%/);
    expect(html).toContain(locale === "es" ? "8 herramientas" : "8 tools");
    expect(html).toContain(
      locale === "es" ? "rotación mensual" : "monthly rotation",
    );
    expect(html).toContain(locale === "es" ? "al instante" : "instantly");
    expect(html).toContain(`https://akibusiness.com/?locale=${locale}`);
  });
}
