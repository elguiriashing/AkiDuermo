"use client";
import { DiscoveryNavigation } from "./DiscoveryNavigation";
import { signOutStay } from "@/app/account/actions";
import type { StayLocale } from "@/lib/akiduermo-i18n";
export function StayNavigation({
  locale,
  onLanguageChange,
}: {
  locale: StayLocale;
  onLanguageChange?: () => void;
}) {
  return (
    <DiscoveryNavigation
      locale={locale}
      product="duermo"
      onLanguageChange={onLanguageChange}
    >
      <form action={signOutStay}>
        <button type="submit">
          {locale === "es" ? "Cerrar sesión" : "Sign out"}
        </button>
      </form>
    </DiscoveryNavigation>
  );
}
