import { expect, test } from "@playwright/test";
const room = "00000000-0000-4000-8000-000000000004";
const quote = "00000000-0000-4000-8000-000000000005";
const reservation = "00000000-0000-4000-8000-000000000006";
for (const locale of ["en", "es"] as const)
  for (const width of [390, 1280])
    test(`synthetic stay request and cancellation ${locale} ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      const mutations: Record<string, unknown>[] = [];
      await page.route("**/api/stays/bookings*", async (route) => {
        if (route.request().method() === "GET")
          return route.fulfill({
            json: {
              rooms: [
                {
                  room_type_id: room,
                  room_name: "Synthetic room",
                  total_cents: 12345,
                  nights: 2,
                  available: 1,
                  policy: "Synthetic policy",
                },
              ],
            },
          });
        const body = route.request().postDataJSON();
        mutations.push(body);
        return route.fulfill({
          json: {
            result:
              body.action === "quote"
                ? {
                    id: quote,
                    expires_at: "2027-01-01T00:00:00Z",
                    snapshot: {
                      room_type_id: room,
                      room_name: "Synthetic room",
                      total_cents: 12345,
                      nights: 2,
                      available: 1,
                      policy: "Synthetic policy",
                    },
                  }
                : body.action === "request"
                  ? reservation
                  : true,
          },
        });
      });
      await page.goto(`/stays/fixture-stay?lang=${locale}`, {
        waitUntil: "domcontentloaded",
      });
      await expect(
        page.getByRole("heading", {
          name: "Synthetic fixture stay",
          exact: true,
        }),
      ).toBeVisible();
      const privacy = page.getByRole("complementary", {
        name: locale === "es" ? "Opciones de privacidad" : "Privacy choices",
      });
      await privacy
        .getByRole("button", {
          name:
            locale === "es"
              ? "Cerrar opciones de privacidad"
              : "Close privacy choices",
        })
        .click();
      const panel = page.getByRole("region", {
        name: locale === "es" ? "Reserva una estancia" : "Reserve a stay",
      });
      await panel
        .getByLabel(locale === "es" ? "Entrada" : "Check in", { exact: true })
        .fill("2027-01-02");
      await panel
        .getByLabel(locale === "es" ? "Salida" : "Check out", { exact: true })
        .fill("2027-01-04");
      await panel
        .getByRole("button", {
          name:
            locale === "es" ? "Consultar disponibilidad" : "Check availability",
        })
        .click();
      await panel
        .getByRole("button", {
          name: locale === "es" ? "Seleccionar habitación" : "Select room",
        })
        .click();
      await expect(
        panel.getByText(
          locale === "es"
            ? "Impuestos incluidos. Pago en el alojamiento. No se cobra ningún pago en línea."
            : "Taxes included. Pay at the property. No online payment is collected.",
        ),
      ).toBeVisible();
      await panel
        .getByLabel(locale === "es" ? "Nombre" : "Name", { exact: true })
        .fill("Synthetic Guest");
      await panel
        .getByLabel(locale === "es" ? "Correo electrónico" : "Email", {
          exact: true,
        })
        .fill("guest@example.invalid");
      await panel.getByRole("checkbox").check();
      await panel
        .getByRole("button", {
          name: locale === "es" ? "Solicitar estancia" : "Request stay",
        })
        .click();
      await expect(
        panel.getByText(
          locale === "es"
            ? "Solicitud recibida, pendiente de confirmación del alojamiento"
            : "Request received, awaiting property confirmation",
        ),
      ).toBeVisible();
      expect(mutations[0]).toEqual({
        action: "quote",
        roomType: room,
        checkIn: "2027-01-02",
        checkOut: "2027-01-04",
        guests: 2,
      });
      expect(mutations[1]).toMatchObject({
        action: "request",
        quote,
        name: "Synthetic Guest",
        email: "guest@example.invalid",
        locale,
      });
      expect(mutations[1].key).toMatch(/^[\da-f-]{36}$/);
      expect(mutations[1]).not.toHaveProperty("total_cents");
      expect(mutations[1]).not.toHaveProperty("status");
      await panel
        .getByRole("button", {
          name: locale === "es" ? "Cancelar solicitud" : "Cancel request",
        })
        .click();
      await expect(
        panel.getByText(
          locale === "es" ? "Solicitud cancelada" : "Request cancelled",
        ),
      ).toBeVisible();
      expect(mutations[2]).toEqual({ action: "cancel", reservation });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width + 1);
      await page.screenshot({
        path: `test-results/stay-booking-${locale}-${width}.png`,
        fullPage: true,
      });
    });
