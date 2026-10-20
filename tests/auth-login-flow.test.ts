import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieDelete: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
  rpc: vi.fn(),
  signInWithOAuth: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: "akiduermo.com" }),
  cookies: async () => ({
    get: mocks.cookieGet,
    delete: mocks.cookieDelete,
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getUser: mocks.getUser,
      signInWithOAuth: mocks.signInWithOAuth,
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mocks.maybeSingle }),
      }),
    }),
    rpc: mocks.rpc,
  }),
}));

import { signInWithGoogle } from "../src/app/[locale]/auth/actions";
import { GET } from "../src/app/[locale]/auth/callback/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cookieGet.mockReturnValue(undefined);
  mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "fixture-user" } },
  });
  mocks.maybeSingle.mockResolvedValue({
    data: { terms_version: "2026-07-23" },
    error: null,
  });
  mocks.rpc.mockResolvedValue({ error: null });
  mocks.signInWithOAuth.mockResolvedValue({
    data: { url: "https://accounts.google.test/oauth" },
    error: null,
  });
});

describe("AkiDuermo Google login", () => {
  it("starts OAuth without a pre-authentication terms checkbox", async () => {
    const form = new FormData();
    form.set("locale", "en");
    form.set("next", "/bookings");

    await expect(signInWithGoogle(form)).rejects.toThrow(
      "redirect:https://accounts.google.test/oauth",
    );
    expect(mocks.signInWithOAuth).toHaveBeenCalledOnce();
    expect(mocks.signInWithOAuth.mock.calls[0][0].options.redirectTo).toBe(
      "https://akiduermo.com/en/auth/callback?next=%2Fbookings",
    );
  });

  it("returns current-terms users to their local account task", async () => {
    const response = await GET(
      new Request(
        "https://akiduermo.com/en/auth/callback?code=fixture&next=%2Faccount",
        { headers: { host: "akiduermo.com" } },
      ),
      { params: Promise.resolve({ locale: "en" }) },
    );

    expect(response.headers.get("location")).toBe(
      "https://akiduermo.com/account",
    );
  });

  it("gates new or outdated users after OAuth and preserves the local task", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const response = await GET(
      new Request(
        "https://akiduermo.com/es/auth/callback?code=fixture&next=%2Fbookings",
        { headers: { host: "akiduermo.com" } },
      ),
      { params: Promise.resolve({ locale: "es" }) },
    );

    expect(response.headers.get("location")).toBe(
      "https://akiduermo.com/es/terms/accept?next=%2Fbookings",
    );
  });
});
