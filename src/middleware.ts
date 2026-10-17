import { NextResponse, type NextRequest } from "next/server";
import { refreshSession } from "@/lib/supabase/middleware";
import { isStayRequestOrigin } from "@/lib/public-request-origin";
import { stayLocale } from "@/lib/akiduermo-i18n";
import { stayHostRoute, stayHostMethodAllowed } from "@/lib/akiduermo-routing";
import { stripCrossProductCredentials } from "@/lib/cross-product-query";
function crossOriginRedirect(target: URL) {
  stripCrossProductCredentials(target);
  // An explicit harmless fragment prevents browser inheritance of a source fragment,
  // which is never available to the server for inspection.
  target.hash = "redirected";
  return NextResponse.redirect(target, 307);
}
export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || request.nextUrl.host;
  const protocol = ["localhost", "127.0.0.1"].includes(host.split(":")[0])
    ? request.nextUrl.protocol
    : "https:";
  if (!isStayRequestOrigin(`${protocol}//${host}`))
    return new NextResponse(null, { status: 421 });
  request.headers.delete("x-akipasa-membership-next");
  request.headers.set("x-akipasa-product", "akiduermo");
  const locale = stayLocale(
    request.nextUrl.searchParams.get("lang"),
    request.cookies.get("akiduermo_locale")?.value,
  );
  request.headers.set("x-akipasa-locale", locale);
  const path = request.nextUrl.pathname;
  if (/^\/(en|es)\/?$/.test(path)) {
    if (!["GET", "HEAD"].includes(request.method))
      return new NextResponse(null, { status: 404 });
    const target = request.nextUrl.clone();
    target.pathname = "/";
    target.searchParams.set("lang", path.split("/")[1]);
    return NextResponse.redirect(target, 308);
  }
  const membership = path.match(
    /^\/(?:(en|es)\/)?(membership|memberships|account\/(?:membership|memberships|subscription))\/?$/,
  );
  if (membership) {
    if (!["GET", "HEAD"].includes(request.method))
      return new NextResponse(null, { status: 404 });
    const target = new URL(
      `/${membership[1] || locale}/${membership[2].startsWith("account/") ? "account/subscription" : "membership"}`,
      "https://akipasa.com",
    );
    target.search = request.nextUrl.search;
    target.searchParams.set("from", "akiduermo");
    return crossOriginRedirect(target);
  }
  if (!stayHostMethodAllowed(path, request.method))
    return new NextResponse(null, { status: 404 });
  const route = stayHostRoute(path);
  const target = request.nextUrl.clone();
  target.pathname = route.path;
  if (route.kind === "legacy") target.searchParams.set("lang", route.locale!);
  if (route.kind === "legacy" || route.kind === "canonical")
    return NextResponse.redirect(target, 308);
  if (route.kind === "reject") return new NextResponse(null, { status: 404 });
  if (route.kind === "primary") {
    target.hostname = "akipasa.com";
    target.protocol = "https:";
    target.port = "";
    return crossOriginRedirect(new URL(target.toString()));
  }
  const session = await refreshSession(request);
  // Product routes are actual root routes in this independent app. Rewriting
  // back through the legacy internal prefix causes a canonical redirect cycle.
  const response = NextResponse.next({ request: { headers: request.headers } });
  session.cookies
    .getAll()
    .forEach(({ name, value, ...options }) =>
      response.cookies.set(name, value, options),
    );
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
