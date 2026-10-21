import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("standalone AkiDuermo renter account", () => {
  const root = process.cwd();
  const page = readFileSync(join(root, "src/app/account/page.tsx"), "utf8");
  const css = readFileSync(
    join(root, "src/app/account/account.module.css"),
    "utf8",
  );

  it("scopes all reservation summaries to the authenticated customer", () => {
    expect(page).toContain("await requireUser(");
    expect(page).toMatch(
      /accountTaskFromSearch\(\s*"duermo",\s*locale,\s*"\/account"/,
    );
    expect((page.match(/\.eq\("profile_id", user\.id\)/g) || []).length).toBe(
      4,
    );
    expect(page).toContain('count: "exact",');
    expect(page).toContain("stayReservationStatusLabel(stay.status, locale)");
    expect(page).toContain("hasError");
  });

  it("preserves host-local logout and existing linked destinations", () => {
    expect(page).toContain("signOutStay");
    expect(page).toContain('suiteHref("hq", locale)');
    expect(page).toContain('suiteHref("business", locale)');
    expect(page).toContain("Manage my properties in AkiHQ");
    expect(page).toContain("Open operations in AkiBusiness");
    expect(page).toContain('"/settings?lang="');
    expect(page).toContain('"/saved?lang="');
    expect(page).toContain('"/bookings?lang="');
    expect(page).toContain("Favourites on this device");
    expect(page).not.toContain("saved.count");
  });

  it("is responsive, bilingual and theme-aware", () => {
    expect(page).toContain("Your next escape starts here.");
    expect(page).toContain("Tu próxima escapada empieza aquí.");
    expect(css).toContain("@media (max-width: 620px)");
    expect(css).toContain(':global(html[data-theme="light"])');
  });
});
