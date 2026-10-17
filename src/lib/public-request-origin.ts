/** Exact origins only. Never infer trust from an arbitrary Host or Origin. */
const canonicalOrigin = "https://akiduermo.com";
function trustedOrigins() {
  const origins = new Set([canonicalOrigin, "https://akiduermo.akipasa.com"]);
  for (const candidate of (
    process.env.AKISUITE_ALLOWED_PREVIEW_ORIGINS || ""
  ).split(",")) {
    try {
      const url = new URL(candidate.trim());
      if (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        url.pathname === "/" &&
        !url.search &&
        !url.hash
      )
        origins.add(url.origin);
    } catch {}
  }
  return origins;
}
export function isStayRequestOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (
      trustedOrigins().has(url.origin) ||
      (["localhost", "127.0.0.1"].includes(url.hostname) &&
        ["http:", "https:"].includes(url.protocol))
    );
  } catch {
    return false;
  }
}
function first(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
}
export function publicRequestOrigin(
  headers: Headers,
  fallback = canonicalOrigin,
) {
  void fallback; // Caller fallbacks never widen this product's trust boundary.
  const host = first(headers.get("host"));
  const proto = ["localhost", "127.0.0.1"].includes(host.split(":")[0])
    ? "http"
    : "https";
  const origin = `${proto}://${host}`;
  if (isStayRequestOrigin(origin)) return new URL(origin).origin;
  return canonicalOrigin;
}
