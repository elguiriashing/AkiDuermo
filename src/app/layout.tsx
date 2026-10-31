import { ageAssuranceEnforced } from "@/lib/age-assurance-server";
import { optionalUser } from "@/lib/auth";
import { accountTrackingAllowed } from "@/lib/account-eligibility";
import "./globals.css";
import "./compact-app.css";
import "./brand.css";
import "./appearance.css";
import "./tablet-responsive.css";
import "./portal-unity.css";
import type { Metadata, Viewport } from "next";
import { ConsentAnalytics } from "@/components/ConsentAnalytics";
import { PersonalisationConsent } from "@/components/PersonalisationConsent";
import { PwaRegistration } from "@/components/PwaRegistration";
import { ThemeManager } from "@/components/ThemeModeControls";
import { headers } from "next/headers";
import { isLocale } from "@/lib/config";
import { serializeJsonLd } from "@/lib/seo";

export async function generateViewport(): Promise<Viewport> {
  return {
    themeColor: "#143c43",
  };
}

export const metadata: Metadata = {
  metadataBase: new URL("https://akiduermo.com"),
  title: { default: "AkiDuermo", template: "%s · AkiDuermo" },
  description:
    "Descubre alojamientos en España. Discover accommodation across Spain.",
  applicationName: "AkiDuermo",
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "AkiDuermo",
    title: "AkiDuermo",
    url: "https://akiduermo.com",
  },
  icons: { icon: "/brand/v3/duermo.svg", apple: "/brand/v3/duermo-180.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let trackingAllowed = !ageAssuranceEnforced();
  try {
    const { supabase, user } = await optionalUser();
    if (user) trackingAllowed = await accountTrackingAllowed(supabase, user.id);
  } catch {
    trackingAllowed = false;
  }

  const requestHeaders = await headers();
  const product: string = "akiduermo";
  const isAkiDuermo = product === "akiduermo";
  const isAkiBusiness = product === "akibusiness";
  const isAkiConduzco = product === "akiconduzco";
  const requestLocale = requestHeaders.get("x-akipasa-locale");
  const locale =
    requestLocale && isLocale(requestLocale) ? requestLocale : "es";
  return (
    <html lang={locale}>
      <body
        data-product={
          isAkiDuermo
            ? "akiduermo"
            : isAkiBusiness
              ? "akibusiness"
              : isAkiConduzco
                ? "akiconduzco"
                : undefined
        }
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://akiduermo.com/#website",
              name: isAkiConduzco
                ? "AkiConduzco"
                : isAkiDuermo
                  ? "AkiDuermo"
                  : isAkiBusiness
                    ? "AkiBusiness"
                    : "AkiPasa",
              url: isAkiConduzco
                ? "https://akicoches.com"
                : isAkiDuermo
                  ? "https://akiduermo.com"
                  : isAkiBusiness
                    ? "https://akibusiness.com"
                    : "https://akiduermo.com",
              inLanguage: ["es", "en"],
            }),
          }}
        />
        <PwaRegistration />
        <ThemeManager />
        {children}
        <ConsentAnalytics trackingAllowed={trackingAllowed} />
        <PersonalisationConsent locale={locale} />
      </body>
    </html>
  );
}
