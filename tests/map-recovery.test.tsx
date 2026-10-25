// @vitest-environment jsdom
import React from "react";
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ map: vi.fn() }));
vi.mock("maplibre-gl", () => ({ Map: mocks.map }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@/lib/personalisation/client", () => ({ trackBehaviour: vi.fn() }));
import { ProductionMap } from "../src/components/ProductionMap";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("stay map recovery", () => {
  it.each(["en", "es"] as const)(
    "offers retry and the applied-filter catalogue in %s",
    async (locale) => {
      mocks.map.mockImplementation(function () {
        throw new Error("WebGL fixture unavailable");
      });
      const href = `/?${new URLSearchParams({ lang: locale, q: "Málaga & coast", type: "hotel" })}#stays`;
      render(
        <ProductionMap
          locale={locale}
          points={[]}
          styleUrl="https://example.test/style.json"
          center={{ latitude: 36.72, longitude: -4.42 }}
          initialVertical="accommodation"
          stayFilters={{ type: "hotel", q: "Málaga & coast" }}
          fallbackHref={href}
        />,
      );
      const browse = await screen.findByRole("link", {
        name: locale === "es" ? "Ver alojamientos" : "Browse stays",
      });
      expect(browse).toHaveAttribute("href", href);
      const attempts = mocks.map.mock.calls.length;
      fireEvent.click(
        screen.getByRole("button", {
          name: locale === "es" ? "Reintentar mapa" : "Retry map",
        }),
      );
      await waitFor(() =>
        expect(mocks.map.mock.calls.length).toBeGreaterThan(attempts),
      );
      await waitFor(() =>
        expect(
          screen.getByRole("button", {
            name: locale === "es" ? "Reintentar mapa" : "Retry map",
          }),
        ).toHaveFocus(),
      );
      expect(
        await screen.findByRole("link", {
          name: locale === "es" ? "Ver alojamientos" : "Browse stays",
        }),
      ).toHaveAttribute("href", href);
    },
  );
});
