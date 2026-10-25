import { expect, test } from "@playwright/test";
for (const locale of ["en", "es"] as const)
  for (const theme of ["light", "dark"] as const)
    for (const width of [390, 820, 1280])
      test(`map recovery ${locale} ${theme} ${width}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.addInitScript((theme) => {
          localStorage.setItem("akipasa.theme", theme);
          const original = HTMLCanvasElement.prototype.getContext;
          HTMLCanvasElement.prototype.getContext = function (
            this: HTMLCanvasElement,
            ...args
          ) {
            if (args[0] === "webgl" || args[0] === "webgl2") {
              document.documentElement.dataset.webglAttempts = String(
                Number(document.documentElement.dataset.webglAttempts || 0) + 1,
              );
              return null;
            }
            return original.apply(this, args as Parameters<typeof original>);
          } as typeof original;
        }, theme);
        const searches: string[] = [];
        await page.route(/http:\/\/127\.0\.0\.1:\d+\//, async (route) => {
          const url = new URL(route.request().url());
          if (url.pathname === "/api/stays") {
            searches.push(url.search);
            return route.fulfill({
              json: { rows: [], total: 0, availabilityChecked: false },
            });
          }
          if (route.request().resourceType() !== "document")
            return route.continue();
          const response = await route.fetch({
            headers: { ...route.request().headers(), host: "akiduermo.com" },
          });
          await route.fulfill({ response });
        });
        await page.goto(`/map?lang=${locale}`);
        const close = page.getByRole("button", {
          name:
            locale === "es"
              ? "Cerrar opciones de privacidad"
              : "Close privacy choices",
          exact: true,
        });
        await close.click();
        await expect(close).toBeHidden();
        await page
          .locator("summary")
          .filter({
            hasText: locale === "es" ? "Buscar y filtrar" : "Search & filters",
          })
          .click();
        const destination = page.getByRole("textbox", {
          name: locale === "es" ? "Destino" : "Destination",
        });
        await destination.fill("Málaga & coast");
        await page
          .getByRole("button", {
            name: locale === "es" ? "Buscar" : "Search",
            exact: true,
          })
          .click();
        await page
          .getByRole("button", {
            name: locale === "es" ? "Hoteles" : "Hotels",
            exact: true,
          })
          .click();
        await page
          .locator("summary")
          .filter({
            hasText: locale === "es" ? "Buscar y filtrar" : "Search & filters",
          })
          .click();
        const browse = page.getByRole("link", {
          name: locale === "es" ? "Ver alojamientos" : "Browse stays",
        });
        const href = `/?${new URLSearchParams({ lang: locale, q: "Málaga & coast", type: "hotel" })}#stays`;
        await expect(browse).toHaveAttribute("href", href);
        const attempts = await page.evaluate(() =>
          Number(document.documentElement.dataset.webglAttempts),
        );
        const retry = page.getByRole("button", {
          name: locale === "es" ? "Reintentar mapa" : "Retry map",
        });
        for (const control of [retry, browse]) {
          const box = await control.boundingBox();
          expect(box!.height).toBeGreaterThanOrEqual(44);
          expect(box!.x).toBeGreaterThanOrEqual(0);
          expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        }
        await retry.click();
        await expect
          .poll(() =>
            page.evaluate(() =>
              Number(document.documentElement.dataset.webglAttempts),
            ),
          )
          .toBeGreaterThan(attempts);
        await expect(browse).toHaveAttribute("href", href);
        await page.screenshot({
          path: `test-results/map-recovery-${locale}-${theme}-${width}.png`,
        });
        await browse.click();
        await expect(page).toHaveURL(
          new RegExp(`lang=${locale}&q=M%C3%A1laga`),
        );
        await expect(
          page.getByRole("textbox", {
            name: locale === "es" ? "Destino" : "Destination",
          }),
        ).toHaveValue("Málaga & coast");
        await expect(
          page.getByRole("button", {
            name: locale === "es" ? "Hoteles" : "Hotels",
            exact: true,
          }),
        ).toHaveAttribute("aria-pressed", "true");
        await expect
          .poll(() =>
            searches.some((value) => {
              const p = new URLSearchParams(value);
              return (
                p.get("q") === "Málaga & coast" && p.get("type") === "hotel"
              );
            }),
          )
          .toBe(true);
      });
