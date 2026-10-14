import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  host: "akiduermo.com",
  auth: {
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    signOut: vi.fn(),
  },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: mocks.host }),
  cookies: async () => ({}),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("@/lib/auth", () => ({
  requireUser: async () => ({
    supabase: { auth: mocks.auth },
    user: { id: "fixture", email: "existing@example.invalid" },
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth: mocks.auth }),
}));
import {
  changeStayAccountEmail,
  resetStayPassword,
} from "../src/app/settings/actions";
import { signOut } from "../src/app/[locale]/auth/actions";
import { taskFromAuthCallback } from "../src/lib/auth-security";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.updateUser.mockResolvedValue({ error: null });
  mocks.auth.resetPasswordForEmail.mockResolvedValue({ error: null });
  mocks.auth.signOut.mockResolvedValue({ error: null });
});
afterEach(() => vi.unstubAllEnvs());
for (const [host, origin] of [
  ["akiduermo.com", "https://akiduermo.com"],
  ["approved.example", "https://approved.example"],
  ["localhost:3102", "http://localhost:3102"],
])
  describe(`host-local account callbacks ${host}`, () => {
    beforeEach(() => {
      mocks.host = host;
      vi.stubEnv(
        "AKISUITE_ALLOWED_PREVIEW_ORIGINS",
        "https://approved.example",
      );
    });
    it("keeps email confirmation on the originating host and settings task", async () => {
      const form = new FormData();
      form.set("locale", "es");
      form.set("email", "new@example.invalid");
      await expect(changeStayAccountEmail(form)).rejects.toThrow(
        "redirect:/settings?email=pending",
      );
      const callback = new URL(
        mocks.auth.updateUser.mock.calls[0][1].emailRedirectTo,
      );
      expect(callback.origin).toBe(origin);
      expect(callback.pathname).toBe("/es/auth/callback");
      expect(callback.searchParams.get("next")).toBe(
        "/settings?email=confirmed",
      );
    });
    it("keeps recovery on the originating host and returns to settings", async () => {
      const form = new FormData();
      form.set("locale", "en");
      await expect(resetStayPassword(form)).rejects.toThrow(
        "redirect:/settings?password=sent",
      );
      const callback = new URL(
        mocks.auth.resetPasswordForEmail.mock.calls[0][1].redirectTo,
      );
      expect(callback.origin).toBe(origin);
      expect(callback.pathname).toBe("/en/auth/callback");
      expect(
        taskFromAuthCallback("en", callback.searchParams.get("next")!, origin),
      ).toBe("/settings");
    });
  });
it.each(["en", "es"])(
  "sign-out stays within the accommodation app in %s",
  async (locale) => {
    const form = new FormData();
    form.set("locale", locale);
    await expect(signOut(form)).rejects.toThrow(`redirect:/?lang=${locale}`);
    expect(mocks.auth.signOut).toHaveBeenCalledOnce();
  },
);
