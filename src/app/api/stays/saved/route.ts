import { independentAccommodationEnabled } from "@/lib/independent-accommodation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

export const dynamic = "force-dynamic";
const uuid = z.string().uuid();
const action = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("set-reminders"),
    enabled: z.boolean(),
  }),
  z.object({
    action: z.literal("set-saved"),
    venueId: uuid,
    saved: z.boolean(),
    locale: z.enum(["en", "es"]),
  }),
]);

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user)
    return Response.json(
      { authenticated: false, reminders: false, savedIds: [] },
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  const [
    { data: saved, error: savedError },
    { data: pref, error: preferenceError },
  ] = await Promise.all([
    supabase
      .from("suite_saved_stays")
      .select(independentAccommodationEnabled() ? "property_id" : "venue_id")
      .eq("profile_id", auth.user.id),
    supabase.rpc("suite_email_reminder_preferences", {
      p_event: null,
      p_stay: null,
    }),
  ]);
  if (savedError || preferenceError)
    return Response.json(
      { error: "unavailable" },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  return Response.json(
    {
      authenticated: true,
      reminders: pref?.stay_reminders === true,
      savedIds: (saved || []).map((s) =>
        "property_id" in s ? s.property_id : s.venue_id,
      ),
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin") || "";
  const host = new URL(request.url).origin;
  if (origin && origin !== host && origin !== "https://akiduermo.com")
    return Response.json({ error: "origin_mismatch" }, { status: 403 });
  const payload = await request.json().catch(() => null);
  const parsed = action.safeParse(payload);
  if (!parsed.success)
    return Response.json({ error: "invalid_request" }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user)
    return Response.json({ error: "sign_in_required" }, { status: 401 });
  if (parsed.data.action === "set-reminders") {
    const { data, error } = await supabase.rpc(
      "suite_email_reminder_preferences",
      {
        p_event: null,
        p_stay: parsed.data.enabled,
      },
    );
    if (error) return Response.json({ error: "unavailable" }, { status: 503 });
    return Response.json(
      { reminders: data?.stay_reminders === true },
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }
  const { error } = await supabase.rpc("suite_save_stay", {
    p_venue: parsed.data.venueId,
    p_saved: parsed.data.saved,
    p_locale: parsed.data.locale,
  });
  if (error) return Response.json({ error: "unavailable" }, { status: 503 });
  return Response.json(
    { saved: parsed.data.saved },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
