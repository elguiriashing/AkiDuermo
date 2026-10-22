import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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
    expect(page).toContain("<StayAppShell locale={locale} wide>");
    const studio = readFileSync("src/components/AkiSuiteMembershipStudio.tsx", "utf8");
    expect(studio).toContain('"/brand/hq-mark.svg"');
    expect(studio).toContain('"/brand/business-mark.svg"');
    expect(studio).toContain("hqGroup");
    expect(studio).toContain("businessGroup");
    expect(page).toContain("AkiSuiteMembershipStudio");
    expect(page).not.toContain("cardBrand");
    const style = readFileSync("src/components/AkiSuiteMembershipStudio.module.css", "utf8");
    expect(style).toContain("grid-template-columns: repeat(5, minmax(0, 1fr))");
    expect(style).toContain("grid-column: 1 / span 2");
    expect(style).toContain("grid-column: 3 / span 3");
    expect(style).toContain("width: 1px");
    expect(style).toContain("overflow-x: auto");
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
    // Brand art must sit above GROUPS, never be repeated in individual cards.
    expect((html.match(/src="\/brand\/hq-mark.svg"/g) ?? [])).toHaveLength(1);
    expect((html.match(/src="\/brand\/business-mark.svg"/g) ?? [])).toHaveLength(1);
    for (const card of cards) expect(card).not.toContain("<img");
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
    expect(html).toContain(locale === "es" ? "gratis tu alojamiento en AkiDuermo" : "free AkiDuermo property listing");
    expect(html).toContain(locale === "es" ? "PARA AKIHQ" : "FOR AKIHQ");
    expect(html).toContain(locale === "es" ? "herramientas Premium de AkiDuermo" : "deluxe suite of AkiDuermo listing tools");
  });
}


describe("Canonical AkiSuite membership studio source parity", () => {
  it("uses the same reviewed template and stylesheet as all three discovery apps", () => {
    const expected = [
      ["src/components/AkiSuiteMembershipStudio.tsx", "28c8f7ee48d49ff91cad63c55e3aacaadfe3c28d"],
      ["src/components/AkiSuiteMembershipStudio.module.css", "4b42977034d6a285fd355e7afcb72583779b5862"],
    ] as const;
    for (const [path, sha] of expected) {
      const content = readFileSync(path);
      const gitBlobSha = createHash("sha1")
        .update("blob " + content.length + "\0")
        .update(content)
        .digest("hex");
      expect(gitBlobSha, path).toBe(sha);
    }
  });
});
