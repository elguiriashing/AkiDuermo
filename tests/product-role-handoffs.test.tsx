// @vitest-environment jsdom
import React, { type ReactNode } from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveProductRoles } from "../src/lib/product-roles";
import manifest from "../src/app/manifest";

const state = vi.hoisted(() => ({ locale: "en" }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-akipasa-locale": state.locale }),
}));
vi.mock("@/lib/auth", () => ({
  requireUser: async () => ({ user: { email: "fixture@example.invalid" } }),
}));
vi.mock("@/lib/suite-welcome", () => ({
  queueSuitePortalWelcome: async () => {},
}));
vi.mock("../src/app/account/actions", () => ({ signOutStay: async () => {} }));
vi.mock("@/components/StayAppShell", () => ({
  StayAppShell: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("../src/components/LanguageLink", () => ({ LanguageLink: () => null }));
vi.mock("../src/components/ThemeModeControls", () => ({
  ThemeToggle: () => null,
}));
vi.mock("../src/components/PortalLogo", () => ({
  PortalLogo: ({ product }: { product: string }) => <span>{product}</span>,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("coordinated product roles", () => {
  it.each([undefined, "false", "TRUE", "1"])(
    "preserves legacy roles unless exactly true (%s)",
    (roleSwap) => {
      expect(resolveProductRoles({ roleSwap }).managementName).toBe(
        "AkiBusiness",
      );
      expect(resolveProductRoles({ roleSwap }).operationsUrl).toBe(
        "https://akihq.app",
      );
    },
  );
  it("maps known legacy canonical overrides only after cutover", () => {
    expect(
      resolveProductRoles({
        roleSwap: "true",
        managementUrl: "https://akibusiness.com/",
        operationsUrl: "https://akihq.app",
      }),
    ).toMatchObject({
      managementName: "AkiHQ",
      managementUrl: "https://akihq.app",
      operationsName: "AkiBusiness",
      operationsUrl: "https://akibusiness.com",
    });
  });
  it("preserves explicit isolated preview origins", () => {
    expect(
      resolveProductRoles({
        roleSwap: "true",
        managementUrl: "https://management.example.com",
        operationsUrl: "https://operations.example.com",
      }),
    ).toMatchObject({
      managementUrl: "https://management.example.com",
      operationsUrl: "https://operations.example.com",
    });
  });
  it.each([
    "https://user:password@example.com",
    "https://example.com/?token=secret",
    "https://example.com/#access_token=secret",
    "javascript:alert(1)",
    "https://example.com/path",
    "http://example.com",
  ])("rejects credential-bearing or non-origin config %s", (managementUrl) => {
    expect(
      resolveProductRoles({ roleSwap: "true", managementUrl }).managementUrl,
    ).toBe("https://akihq.app");
  });
  for (const swapped of [false, true])
    for (const locale of ["en", "es"]) {
      it(`renders management and operations handoffs ${locale} swapped=${swapped}`, async () => {
        state.locale = locale;
        vi.stubEnv("NEXT_PUBLIC_AKISUITE_ROLE_SWAP", String(swapped));
        vi.stubEnv("NEXT_PUBLIC_BUSINESS_URL", "https://akibusiness.com");
        vi.stubEnv("NEXT_PUBLIC_CRM_URL", "https://akihq.app");
        vi.resetModules();
        const { default: Account } = await import("../src/app/account/page");
        const { PortalHeaderTools } = await import(
          "../src/components/PortalHeaderTools"
        );
        const management = swapped ? "AkiHQ" : "AkiBusiness";
        const managementOrigin = swapped
          ? "https://akihq.app"
          : "https://akibusiness.com";
        const operations = swapped ? "AkiBusiness" : "AkiHQ";
        render(await Account());
        expect(
          screen.getByRole("link", {
            name: new RegExp(
              `${locale === "es" ? "Gestionar mis alojamientos en" : "Manage my properties in"} ${management}`,
            ),
          }),
        ).toHaveAttribute("href", `${managementOrigin}/${locale}/business`);
        cleanup();
        render(
          <PortalHeaderTools locale={locale as "en" | "es"} product="duermo" />,
        );
        expect(
          screen.getByRole("link", { name: management, hidden: true }),
        ).toHaveAttribute("href", `${managementOrigin}/${locale}/business`);
        expect(
          screen.getByRole("link", { name: operations, hidden: true }),
        ).toHaveAttribute(
          "href",
          swapped ? "https://akibusiness.com" : "https://akihq.app",
        );
      });
    }
  it("keeps the accommodation PWA identity and launch route", () => {
    expect(manifest()).toMatchObject({
      name: "AkiDuermo",
      id: "/akiduermo",
      start_url: "/",
      scope: "/",
    });
    expect(
      manifest().icons?.every((icon) => icon.src.startsWith("/pwa/duermo-")),
    ).toBe(true);
  });
});
