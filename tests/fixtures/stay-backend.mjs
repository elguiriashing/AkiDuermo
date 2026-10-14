/** Disposable local HTTP fixture; no database, auth provider or email writes. */
import { createServer } from "node:http";
const property = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "fixture-stay",
  name: "Synthetic fixture stay",
  address: "Synthetic address, Fuengirola",
  location: { type: "Point", coordinates: [-4.624, 36.539] },
  description_es: "Alojamiento sintético para pruebas locales.",
  description_en: "Synthetic accommodation for local tests.",
  accommodation_type: "hotel",
  website_url: null,
  cities: { name_es: "Fuengirola" },
};
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:3996");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && !url.pathname.startsWith("/rest/v1/rpc/")) {
    res.writeHead(405);
    return res.end("{}");
  }
  if (url.pathname === "/rest/v1/venues")
    return res.end(
      JSON.stringify(
        url.searchParams.get("slug") === "eq.fixture-stay" ? property : [],
      ),
    );
  if (url.pathname === "/rest/v1/rpc/accommodation_public_settings")
    return res.end(JSON.stringify({ mode: "request" }));
  if (url.pathname === "/rest/v1/venue_media_placements") return res.end("[]");
  if (url.pathname === "/rest/v1/rpc/map_snapshot_compact")
    return res.end("[]");
  if (url.pathname.startsWith("/rest/v1/")) return res.end("[]");
  res.writeHead(404);
  res.end("{}");
});
server.listen(3996, "127.0.0.1", () =>
  console.log("Disposable stay fixture http://127.0.0.1:3996"),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
