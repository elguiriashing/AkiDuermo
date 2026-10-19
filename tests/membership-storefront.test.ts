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
      "AkiDuermo for Business",
      "AkiHQ",
      "AkiBusiness Standard",
      "AkiBusiness Plus",
      "AkiBusiness Pro",
      "AkiEnterprise",
    ])
      expect(page).toContain(name);
    for (const price of ["€14.99", "€24.99", "€44.99", "€64.99"])
      expect(page).toContain(price);
    expect(page).toContain("personalPremiumVisible");
    expect(page).not.toContain("startAkiSuiteCheckout");
    expect(page).toContain("<StayAppShell locale={locale}>");
  });
});
