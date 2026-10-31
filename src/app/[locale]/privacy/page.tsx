import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";
import { ProductPrivacy } from "@/components/ProductPrivacy";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ProductPrivacy locale={locale} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return {
    title: locale === "es" ? "Privacidad de AkiDuermo" : "AkiDuermo privacy",
    description:
      locale === "es"
        ? "Datos, conservación y eliminación de cuenta de AkiDuermo."
        : "AkiDuermo data, retention and account deletion.",
    alternates: {
      canonical: `https://akiduermo.com/${locale}/privacy`,
      languages: {
        en: "https://akiduermo.com/en/privacy",
        es: "https://akiduermo.com/es/privacy",
      },
    },
  };
}

