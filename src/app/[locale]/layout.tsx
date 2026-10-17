import "../stay-auth.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";
import { LocaleDocumentLanguage } from "@/components/LocaleDocumentLanguage";
import { PortalLogo } from "@/components/PortalLogo";
import { PortalHeaderTools } from "@/components/PortalHeaderTools";
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      <LocaleDocumentLanguage locale={locale} />
      <div className="akiduermo-auth-host">
        <header className="akiduermo-auth-header">
          <Link
            href={`/?lang=${locale}`}
            className="akiduermo-auth-brand"
            aria-label="AkiDuermo"
          >
            <PortalLogo product="duermo" />
          </Link>
          <PortalHeaderTools locale={locale} product="duermo" />
        </header>
        {children}
      </div>
    </>
  );
}
