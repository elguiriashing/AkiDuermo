import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  host: "akiduermo.com",
  auth: {
    getUser: vi.fn(),
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
import { signOutStay } from "../src/app/account/actions";
import { updateRecoveredPassword } from "../src/app/[locale]/auth/recover/actions";
import { taskFromAuthCallback } from "../src/lib/auth-security";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.getUser.mockResolvedValue({ data: { user: { id: "fixture" } } });
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
    expect(mocks.auth.signOut).toHaveBeenCalledExactlyOnceWith({
      scope: "local",
    });
  },
);

it("signs out only the current stay account session", async () => {
  await expect(signOutStay()).rejects.toThrow("redirect:/");
  expect(mocks.auth.signOut).toHaveBeenCalledExactlyOnceWith({
    scope: "local",
  });
});

function recoveryForm(locale: "en" | "es") {
  const form = new FormData();
  form.set("locale", locale);
  form.set("next", "/bookings");
  form.set("password", "SyntheticFixture1234");
  form.set("confirmPassword", "SyntheticFixture1234");
  return form;
}

it.each(["en", "es"] as const)(
  "revokes all shared sessions only after a successful password recovery in %s",
  async (locale) => {
    mocks.host = "akiduermo.com";
    await expect(updateRecoveredPassword(recoveryForm(locale))).rejects.toThrow(
      `redirect:/${locale}/auth?reset=1&next=%2Fbookings`,
    );
    expect(mocks.auth.updateUser).toHaveBeenCalledOnce();
    expect(mocks.auth.signOut).toHaveBeenCalledExactlyOnceWith({
      scope: "global",
    });
    expect(mocks.auth.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.auth.signOut.mock.invocationCallOrder[0],
    );
  },
);

it("does not revoke shared sessions when the password save fails", async () => {
  mocks.host = "akiduermo.com";
  mocks.auth.updateUser.mockResolvedValue({
    error: { message: "fixture failure" },
  });
  await expect(updateRecoveredPassword(recoveryForm("en"))).rejects.toThrow(
    "redirect:/en/auth/recover?next=%2Fbookings&error=save",
  );
  expect(mocks.auth.signOut).not.toHaveBeenCalled();
});

it("does not update credentials or revoke sessions without authentication", async () => {
  mocks.host = "akiduermo.com";
  mocks.auth.getUser.mockResolvedValue({ data: { user: null } });
  await expect(updateRecoveredPassword(recoveryForm("es"))).rejects.toThrow(
    "redirect:/es/auth?error=recovery&next=%2Fbookings",
  );
  expect(mocks.auth.updateUser).not.toHaveBeenCalled();
  expect(mocks.auth.signOut).not.toHaveBeenCalled();
});
