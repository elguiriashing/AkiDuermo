import { tripSchema } from "@/lib/trip-links";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { AkiDuermo } from "@/components/AkiDuermo";
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
          ? "AkiDuermo · Un buen día merece una gran estancia"
          : "AkiDuermo · A good day deserves a great stay",
    },
    description:
      locale === "es"
        ? "Encuentra hoteles, casas rurales, apartamentos y alojamientos en toda España."
        : "Find hotels, rural escapes, apartments and places to stay across Spain.",
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
  const { user } = await optionalUser();
  if (user) await queueSuitePortalWelcome("akiduermo", locale);
  const query = await searchParams;
  const trip = tripSchema.safeParse(query);
  return (
    <AkiDuermo
      initialLocale={locale}
      initialTrip={trip.success ? trip.data : undefined}
      initialType={stayQuerySchema.shape.type.catch("all").parse(query.type)}
    />
  );
}
