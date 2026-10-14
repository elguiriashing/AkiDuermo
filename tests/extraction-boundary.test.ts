import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import {
  publicRequestOrigin,
  isStayRequestOrigin,
} from "../src/lib/public-request-origin";
import { safeAuthDestinationForOrigin } from "../src/lib/auth-security";
import { stayHref, stayHostRoute } from "../src/lib/akiduermo-routing";
const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("@/lib/supabase/middleware", () => ({ refreshSession: mocks.refresh }));
import { middleware } from "../src/middleware";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("independent AkiDuermo boundaries", () => {
  it("trusts only canonical, legacy, loopback and exact configured HTTPS previews", () => {
    vi.stubEnv(
      "AKISUITE_ALLOWED_PREVIEW_ORIGINS",
      "https://approved.example,https://bad.example/path,http://insecure.example",
    );
    expect(isStayRequestOrigin("https://approved.example")).toBe(true);
    expect(isStayRequestOrigin("https://other.approved.example")).toBe(false);
    expect(isStayRequestOrigin("https://bad.example")).toBe(false);
    expect(isStayRequestOrigin("http://insecure.example")).toBe(false);
    expect(publicRequestOrigin(new Headers({ host: "approved.example" }))).toBe(
      "https://approved.example",
    );
    expect(
      publicRequestOrigin(
        new Headers({
          host: "attacker.example",
          origin: "https://approved.example",
        }),
      ),
    ).toBe("https://akiduermo.com");
    expect(publicRequestOrigin(new Headers({ host: "localhost:3102" }))).toBe(
      "http://localhost:3102",
    );
  });
  it.each([
    "https://akiduermo.com",
    "http://localhost:3102",
    "https://approved.example",
  ])("uses the same safe stay task on %s", (origin) => {
    vi.stubEnv("AKISUITE_ALLOWED_PREVIEW_ORIGINS", "https://approved.example");
    expect(
      safeAuthDestinationForOrigin("es", "/bookings?lang=es", origin),
    ).toBe("/bookings?lang=es");
    for (const next of [
      "//evil.example/account",
      "https://akipasa.com/es/account",
      "/\\evil.example/account",
      "/es/business",
      "/account\r\nx:1",
    ])
      expect(safeAuthDestinationForOrigin("es", next, origin)).toBe("/account");
  });
  it("keeps canonical property links and health reachable", () => {
    expect(stayHref("hotel uno", "es")).toBe(
      "https://akiduermo.com/stays/hotel%20uno?lang=es",
    );
    expect(stayHostRoute("/api/health").kind).toBe("public");
    expect(stayHostRoute("/api/admin/users").kind).toBe("reject");
  });
  it("does not forward mutation bodies to shared membership or foreign hosts", async () => {
    const post = new NextRequest("https://akiduermo.com/membership", {
      method: "POST",
      headers: { host: "akiduermo.com" },
      body: "private",
    });
    expect((await middleware(post)).status).toBe(404);
    expect(
      (
        await middleware(
          new NextRequest("https://attacker.example/", {
            headers: { host: "attacker.example" },
          }),
        )
      ).status,
    ).toBe(421);
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
  it.each(["/unknown", "/membership", "/en/account/subscription"])(
    "never transfers credentials across origins from %s",
    async (path) => {
      const keys = [
        "CoDe",
        "TOKEN",
        "token_hash",
        "Access_Token",
        "REFRESH_TOKEN",
        "Provider_Token",
        "PROVIDER_REFRESH_TOKEN",
        "id_token",
        "Client_Secret",
        "Password",
        "STATE",
        "error_description",
      ];
      const params = new URLSearchParams({
        source: "saved",
        q: "hotel España",
        safe: "one",
        from: "untrusted",
      });
      params.append("safe", "two");
      keys.forEach((key) => params.append(key, "private-value"));
      const request = new NextRequest(
        `https://akiduermo.com${path}?${params}#access_token=hidden-browser-secret`,
        { headers: { host: "akiduermo.com" } },
      );
      const response = await middleware(request);
      expect(response.status).toBe(307);
      const destination = new URL(response.headers.get("location")!);
      expect(destination.origin).toBe("https://akipasa.com");
      expect(destination.hash).toBe("#redirected");
      expect(destination.searchParams.get("source")).toBe("saved");
      expect(destination.searchParams.get("q")).toBe("hotel España");
      expect(destination.searchParams.getAll("safe")).toEqual(["one", "two"]);
      expect(destination.href).not.toContain("private-value");
      expect(destination.href).not.toContain("hidden-browser-secret");
      keys.forEach((key) =>
        expect(destination.searchParams.has(key)).toBe(false),
      );
      if (path !== "/unknown")
        expect(destination.searchParams.get("from")).toBe("akiduermo");
      expect(mocks.refresh).not.toHaveBeenCalled();
    },
  );
  it.each(["/unknown", "/membership", "/es/account/subscription"])(
    "rejects non-read cross-origin requests at %s",
    async (path) => {
      for (const method of ["POST", "PUT", "DELETE"]) {
        const response = await middleware(
          new NextRequest(`https://akiduermo.com${path}?code=secret`, {
            method,
            headers: { host: "akiduermo.com" },
            body: "private-body",
          }),
        );
        expect(response.status).toBe(404);
        expect(response.headers.has("location")).toBe(false);
      }
    },
  );
  it("leaves auth callbacks local with their code and safe return task intact", async () => {
    mocks.refresh.mockResolvedValueOnce(NextResponse.next());
    const request = new NextRequest(
      "https://akiduermo.com/en/auth/callback?code=local-pkce-code&next=%2Fbookings",
      { headers: { host: "akiduermo.com" } },
    );
    const response = await middleware(request);
    expect(response.headers.has("location")).toBe(false);
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(request.nextUrl.searchParams.get("code")).toBe("local-pkce-code");
    expect(request.nextUrl.searchParams.get("next")).toBe("/bookings");
  });
  it.each(["en", "es"])(
    "keeps localized product roots on this app in %s",
    async (locale) => {
      const response = await middleware(
        new NextRequest(`https://akiduermo.com/${locale}?source=saved`, {
          headers: { host: "akiduermo.com" },
        }),
      );
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(
        `https://akiduermo.com/?source=saved&lang=${locale}`,
      );
    },
  );
  it("retains session refresh cookies and server-derived product identity on canonical route requests", async () => {
    const session = NextResponse.next();
    session.cookies.set("session-fixture", "refreshed", {
      httpOnly: true,
      sameSite: "lax",
    });
    mocks.refresh.mockResolvedValueOnce(session);
    const request = new NextRequest("http://localhost:3102/bookings?lang=en", {
      headers: { host: "localhost:3102", "x-akipasa-product": "admin" },
    });
    const response = await middleware(request);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.get("session-fixture")?.value).toBe("refreshed");
    expect(request.headers.get("x-akipasa-product")).toBe("akiduermo");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });
});
