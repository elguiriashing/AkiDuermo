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
  return { themeColor: "#35c6a6" };
}

export const metadata: Metadata = {
  metadataBase: new URL("https://akiduermo.com"),
  title: { default: "AkiDuermo", template: "%s · AkiDuermo" },
  description:
    "Descubre alojamientos en España. Discover accommodation across Spain.",
  applicationName: "AkiDuermo",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "AkiDuermo",
    title: "AkiDuermo",
    url: "https://akiduermo.com",
  },
  icons: { icon: "/pwa/duermo-192.png", apple: "/pwa/duermo-192.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const requestHeaders = await headers();
  const requestLocale = requestHeaders.get("x-akipasa-locale");
  const locale =
    requestLocale && isLocale(requestLocale) ? requestLocale : "es";
  return (
    <html lang={locale}>
      <body data-product="akiduermo">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://akiduermo.com/#website",
              name: "AkiDuermo",
              url: "https://akiduermo.com",
              inLanguage: ["es", "en"],
            }),
          }}
        />
        <PwaRegistration />
        <ThemeManager />
        {children}
        <ConsentAnalytics />
        <PersonalisationConsent locale={locale} />
      </body>
    </html>
  );
}
