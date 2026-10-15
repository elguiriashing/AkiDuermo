import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

export const PREVIEW_WORKER = "akiduermo-preview";
const ACCOUNT = "501bc9434d8ae555a6ac984a26dd2725";

export function dryRunConfig(config, cwd = process.cwd()) {
  assert.equal(config.name, "akiduermo");
  assert.equal(config.build?.command, "node scripts/deployment-guard.mjs");
  assert.ok(!config.route && !config.routes?.length && !config.env);
  const result = structuredClone(config);
  delete result.build;
  result.name = PREVIEW_WORKER;
  result.workers_dev = true;
  result.main = path.resolve(cwd, result.main);
  result.assets.directory = path.resolve(cwd, result.assets.directory);
  return result;
}

// A workers.dev URL does not establish isolation: existing custom domains AND
// zone routes can still point at that same script. Fail closed on unreadable state.
export async function requirePreviewIsolation(env, request = fetch) {
  assert.equal(env.EXPECTED_WORKER, PREVIEW_WORKER);
  assert.equal(env.CLOUDFLARE_ACCOUNT_ID, ACCOUNT);
  assert.ok(env.CLOUDFLARE_API_TOKEN, "A scoped Cloudflare token is required");
  const api = async (endpoint, allowAbsent = false) => {
    const response = await request(
      `https://api.cloudflare.com/client/v4${endpoint}`,
      {
        headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}` },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (allowAbsent && response.status === 404) return null;
    const data = await response.json();
    assert.ok(
      response.ok && data.success,
      "Cannot verify preview provider state",
    );
    return data;
  };
  const domains = await api(
    `/accounts/${ACCOUNT}/workers/domains?service=${PREVIEW_WORKER}`,
  );
  assert.equal(domains.result.length, 0, "Preview Worker has custom domains");
  let page = 1;
  let pages = 1;
  do {
    const zones = await api(
      `/zones?account.id=${ACCOUNT}&per_page=50&page=${page}`,
    );
    pages = zones.result_info?.total_pages ?? 1;
    for (const zone of zones.result) {
      const routes = await api(`/zones/${zone.id}/workers/routes`);
      assert.ok(
        !routes.result.some((route) => route.script === PREVIEW_WORKER),
        "Preview Worker has zone routes",
      );
    }
    page++;
  } while (page <= pages);
  const schedules = await api(
    `/accounts/${ACCOUNT}/workers/scripts/${PREVIEW_WORKER}/schedules`,
    true,
  );
  if (schedules)
    assert.equal(
      schedules.result.schedules.length,
      0,
      "Preview Worker has schedules",
    );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  if (process.argv.length !== 3 || process.argv[2] !== "dry-run") {
    console.error(
      "Deployment blocked: akiduermo serves production. Disable its draft-branch Cloudflare build trigger. Use the isolated manual preview workflow. Production requires a separately reviewed exact-source release with passing CI, auth/booking acceptance and recorded rollback version; this command cannot authorize it.",
    );
    process.exitCode = 1;
  } else {
    const parsed = ts.parseConfigFileTextToJson(
      "wrangler.jsonc",
      readFileSync("wrangler.jsonc", "utf8"),
    );
    assert.equal(parsed.error, undefined);
    mkdirSync(".wrangler", { recursive: true });
    const configPath = ".wrangler/isolated-dry-run.json";
    writeFileSync(
      configPath,
      JSON.stringify(dryRunConfig(parsed.config), null, 2),
    );
    // No caller-supplied arguments or environment switch can remove --dry-run.
    const result = spawnSync(
      process.execPath,
      [
        "node_modules/wrangler/bin/wrangler.js",
        "deploy",
        "--config",
        configPath,
        "--dry-run",
        "--outdir",
        ".wrangler/dry-run",
      ],
      { stdio: "inherit" },
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
}
