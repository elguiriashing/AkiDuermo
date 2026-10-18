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
  it("shows local business and Enterprise plans but initiates no unverified charges", () => {
    for (const name of ["AkiDuermo Premium for Business", "AkiBusiness Standard", "AkiBusiness Pro", "AkiEnterprise"]) expect(page).toContain(name);
    expect(page).not.toContain("startAkiSuiteCheckout");
    expect(page).toContain("<StayAppShell locale={locale}>");
  });
});
