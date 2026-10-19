import { createSupabasePublicClient } from "./supabase/public";

/** Server-owned rollout gate. Missing configuration, row or access fails closed. */
export async function personalPremiumVisible(): Promise<boolean> {
  try {
    const { data, error } = await createSupabasePublicClient()
      .from("feature_flags")
      .select("enabled")
      .eq("key", "personal_premium_unlocked")
      .maybeSingle();
    return !error && data?.enabled === true;
  } catch {
    return false;
  }
}
