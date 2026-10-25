import { describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import nextConfig from "../next.config";
import { androidOAuthScript } from "../src/lib/android-oauth";

it("keeps handoff headers strict after global Next headers are applied", async () => {
  const rules = await nextConfig.headers!();
  const handoff = rules.find(
    (rule) => rule.source === "/:locale(en|es)/auth/callback",
  );
  expect(handoff?.has).toContainEqual({
    type: "query",
    key: "android",
    value: "1",
  });
  expect(handoff?.missing).toContainEqual({
    type: "query",
    key: "native",
    value: "1",
  });
  expect(handoff?.headers).toContainEqual({
    key: "Referrer-Policy",
    value: "no-referrer",
  });
  const csp = handoff?.headers.find(
    (header) => header.key === "Content-Security-Policy",
  )?.value;
  expect(csp).toContain(
    `script-src 'sha256-${createHash("sha256").update(androidOAuthScript).digest("base64")}'`,
  );
  expect(csp).not.toContain("script-src 'self'");
  for (const locale of ["en", "es"] as const) {
    const url = new URL(
      `https://akiduermo.com/${locale}/auth/callback?android=1&error=access_denied`,
    );
    const html = await androidOAuthHandoff(url, locale, "/account")!.text();
    const serializedScript = html.match(
      /<script nonce="[^"]+">([\s\S]*?)<\/script>/,
    )![1];
    expect(csp).toContain(
      `'sha256-${createHash("sha256").update(serializedScript).digest("base64")}'`,
    );
    expect(html).toContain('id="native-return"');
    url.searchParams.set("native", "1");
    expect(androidOAuthHandoff(url, locale, "/account")).toBeNull();
    url.searchParams.delete("android");
    expect(androidOAuthHandoff(url, locale, "/account")).toBeNull();
    url.searchParams.delete("native");
    expect(androidOAuthHandoff(url, locale, "/account")).toBeNull();
  }
});
const oauthBoundary = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: oauthBoundary.create,
}));
import { GET as oauthCallbackRoute } from "../src/app/[locale]/auth/callback/route";

it("does not touch session state in Chrome, but exchanges after native return", async () => {
  oauthBoundary.create.mockReset();
  oauthBoundary.create.mockRejectedValue(
    new Error("exchange-in-original-webview"),
  );
  const callbackUrl =
    "https://akiduermo.com/en/auth/callback?android=1&code=one-time&next=https://evil.test";
  const response = await oauthCallbackRoute(new Request(callbackUrl), {
    params: Promise.resolve({ locale: "en" }),
  });
  expect(oauthBoundary.create).not.toHaveBeenCalled();
  expect(await response.text()).not.toContain("evil.test");
  await expect(
    oauthCallbackRoute(new Request(callbackUrl + "&native=1"), {
      params: Promise.resolve({ locale: "en" }),
    }),
  ).rejects.toThrow("exchange-in-original-webview");
  expect(oauthBoundary.create).toHaveBeenCalledOnce();
  oauthBoundary.create.mockClear();
  await expect(
    oauthCallbackRoute(
      new Request("https://akiduermo.com/es/auth/callback?code=browser"),
      { params: Promise.resolve({ locale: "es" }) },
    ),
  ).rejects.toThrow("exchange-in-original-webview");
  expect(oauthBoundary.create).toHaveBeenCalledOnce();
});

import {
  androidOAuthHandoff,
  googleOAuthCallback,
} from "../src/lib/android-oauth";

describe("Android OAuth browser boundary", () => {
  it("marks only this product's native Google callback", () => {
    const callback = new URL(
      googleOAuthCallback(
        "https://akiduermo.com",
        "en",
        "/bookings?lang=en",
        "Mozilla AkiDuermoAndroid/1.0.1",
      ),
    );
    expect(callback.searchParams.get("android")).toBe("1");
    expect(callback.searchParams.get("next")).toBe("/bookings?lang=en");
    expect(
      new URL(
        googleOAuthCallback(
          "https://akiduermo.com",
          "es",
          "/account",
          "Mozilla",
        ),
      ).searchParams.has("android"),
    ).toBe(false);
  });
  it("returns code to this app without forwarding session material", async () => {
    const response = androidOAuthHandoff(
      new URL(
        "https://akiduermo.com/en/auth/callback?android=1&code=one-time&access_token=secret&refresh_token=secret&next=https://evil.test",
      ),
      "en",
      "/bookings",
    );
    expect(response?.headers.get("cache-control")).toBe("no-store");
    expect(response?.headers.get("referrer-policy")).toBe("no-referrer");
    const html = await response!.text();
    expect(html).toContain("akiduermo://auth/callback?");
    expect(html).toContain("code=one-time");
    expect(html).toContain("},5000)");
    expect(html).toContain('id="native-return"');
    expect(response?.headers.get("content-security-policy")).toContain(
      "script-src 'nonce-",
    );
    expect(html).toContain("next=%2Fbookings");
    expect(html).not.toContain("secret");
    expect(html).not.toContain("evil.test");
  });
  it("hands errors back too, without loops or altering normal browser callbacks", async () => {
    const error = new URL(
      "https://akiduermo.com/es/auth/callback?android=1&error=access_denied&error_description=%22%3E%3Cscript%3E",
    );
    const response = androidOAuthHandoff(error, "es", "/account");
    expect(await response!.text()).toContain("error=access_denied");
    expect(
      await androidOAuthHandoff(error, "es", "/account")!.text(),
    ).not.toContain("<script>");
    error.searchParams.set("native", "1");
    expect(androidOAuthHandoff(error, "es", "/account")).toBeNull();
    error.searchParams.delete("android");
    expect(androidOAuthHandoff(error, "es", "/account")).toBeNull();
  });
});

import { hasSupabaseAuthCookie } from "../src/lib/supabase/auth-cookie";
import { publicRequestOrigin } from "../src/lib/public-request-origin";
import {
  passwordSchema,
  safeAuthDestination,
  safeAuthDestinationForOrigin,
  safeExternalUrlSchema,
  taskFromAuthCallback,
} from "../src/lib/auth-security";

describe("authentication security", () => {
  it("requires a strong baseline password", () => {
    expect(passwordSchema.safeParse("Short1A").success).toBe(false);
    expect(passwordSchema.safeParse("alllowercase123").success).toBe(false);
    expect(passwordSchema.safeParse("SecureAccount42").success).toBe(true);
  });

  it("prevents external and cross-locale redirect targets", () => {
    expect(safeAuthDestination("es", "https://evil.example")).toBe(
      "/es/account",
    );
    expect(safeAuthDestination("es", "/en/account")).toBe("/es/account");
    expect(safeAuthDestination("es", "/es/community")).toBe("/es/community");
  });

  it("accepts only HTTPS external action links", () => {
    expect(
      safeExternalUrlSchema.safeParse("https://tickets.example/event").success,
    ).toBe(true);
    expect(safeExternalUrlSchema.safeParse("").success).toBe(true);
    expect(
      safeExternalUrlSchema.safeParse("http://tickets.example/event").success,
    ).toBe(false);
    expect(safeExternalUrlSchema.safeParse("javascript:alert(1)").success).toBe(
      false,
    );
    expect(
      safeExternalUrlSchema.safeParse("data:text/html,unsafe").success,
    ).toBe(false);
  });

  it("detects only Supabase authentication cookies", () => {
    expect(
      hasSupabaseAuthCookie([
        { name: "theme" },
        { name: "sb-project-auth-token.0" },
      ]),
    ).toBe(true);
    expect(hasSupabaseAuthCookie([{ name: "theme" }])).toBe(false);
    expect(hasSupabaseAuthCookie([{ name: "sb-project-unrelated" }])).toBe(
      false,
    );
  });

  it("keeps AkiDuermo OAuth and email callbacks on the stay origin", () => {
    expect(publicRequestOrigin(new Headers({ host: "akiduermo.com" }))).toBe(
      "https://akiduermo.com",
    );
    expect(publicRequestOrigin(new Headers({ host: "attacker.example" }))).toBe(
      "https://akiduermo.com",
    );
  });

  it("keeps a public task through the nested recovery callback", () => {
    const recovery =
      "/en/auth/recover?next=%2Fen%2Faccount%2Fsubscription%3Ffrom%3Dakipasa";
    expect(
      safeAuthDestinationForOrigin("en", recovery, "https://akipasa.com"),
    ).toBe(recovery);
    expect(taskFromAuthCallback("en", recovery, "https://akipasa.com")).toBe(
      "/en/account/subscription?from=akipasa",
    );
  });

  it("keeps an AkiDuermo task and rejects an external nested destination", () => {
    expect(
      taskFromAuthCallback(
        "es",
        "/es/auth/recover?next=%2Fbookings%3Fstatus%3Dpending",
        "https://akiduermo.com",
      ),
    ).toBe("/bookings?status=pending");
    expect(
      taskFromAuthCallback(
        "en",
        "/en/auth/recover?next=https%3A%2F%2Fevil.example%2Fsteal",
        "https://akipasa.com",
      ),
    ).toBe("/en/account");
  });
});
