import { expect, test } from "@playwright/test";

for (const locale of ["en", "es"] as const) {
  for (const theme of ["light", "dark"] as const) {
    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1280, height: 800 },
    ]) {
      test(`AkiDuermo guest routes ${locale} ${theme} ${viewport.width}`, async ({
        page,
      }) => {
        await page.setViewportSize(viewport);
        await page.addInitScript(
          (value) => localStorage.setItem("akipasa.theme", value),
          theme,
        );
        const consentRequests: string[] = [];
        page.on("request", (request) => {
          if (
            request.method() === "POST" &&
            new URL(request.url()).pathname ===
              "/api/v1/personalisation/consent"
          )
            consentRequests.push(request.url());
        });
        // Exercise the same Next server through the stay virtual host, without real credentials.
        await page.route(/http:\/\/127\.0\.0\.1:\d+\//, async (route) => {
          const path = new URL(route.request().url()).pathname;
          if (path === "/api/stays") {
            const hasDates = new URL(route.request().url()).searchParams.has(
              "checkIn",
            );
            return route.fulfill({
              json: {
                rows: hasDates
                  ? [
                      {
                        id: "00000000-0000-4000-8000-000000000001",
                        slug: "test-stay",
                        name: "Test stay",
                        address: "Fuengirola",
                        accommodationType: "apartment",
                        website: null,
                        city: "Fuengirola",
                      },
                    ]
                  : [],
                total: hasDates ? 1 : 0,
                availabilityChecked: hasDates,
              },
            });
          }
          if (path === "/api/map/stays")
            return route.fulfill({ json: { markers: [], truncated: false } });
          // Only document requests need the canonical virtual host to exercise
          // middleware. Proxying Next image optimisation and other subresources
          // through route.fetch while replacing Host can close the underlying
          // keep-alive socket before Playwright receives the response.
          if (route.request().resourceType() !== "document")
            return route.continue();
          const response = await route.fetch({
            headers: {
              ...route.request().headers(),
              host: "akiduermo.com",
            },
          });
          await route.fulfill({ response });
        });
        for (const path of [
          `/${locale}/auth?next=%2Fbookings`,
          "/",
          "/saved",
          "/map",
        ]) {
          await page.goto(
            `${path}${path.includes("?") ? "&" : "?"}lang=${locale}`,
            { waitUntil: "domcontentloaded" },
          );
          await expect(page.locator("main")).toBeVisible();
          if (path === "/") {
            // First-time visitors see an honest under-development landing.
            // Existing search deep links still open the legacy marketplace,
            // which we retain for the remaining regression assertions.
            await expect(
              page.getByRole("heading", {
                name: locale === "es"
                  ? "Los mejores viajes empiezan antes de hacer la maleta."
                  : "Better trips start before you pack.",
              }),
            ).toBeVisible();
            await expect(
              page.getByRole("button", {
                name: locale === "es"
                  ? "Avisadme del lanzamiento"
                  : "Notify me at launch",
              }),
            ).toBeDisabled();
            await expect(
              page.getByRole("link", {
                name: locale === "es"
                  ? "Tengo un alojamiento"
                  : "I manage accommodation",
              }),
            ).toHaveAttribute("href", "#launch-form");
            await page.screenshot({
              path: `test-results/duermo-coming-soon-${locale}-${theme}-${viewport.width}.png`,
              fullPage: true,
            });
            await page.goto(`/?lang=${locale}&q=Fuengirola`, {
              waitUntil: "domcontentloaded",
            });
            await expect(page.getByRole("textbox", {
              name: locale === "es" ? "Destino" : "Destination",
            })).toBeVisible();
          }
          // A first visitor must be able to dismiss the initially open panel
          // without making a consent decision before using the stay controls.
          const privacy = page.getByRole("complementary", {
            name:
              locale === "es" ? "Opciones de privacidad" : "Privacy choices",
          });
          await expect(privacy).toBeVisible();
          await expect(privacy.getByRole("checkbox")).toHaveCount(4);
          for (const checkbox of await privacy.getByRole("checkbox").all())
            await expect(checkbox).not.toBeChecked();
          const close = privacy.getByRole("button", {
            name:
              locale === "es"
                ? "Cerrar opciones de privacidad"
                : "Close privacy choices",
          });
          const closeBounds = await close.boundingBox();
          expect(closeBounds?.height).toBeGreaterThanOrEqual(44);
          expect(closeBounds?.width).toBeGreaterThanOrEqual(44);
          if (path.includes("/auth?")) {
            await privacy.getByRole("checkbox").nth(1).check();
            await privacy.getByRole("checkbox").nth(3).check();
          }
          await close.click();
          await expect(privacy).toBeHidden();
          const privacyTrigger = page.getByRole("button", {
            name:
              locale === "es" ? "Opciones de privacidad" : "Privacy choices",
            exact: true,
          });
          await expect(privacyTrigger).toBeFocused();
          if (path.includes("/auth?")) {
            await privacyTrigger.press("Enter");
            await expect(privacy).toBeVisible();
            await expect(privacy.getByRole("checkbox").nth(1)).toBeChecked();
            await expect(privacy.getByRole("checkbox").nth(3)).toBeChecked();
            await privacy.getByRole("checkbox").nth(1).focus();
            await page.keyboard.press("Escape");
            await expect(privacy).toBeHidden();
            await expect(privacyTrigger).toBeFocused();
          }
          await expect(
            page.locator("#ak-consented-ga, #ak-google-ads-loader"),
          ).toHaveCount(0);
          expect(consentRequests).toEqual([]);
          expect(
            (await page.context().cookies()).filter((cookie) =>
              /^ak_(consent_version|analytics|personalisation|marketing)$/.test(
                cookie.name,
              ),
            ),
          ).toEqual([]);
          if (path === "/" && viewport.width >= 1024) {
            const rail = page.locator(".suite-discovery-nav");
            await expect(page.locator("[data-suite-header]")).toBeHidden();
            expect((await rail.boundingBox())!.y).toBe(0);
            expect((await rail.boundingBox())!.height).toBe(viewport.height);
            await expect(
              page.locator(".suite-discovery-brand img"),
            ).toHaveAttribute("src", "/brand/v3/duermo.svg");
            const collapse = page.getByRole("button", {
              name:
                locale === "es" ? "Contraer barra lateral" : "Collapse sidebar",
              exact: true,
            });
            await collapse.click();
            await expect(rail).toHaveAttribute("data-compact", "true");
            await expect(
              page.locator(".suite-discovery-brand strong"),
            ).toBeHidden();
            await page.evaluate(() =>
              window.scrollTo(0, document.body.scrollHeight),
            );
            expect((await rail.boundingBox())!.y).toBe(0);

            for (const control of await page
              .locator(
                ".suite-discovery-tools button,.suite-discovery-collapse,.suite-discovery-signin,.suite-discovery-menu > summary",
              )
              .all()) {
              const box = await control.boundingBox();
              expect(box!.height).toBeGreaterThanOrEqual(44);
              expect(box!.height).toBeLessThanOrEqual(64);
            }
            await page.setViewportSize({ width: viewport.width, height: 480 });
            await page.locator(".suite-discovery-menu summary").click();
            const menu = page.locator(".suite-discovery-popover");
            await expect(menu).toBeVisible();
            const bounds = await menu.boundingBox();
            expect(bounds!.y).toBeGreaterThanOrEqual(0);
            expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(480);
            await expect(
              menu.getByRole("navigation").getByRole("link"),
            ).toHaveCount(5);
            await page.keyboard.press("Escape");
            await expect(menu).toBeHidden();
            await page
              .getByRole("button", {
                name:
                  locale === "es" ? "Expandir barra lateral" : "Expand sidebar",
                exact: true,
              })
              .click();
            await expect(rail).toHaveAttribute("data-compact", "false");
            await page.setViewportSize(viewport);
            await page.evaluate(() => window.scrollTo(0, 0));
          }
          if (path === "/") {
            const checkIn = new Date(Date.now() + 86_400_000)
              .toISOString()
              .slice(0, 10);
            const checkOut = new Date(Date.now() + 5 * 86_400_000)
              .toISOString()
              .slice(0, 10);
            await page
              .getByRole("textbox", {
                name: locale === "es" ? "Destino" : "Destination",
              })
              .fill("Fuengirola");
            await page
              .getByLabel(locale === "es" ? "Entrada" : "Check in")
              .fill(checkIn);
            await page
              .getByLabel(locale === "es" ? "Salida" : "Check out")
              .fill(checkOut);
            await page
              .getByRole("button", {
                name: locale === "es" ? "Buscar alojamiento" : "Find a stay",
              })
              .click();
            await expect(
              page.getByRole("link", { name: "Test stay", exact: true }),
            ).toBeVisible();
            await expect(
              page.getByRole("link", { name: "Test stay", exact: true }),
            ).toHaveAttribute(
              "href",
              new RegExp(`^/stays/test-stay\\?lang=${locale}&`),
            );
            await expect(
              page.getByText(
                locale === "es"
                  ? /Disponibilidad comprobada/
                  : /Availability checked/,
              ),
            ).toBeVisible();
          }
          if (path === "/saved") {
            await expect(
              page.getByRole("searchbox", {
                name:
                  locale === "es" ? "Buscar guardados" : "Search saved stays",
              }),
            ).toBeVisible();
            await expect(
              page.getByRole("region", {
                name: locale === "es" ? "Planea tu estancia" : "Plan your stay",
              }),
            ).toHaveCount(0);
          }
          if (path.includes("/auth?")) {
            await expect(
              viewport.width >= 1024
                ? page.locator(".suite-discovery-brand")
                : page.getByRole("banner").getByRole("link", {
                    name: "AkiDuermo",
                    exact: true,
                  }),
            ).toBeVisible();
            await expect(page.locator(".app-rail")).toHaveCount(0);
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
            path,
          ).toBeLessThanOrEqual(viewport.width + 1);
          if (path === "/map") {
            const filter = page.locator("details").filter({
              has: page.getByText(
                locale === "es" ? "Buscar y filtrar" : "Search & filters",
              ),
            });
            await expect(filter).not.toHaveAttribute("open", "");
            await expect(page.locator(".map-legend")).toBeHidden();
            await filter.locator("summary").click();
            await expect(filter).toHaveAttribute("open", "");
            const canvas = page.locator(".production-map canvas");
            await expect(canvas).toBeVisible();
            await canvas.evaluate((element) =>
              element.setAttribute("data-stay-map-instance", "original"),
            );
            await page
              .getByRole("button", {
                name: locale === "es" ? "Hoteles" : "Hotels",
              })
              .click();
            await expect(canvas).toHaveAttribute(
              "data-stay-map-instance",
              "original",
            );
            await expect(
              page.getByRole("application", {
                name: locale === "es" ? "Mapa interactivo" : "Interactive map",
              }),
            ).toBeVisible();
            const map = await page.locator(".production-map").boundingBox();
            const navigation = await page
              .locator(".suite-discovery-nav")
              .boundingBox();
            expect(navigation).not.toBeNull();
            const railWidth = viewport.width >= 1024 ? navigation!.width : 0;
            expect(map?.width).toBeGreaterThan(
              (viewport.width - railWidth) * 0.9,
            );
            expect(map?.height).toBeGreaterThan(viewport.height * 0.6);
            if (railWidth) {
              expect(navigation!.x).toBe(0);
              expect(map!.x).toBeGreaterThanOrEqual(navigation!.x + railWidth);
            } else {
              expect(map!.y + map!.height).toBeLessThanOrEqual(
                navigation!.y + 1,
              );
            }
          }
          if (path === "/") {
            await page.screenshot({
              path: `test-results/duermo-home-${locale}-${theme}-${viewport.width}.png`,
              fullPage: true,
            });
          }
          if (path === "/saved" || path === "/map") {
            const links = await page
              .getByRole("navigation", {
                name:
                  locale === "es"
                    ? "Navegación de AkiDuermo"
                    : "AkiDuermo navigation",
              })
              .locator("a")
              .evaluateAll((elements) =>
                elements.map((a) => a.getAttribute("href")?.split("?")[0]),
              );
            expect(links).toEqual([
              "/",
              "/map",
              "/saved",
              "/bookings",
              "/account",
            ]);
          }
        }
        expect(consentRequests).toEqual([]);
        await page.screenshot({
          path: `test-results/duermo-${locale}-${theme}-${viewport.width}.png`,
        });
        await page.unrouteAll({ behavior: "ignoreErrors" });
      });
    }
  }
}
