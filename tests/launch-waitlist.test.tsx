// @vitest-environment jsdom
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LaunchWaitlist } from "../src/components/LaunchWaitlist";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span data-testid="brand-image">{alt}</span>,
}));
vi.mock("next/script", () => ({ default: () => null }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("under-development launch form", () => {
  it("does not claim registrations work without a configured Turnstile site", () => {
    render(<LaunchWaitlist product="duermo" locale="es" siteKey={null} />);
    expect(screen.getByText(/Aún no aceptamos reservas/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Avisadme del lanzamiento" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByText(/formulario aún no está activo/)).toBeTruthy();
  });

  it("keeps launch consent required and marketing optional and unchecked", () => {
    render(<LaunchWaitlist product="coches" locale="en" siteKey="test-sitekey" />);
    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes).toHaveLength(2);
    expect(boxes[0].required).toBe(true);
    expect(boxes[1].required).toBe(false);
    expect(boxes[0].checked).toBe(false);
    expect(boxes[1].checked).toBe(false);
    expect(screen.getByText(/Bookings are not open here yet/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /rental business/i }).getAttribute("href")).toContain("/hq-login");
  });

  it("submits only explicit consents, product and a Turnstile response to central API", async () => {
    const sender = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ ok: true, status: "check_email" }, { status: 202 }),
    );
    vi.stubGlobal("fetch", sender);
    render(<LaunchWaitlist product="duermo" locale="en" siteKey="test-sitekey" />);
    const form = screen.getByRole("button", { name: "Notify me at launch" }).closest("form")!;
    const fill = (name: string, value: string) =>
      fireEvent.change(form.elements.namedItem(name)!, { target: { value } });
    fill("fullName", "Example Traveller");
    fill("email", "example@example.com");
    fill("city", "Fuengirola");
    const response = document.createElement("input");
    response.type = "hidden";
    response.name = "cf-turnstile-response";
    response.value = "valid-test-token";
    form.appendChild(response);
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    fireEvent.submit(form);
    await waitFor(() => expect(sender).toHaveBeenCalledOnce());
    const [url, init] = sender.mock.calls[0];
    expect(url).toBe("https://akipasa.com/api/launch-waitlist");
    expect(init?.credentials).toBe("omit");
    const payload = JSON.parse(String(init?.body));
    expect(payload).toMatchObject({
      product: "duermo",
      locale: "en",
      fullName: "Example Traveller",
      email: "example@example.com",
      city: "Fuengirola",
      launchConsent: true,
      marketingConsent: false,
      turnstileToken: "valid-test-token",
    });
    await waitFor(() =>
      expect(screen.getByText(/Check your inbox/)).toBeTruthy(),
    );
  });
});
