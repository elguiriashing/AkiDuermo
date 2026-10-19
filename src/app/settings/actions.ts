"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { headers } from "next/headers";
import { publicRequestOrigin } from "@/lib/public-request-origin";

export async function changeStayAccountEmail(form: FormData) {
  const parsed = z
    .object({
      locale: z.enum(["en", "es"]),
      email: z.string().trim().email().max(254),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/settings?error=email");
  const { locale, email } = parsed.data;
  const origin = publicRequestOrigin(new Headers(await headers()));
  const { supabase, user } = await requireUser(locale, "/settings");
  if (user.email?.toLowerCase() === email.toLowerCase())
    redirect("/settings?error=same");
  const { error } = await supabase.auth.updateUser(
    { email: email.toLowerCase() },
    {
      emailRedirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent("/settings?email=confirmed")}`,
    },
  );
  redirect(`/settings?${error ? "error=email" : "email=pending"}`);
}

export async function resetStayPassword(form: FormData) {
  const locale = form.get("locale") === "es" ? "es" : "en";
  const origin = publicRequestOrigin(new Headers(await headers()));
  const { supabase, user } = await requireUser(locale, "/settings");
  if (!user.email) redirect("/settings?error=password");
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${origin}/${locale}/auth/callback?next=${encodeURIComponent(`/${locale}/auth/recover?next=${encodeURIComponent("/settings")}`)}`,
  });
  redirect(`/settings?${error ? "error=password" : "password=sent"}`);
}
