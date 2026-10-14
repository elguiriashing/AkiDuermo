export function GET() {
  return Response.json(
    { status: "ok", product: "akiduermo" },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
