// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  act,
  within,
} from "@testing-library/react";
import { DiscoveryNavigation } from "../src/components/DiscoveryNavigation";
import { AkiSuiteAudienceStudio } from "../src/components/AkiSuiteAudienceStudio";
const navigation = vi.hoisted(() => ({ path: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.path }));
beforeEach(() => {
  vi.stubGlobal("React", React);
  navigation.path = "/";
  localStorage.clear();
  window.history.replaceState({ marker: "keep" }, "", "/");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
describe("shared discovery shell", () => {
  it("keeps all Duermo destinations local and selects settings as Account", () => {
    navigation.path = "/settings";
    render(<DiscoveryNavigation locale="es" product="duermo" />);
    expect(
      within(
        screen.getByRole("navigation", { name: "Navegación de AkiDuermo" }),
      )
        .getAllByRole("link")
        .map((x) => x.getAttribute("href")),
    ).toEqual([
      "/?lang=es",
      "/map?lang=es",
      "/saved?lang=es",
      "/bookings?lang=es",
      "/account?lang=es",
    ]);
    expect(
      screen.getByRole("link", { name: "Cuenta" }).getAttribute("aria-current"),
    ).toBe("page");
  });
  it("keeps the rental membership and bookings reachable in the same shell", () => {
    navigation.path = "/membership";
    render(<DiscoveryNavigation locale="en" product="coches" />);
    expect(
      screen
        .getByRole("link", { name: "Membership" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(
      screen.getByRole("link", { name: "Bookings" }).getAttribute("href"),
    ).toBe("/bookings?lang=en");
  });
  it("retains collapse state, brands the rail and orders footer controls like Pasa", () => {
    const language = vi.fn();
    const view = render(
      <DiscoveryNavigation
        locale="en"
        product="coches"
        onLanguageChange={language}
      />,
    );
    const rail = screen.getByRole("complementary", {
      name: "Primary navigation",
    });
    expect(rail.getAttribute("data-compact")).toBe("false");
    expect(
      rail.querySelector(".suite-discovery-brand img")?.getAttribute("src"),
    ).toBe("/brand/v3/coches.svg");
    const footer = rail.querySelector(".suite-discovery-footer")!;
    expect([...footer.children].map((node) => node.className)).toEqual([
      "suite-discovery-menu",
      "suite-discovery-signin",
      "suite-discovery-tools",
      "suite-discovery-collapse",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar a español" }));
    expect(language).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(rail.getAttribute("data-compact")).toBe("true");
    expect(localStorage.getItem("akicoches.sidebar.collapsed")).toBe("1");
    view.unmount();
    render(<DiscoveryNavigation locale="en" product="coches" />);
    expect(
      screen
        .getByRole("complementary", { name: "Primary navigation" })
        .getAttribute("data-compact"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Expand sidebar" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
const offer = (id: string) => ({
  id,
  label: id,
  name: id,
  description: id,
  price: "Free",
  benefits: [],
  action: <button type="button">Explore</button>,
});
const studio = () => (
  <AkiSuiteAudienceStudio
    locale="en"
    theme="coral"
    product="AkiCoches"
    eyebrow="Plans"
    title="Choose a plan"
    description="Choose"
    individual={[offer("personal-free"), offer("personal-paid")]}
    business={[offer("business-free"), offer("business-paid")]}
    businessSoftwareHref="https://akibusiness.com"
  />
);
describe("membership audience continuity", () => {
  it("restores Business from the HQ handoff while preserving other context", () => {
    window.history.replaceState(
      { marker: "keep" },
      "",
      "/membership?lang=en&audience=business&ref=ABCDEFGH",
    );
    render(studio());
    expect(
      screen
        .getByRole("tab", { name: "Business" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("tab", { name: "Individual" }));
    expect(new URLSearchParams(window.location.search).get("audience")).toBe(
      "individual",
    );
    expect(new URLSearchParams(window.location.search).get("ref")).toBe(
      "ABCDEFGH",
    );
    expect(window.history.state).toEqual({ marker: "keep" });
  });
  it("restores the selection when browser history changes", () => {
    render(studio());
    act(() => {
      window.history.replaceState(null, "", "/membership?audience=business");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(
      screen
        .getByRole("tab", { name: "Business" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });
  it("does not accept ambiguous duplicate audience values", () => {
    window.history.replaceState(
      null,
      "",
      "/membership?audience=business&audience=individual",
    );
    render(studio());
    expect(
      screen
        .getByRole("tab", { name: "Individual" })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });
});
