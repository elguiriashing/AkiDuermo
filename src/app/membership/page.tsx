import type { Metadata } from "next";
import { headers } from "next/headers";
import { SuitePricingExperience } from "@/components/SuitePricingExperience";
import { personalPremiumVisible } from "@/lib/akisuite-rollout";
import { stayLocale } from "@/lib/akiduermo-i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Memberships · AkiDuermo",
  description: "AkiDuermo Premium, host upgrades, AkiBusiness and AkiEnterprise.",
  alternates: { canonical: "https://akiduermo.com/membership" },
};

export default async function MembershipPage() {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  return (
    <SuitePricingExperience
      locale={locale}
      product="akiduermo"
      personalUnlocked={await personalPremiumVisible()}
      logo="/brand/duermo-icon.png"
    />
  );
}
