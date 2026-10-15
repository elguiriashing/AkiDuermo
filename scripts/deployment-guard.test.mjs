import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { dryRunConfig, requirePreviewIsolation } from "./deployment-guard.mjs";

const env = {
  EXPECTED_WORKER: "akiduermo-preview",
  CLOUDFLARE_ACCOUNT_ID: "501bc9434d8ae555a6ac984a26dd2725",
  CLOUDFLARE_API_TOKEN: "inert-test-token",
};
const config = {
  name: "akiduermo",
  build: { command: "node scripts/deployment-guard.mjs" },
  main: "custom-worker.ts",
  assets: { directory: ".open-next/assets" },
};
const provider =
  (overrides = {}) =>
  async (url) => {
    let result = url.includes("/schedules") ? { schedules: [] } : [];
    if (url.includes("/zones?")) result = [{ id: "zone" }];
    for (const [suffix, value] of Object.entries(overrides))
      if (url.includes(suffix)) result = value;
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, result }),
    };
  };
test("default and production arguments fail closed before any upload", () => {
  for (const args of [[], ["production"], ["dry-run", "--no-dry-run"]]) {
    const result = spawnSync(
      process.execPath,
      ["scripts/deployment-guard.mjs", ...args],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Deployment blocked/);
  }
});
test("dry-run uses a separate identity and cannot attach routes", () => {
  const generated = dryRunConfig(config, "/tmp/check");
  assert.equal(generated.name, "akiduermo-preview");
  assert.equal(generated.build, undefined);
  assert.equal(config.name, "akiduermo");
  assert.throws(() => dryRunConfig({ ...config, routes: ["example.com/*"] }));
});
test("isolated preview is permitted", async () =>
  requirePreviewIsolation(env, provider()));
test("production identity is rejected before provider access", async () => {
  await assert.rejects(
    requirePreviewIsolation({ ...env, EXPECTED_WORKER: "akiduermo" }, () => {
      throw new Error("unexpected request");
    }),
  );
});
for (const [name, override] of Object.entries({
  domain: { "/workers/domains": [{ hostname: "akiduermo.com" }] },
  route: { "/workers/routes": [{ script: "akiduermo-preview" }] },
  schedule: { "/schedules": { schedules: [{ cron: "* * * * *" }] } },
})) {
  test(`preview rejects existing ${name}`, async () =>
    assert.rejects(requirePreviewIsolation(env, provider(override))));
}
test("provider permission errors fail closed", async () => {
  await assert.rejects(
    requirePreviewIsolation(env, async () => ({
      ok: false,
      status: 403,
      json: async () => ({ success: false }),
    })),
  );
});
test("zone routes on later account pages are checked", async () => {
  const request = async (url) => {
    if (url.includes("/zones?"))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [{ id: url.endsWith("page=2") ? "second" : "first" }],
          result_info: { total_pages: 2 },
        }),
      };
    if (url.includes("/zones/second/"))
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          result: [{ script: "akiduermo-preview" }],
        }),
      };
    return provider()(url);
  };
  await assert.rejects(requirePreviewIsolation(env, request), /zone routes/);
});
test("missing preview script is allowed but unreadable schedules are rejected", async () => {
  await requirePreviewIsolation(env, async (url) =>
    url.includes("/schedules") ? { status: 404 } : provider()(url),
  );
  await assert.rejects(
    requirePreviewIsolation(env, async (url) =>
      url.includes("/schedules")
        ? { status: 403, ok: false, json: async () => ({ success: false }) }
        : provider()(url),
    ),
  );
});
