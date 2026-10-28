import { tripSchema } from "@/lib/trip-links";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AkiDuermo } from "@/components/AkiDuermo";
import { LaunchWaitlist } from "@/components/LaunchWaitlist";
import { stayQuerySchema } from "@/lib/akiduermo";
import { stayLocale } from "@/lib/akiduermo-i18n";
import { optionalUser } from "@/lib/auth";
import { queueSuitePortalWelcome } from "@/lib/suite-welcome";

export async function generateMetadata(): Promise<Metadata> {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  return {
    title: {
      absolute:
        locale === "es"
          ? "AkiDuermo · Estamos preparando algo nuevo"
          : "AkiDuermo · Something new is on the way",
    },
    description:
      locale === "es"
        ? "AkiDuermo está en desarrollo. Apúntate para saber cuándo llegará a tu zona. Aún no admitimos reservas."
        : "AkiDuermo is under development. Join the launch list for your area. Bookings are not available yet.",
    robots: { index: true, follow: true },
    alternates: { canonical: "https://akiduermo.com" },
  };
}
export default async function AkiDuermoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  const query = await searchParams;
  const legacyIntent = ["q", "type", "checkIn", "checkOut", "guests", "latitude", "longitude"].some((key) => key in query);
  if (!legacyIntent) return (
    <LaunchWaitlist product="duermo" locale={locale} siteKey={process.env.NEXT_PUBLIC_LAUNCH_WAITLIST_TURNSTILE_SITE_KEY || null} />
  );
  const { user } = await optionalUser();
  if (user) await queueSuitePortalWelcome("akiduermo", locale);
  const trip = tripSchema.safeParse(query);
  return (
    <AkiDuermo
      initialLocale={locale}
      initialTrip={trip.success ? trip.data : undefined}
      initialType={stayQuerySchema.shape.type.catch("all").parse(query.type)}
    />
  );
}
