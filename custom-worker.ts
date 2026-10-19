// @ts-expect-error OpenNext generates this module during Cloudflare build.
import handler from "./.open-next/worker.js";
import {
  serveMapSnapshot,
  type MapEdgeEnv,
  type MapEdgeCache,
} from "./cloudflare/map-edge-cache";
import {
  releaseSourceCommit,
  type ReleaseAssets,
} from "./src/lib/release-source";
export { MapSnapshot } from "./cloudflare/map-snapshot";
const worker = {
  async fetch(
    request: Request,
    env: MapEdgeEnv & { ASSETS?: ReleaseAssets },
    ctx: { waitUntil(work: Promise<unknown>): void },
  ) {
    const path = new URL(request.url).pathname;
    if (path === "/api/bookings/release")
      return Response.json(
        {
          product: "akiduermo",
          sourceCommit: await releaseSourceCommit(env.ASSETS, request),
        },
        { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
      );
    if (path === "/api/map/snapshot" || path.startsWith("/api/map/tiles/"))
      return serveMapSnapshot(
        request,
        env,
        (caches as unknown as { default: MapEdgeCache }).default,
        (work) => ctx.waitUntil(work),
      );
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
