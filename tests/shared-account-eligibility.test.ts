import {
  accountTaskResume,
  accountTaskFromSearch,
  suiteAccountCompletionUrl,
} from "../src/lib/account-task-resume";
import { GET as memberHistory } from "../src/app/api/stays/bookings/route";
const state = vi.hoisted(() => ({
  status: "pending",
  locale: "en",
  from: vi.fn(),
  getUser: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    auth: { getUser: state.getUser },
    rpc: async () => ({ data: { status: state.status }, error: null }),
    from: state.from,
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [] }),
  headers: async () => new Headers({ "x-akipasa-locale": state.locale }),
}));
import { requireUser } from "../src/lib/auth";
import { afterEach, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  accountFeaturesAllowed,
  accountTrackingAllowed,
  accountCompletionUrl,
} from "../src/lib/account-eligibility";
afterEach(() => vi.unstubAllEnvs());
it("retains existing access before coordinated schema rollout", async () => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "false");
  const rpc = vi.fn();
  expect(
    await accountFeaturesAllowed({ rpc } as unknown as SupabaseClient),
  ).toBe(true);
  expect(rpc).not.toHaveBeenCalled();
});
it.each(["pending", "underage"])(
  "blocks %s independently of client cookies",
  async (status) => {
    vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
    expect(
      await accountFeaturesAllowed({
        rpc: async () => ({ data: { status }, error: null }),
      } as unknown as SupabaseClient),
    ).toBe(false);
  },
);
it.each(["complete", "exempt"])("preserves %s accounts", async (status) => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
  expect(
    await accountFeaturesAllowed({
      rpc: async () => ({ data: { status }, error: null }),
    } as unknown as SupabaseClient),
  ).toBe(true);
});
it("fails closed on provider failures and never exports credentials in the handoff", async () => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
  await expect(
    accountFeaturesAllowed({
      rpc: async () => ({ data: null, error: { message: "down" } }),
    } as unknown as SupabaseClient),
  ).rejects.toThrow(/unavailable/);
  expect(accountCompletionUrl("en")).toBe("https://akipasa.com/en/onboarding");
  expect(accountCompletionUrl("es")).toBe("https://akipasa.com/es/onboarding");
});

it("guards direct member page URLs without relying on a frontend toggle", async () => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
  state.status = "pending";
  state.getUser.mockResolvedValue({ data: { user: { id: "user" } } });
  await expect(requireUser("en", "/account")).rejects.toThrow(
    "redirect:https://akipasa.com/en/onboarding",
  );
  expect(state.from).not.toHaveBeenCalled();
});
it("keeps negative declarations restricted in the other product", async () => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
  state.status = "underage";
  state.getUser.mockResolvedValue({ data: { user: { id: "user" } } });
  await expect(requireUser("es", "/account")).rejects.toThrow(
    "redirect:https://akipasa.com/es/onboarding",
  );
});

it("rejects direct member history API requests before reading tenant records", async () => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
  state.status = "underage";
  state.getUser.mockResolvedValue({ data: { user: { id: "user" } } });
  const result = await memberHistory(
    new Request("https://akiduermo.com/api/stays/bookings?action=history"),
  );
  expect(result.status).toBe(403);
  expect(await result.json()).toEqual({ error: "account_completion_required" });
  expect(state.from).not.toHaveBeenCalled();
});

it("does not confuse an existing underage demographic with loss of account access", async () => {
  vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "false");
  const db = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { birth_year: new Date().getUTCFullYear() - 12 },
            error: null,
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
  expect(await accountFeaturesAllowed(db)).toBe(true);
  expect(await accountTrackingAllowed(db, "self")).toBe(false);
});

it("retains the exact allowlisted task in the fixed central completion envelope", () => {
  const completion = new URL(
    accountCompletionUrl("en", "/account?next=https://evil.test&token=secret"),
  );
  const next = completion.searchParams.get("next")!;
  expect(completion.origin).toBe("https://akipasa.com");
  expect(next).toContain("/en/account-resume?");
  expect(next).not.toContain("evil");
  expect(next).not.toContain("secret");
});

it.each(["en", "es"] as const)(
  "keeps canonical %s Passport resume tasks",
  (locale) => {
    expect(
      accountTaskResume("pasa", locale, `/${locale}/passports/prestige`)?.url,
    ).toBe(`https://akipasa.com/${locale}/passports/prestige`);
  },
);

it.each(["en", "es"] as const)(
  "retains bounded %s rental selection and pagination without credentials",
  (locale) => {
    expect(
      accountTaskResume(
        "coches",
        locale,
        "/rentals/branch?vehicle=car_1&start=2027-02-28&end=2027-03-02&page=2&token=secret",
      )?.url,
    ).toBe(
      `https://akicoches.com/rentals/branch?lang=${locale}&vehicle=car_1&start=2027-02-28&end=2027-03-02&page=2`,
    );
  },
);

it.each(["en", "es"] as const)(
  "preserves validated %s referral tasks across all five fixed products",
  (locale) => {
    const code = "AKI12345";
    for (const [product, path, origin] of [
      ["pasa", "/referrals", "https://akipasa.com"],
      ["duermo", "/bookings", "https://akiduermo.com"],
      ["coches", "/account", "https://akicoches.com"],
      ["hq", "/business", "https://akihq.app"],
      ["business", "/", "https://akibusiness.com"],
    ] as const) {
      const task = accountTaskResume(
        product,
        locale,
        `${path}?ref=${code}&next=https://evil.invalid&token=secret`,
      )!;
      const target = new URL(task.url);
      expect(target.origin).toBe(origin);
      expect(target.searchParams.get("ref")).toBe(code);
      expect(
        product === "pasa" || product === "hq"
          ? target.pathname.startsWith(`/${locale}/`)
          : target.searchParams.get(
              product === "business" ? "locale" : "lang",
            ) === locale,
      ).toBe(true);
      expect(target.searchParams.has("next")).toBe(false);
      expect(target.searchParams.has("token")).toBe(false);
    }
  },
);
it.each([
  "ref=AKI12345&ref=AKI12345",
  "ref=AKI12345&ref=OTHER123",
  "ref=aki12345",
  "ref=SHORT",
  "ref=" + "A".repeat(25),
  "ref=https://evil.invalid",
  "ref=//evil.invalid",
])("rejects malformed or repeated public referral task %s", (query) => {
  for (const product of [
    "pasa",
    "duermo",
    "coches",
    "hq",
    "business",
  ] as const) {
    const path =
      product === "pasa"
        ? "/referrals"
        : product === "hq"
          ? "/business"
          : product === "business"
            ? "/"
            : "/account";
    const url = new URL(
      accountTaskResume(product, "en", `${path}?${query}`)!.url,
    );
    expect(url.searchParams.has("ref")).toBe(false);
    if (product === "pasa") expect(url.pathname).toBe("/en/account");
  }
});

it.each(["en", "es"] as const)(
  "round-trips the maximum-length %s referral code in the local completion envelope",
  (locale) => {
    const code = "A".repeat(24),
      requested = `/${locale}/referrals?ref=${code}`;
    const completion = new URL(
      suiteAccountCompletionUrl("pasa", locale, requested),
    );
    const next = new URL(
      completion.searchParams.get("next")!,
      completion.origin,
    );
    expect(completion.pathname).toBe(`/${locale}/onboarding`);
    expect(next.pathname).toBe(`/${locale}/account-resume`);
    expect(next.searchParams.get("product")).toBe("pasa");
    expect(
      accountTaskResume(
        next.searchParams.get("product"),
        locale,
        next.searchParams.get("path")!,
      )?.url,
    ).toBe(`https://akipasa.com/${locale}/referrals?ref=${code}`);
  },
);

it.each(["en", "es"] as const)(
  "actual accommodation account and booking loaders preserve %s referral before the server gate",
  async (locale) => {
    vi.stubEnv("AKISUITE_ONBOARDING_SCHEMA_READY", "true");
    state.locale = locale;
    state.getUser.mockResolvedValue({ data: { user: { id: "fixture" } } });
    const account = (await import("../src/app/account/page")).default,
      bookings = (await import("../src/app/bookings/page")).default;
    for (const status of ["pending", "underage"]) {
      state.status = status;
      for (const [loader, path] of [
        [account, "/account"],
        [bookings, "/bookings"],
      ] as const) {
        let destination = "";
        try {
          await loader({
            searchParams: Promise.resolve({
              ref: "AKI12345",
              tab: "past",
              page: "2",
              next: "https://evil.invalid",
              token: "secret",
            }),
          });
        } catch (error) {
          destination = (error as Error).message.replace(/^redirect:/, "");
        }
        const completion = new URL(destination);
        expect(completion.pathname).toBe(`/${locale}/onboarding`);
        const next = new URL(
          completion.searchParams.get("next")!,
          completion.origin,
        );
        const task = new URL(
          next.searchParams.get("path")!,
          "https://akiduermo.com",
        );
        expect(task.pathname).toBe(path);
        expect(task.searchParams.get("ref")).toBe("AKI12345");
        expect(task.searchParams.get("tab")).toBe("past");
        expect(task.searchParams.get("page")).toBe("2");
        expect(task.searchParams.has("next")).toBe(false);
        expect(destination).not.toContain("secret");
      }
    }
  },
);

it("filters actual server search records without picking a repeated referral or exporting arbitrary URLs", () => {
  expect(
    accountTaskFromSearch("duermo", "en", "/bookings", {
      ref: ["AKI12345", "OTHER123"],
      tab: "past",
      page: "2",
      next: "https://evil.invalid",
      token: "secret",
    }),
  ).toBe("/bookings?tab=past&page=2");
  expect(
    accountTaskFromSearch("business", "es", "/", {
      workspace: "workspace_1",
      ref: "AKI12345",
    }),
  ).toBe("/?ref=AKI12345&workspace=workspace_1");
});

it.each(["en", "es"] as const)(
  "retains actual legacy scope names through every %s completion envelope",
  (locale) => {
    const scope = {
      property: "00000000-0000-4000-8000-000000000011",
      company: "00000000-0000-4000-8000-000000000022",
      organisation: "00000000-0000-4000-8000-000000000033",
      ref: "AKI12345",
    };
    for (const product of [
      "pasa",
      "duermo",
      "coches",
      "hq",
      "business",
    ] as const) {
      const pathname =
        product === "pasa"
          ? "/referrals"
          : product === "hq"
            ? "/business/accommodations"
            : product === "business"
              ? "/"
              : "/account";
      const task = accountTaskFromSearch(product, locale, pathname, scope)!;
      const completion = new URL(
        suiteAccountCompletionUrl(product, locale, task),
      );
      const next = new URL(
        completion.searchParams.get("next")!,
        completion.origin,
      );
      const destination = new URL(
        accountTaskResume(
          next.searchParams.get("product"),
          locale,
          next.searchParams.get("path")!,
        )!.url,
      );
      for (const [key, value] of Object.entries(scope))
        expect(destination.searchParams.get(key)).toBe(value);
      expect(destination.searchParams.getAll("property")).toHaveLength(1);
      expect(destination.searchParams.getAll("company")).toHaveLength(1);
      expect(destination.searchParams.getAll("organisation")).toHaveLength(1);
      expect(next.pathname).toBe(`/${locale}/account-resume`);
    }
  },
);

it.each(["property", "company", "organisation"])(
  "rejects duplicate and malicious legacy %s scopes without dropping valid referral intent",
  (key) => {
    for (const locale of ["en", "es"] as const) {
      for (const value of [
        ["owned", "foreign"],
        "https://evil.invalid",
        "//evil.invalid",
        "../foreign",
        "x".repeat(129),
      ]) {
        const task = accountTaskFromSearch(
          "hq",
          locale,
          "/business/locations",
          { [key]: value, ref: "AKI12345" },
        )!;
        const destination = new URL(accountTaskResume("hq", locale, task)!.url);
        expect(destination.searchParams.has(key)).toBe(false);
        expect(destination.searchParams.get("ref")).toBe("AKI12345");
      }
      const direct = new URL(
        accountTaskResume(
          "hq",
          locale,
          `/business/locations?${key}=owned&${key}=foreign&ref=AKI12345`,
        )!.url,
      );
      expect(direct.searchParams.has(key)).toBe(false);
      expect(direct.searchParams.get("ref")).toBe("AKI12345");
    }
  },
);
