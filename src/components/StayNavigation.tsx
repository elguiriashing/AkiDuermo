"use client";
import { DiscoveryNavigation } from "./DiscoveryNavigation";
import type { StayLocale } from "@/lib/akiduermo-i18n";
export function StayNavigation({ locale }: { locale: StayLocale }) {
  return <DiscoveryNavigation locale={locale} product="duermo" />;
}
