import Link from "next/link";
import { headers } from "next/headers";
import { suiteHref } from "@/lib/suite-navigation";
import { stayLocale } from "@/lib/akiduermo-i18n";
import { StayAppShell } from "@/components/StayAppShell";
import {
  AkiSuiteAudienceStudio,
  type MembershipAudienceOffer,
} from "@/components/AkiSuiteAudienceStudio";

import {
  approvedPricing,
  monthlyPrice,
  premiumName,
} from "@/lib/approved-pricing";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Membership · AkiDuermo",
  description: "Personal and business memberships for AkiDuermo",
  alternates: { canonical: "https://akiduermo.com/membership" },
};

export default async function StayMembershipPage() {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  const es = locale === "es";
  const individual: [MembershipAudienceOffer, MembershipAudienceOffer] = [
    {
      id: "personal-free",
      name: "AkiDuermo Free",
      label: es ? "Para particulares" : "For individuals",
      description: es
        ? "Descubre alojamientos y organiza tus viajes sin cuota de membresía."
        : "Find accommodation and plan your trips without a membership fee.",
      price: es ? "Gratis" : "Free",
      benefits: es
        ? [
            "Descubre alojamientos",
            "Guarda tus favoritos",
            "Sin suscripción obligatoria",
          ]
        : [
            "Discover accommodation",
            "Save favourite stays",
            "No required subscription",
          ],
      action: (
        <Link href="/">
          {es ? "Explorar alojamientos" : "Explore stays"} ↗
        </Link>
      ),
    },
    {
      id: "personal-premium",
      name: premiumName("akiduermo", "individual", locale),
      label: es ? "Premium personal" : "Personal Premium",
      description: es
        ? "Ventajas para viajeros, independientes de las mejoras para propietarios."
        : "Traveller benefits, separate from upgrades for property owners.",
      price: monthlyPrice(
        approvedPricing.discovery.akiduermo.individualCents,
        locale,
      ),
      period: es ? "/ mes" : "/ month",
      benefits: es
        ? [
            "Para huéspedes, no propietarios",
            "Sin compra hasta el lanzamiento",
            "Sin herramientas de AkiBusiness",
          ]
        : [
            "For travellers, not property owners",
            "New purchases not yet available",
            "No AkiBusiness tools included",
          ],
      action: (
        <button type="button" disabled>
          {es ? "Aún no disponible" : "Not available yet"}
        </button>
      ),
      note: es
        ? "Los planes personales existentes no se modifican."
        : "Existing personal subscriptions are unchanged.",
      highlighted: true,
    },
  ];
  const business: [MembershipAudienceOffer, MembershipAudienceOffer] = [
    {
      id: "akihq-free",
      name: "AkiHQ",
      label: es ? "Gestión gratuita" : "Free business management",
      description: es
        ? "Tu centro para gestionar gratis tu alojamiento de AkiDuermo."
        : "Your home for managing your free AkiDuermo property listing.",
      price: es ? "Gratis" : "Free",
      benefits: es
        ? ["Propiedades y fichas", "Acceso del equipo", "Siempre gratis"]
        : ["Properties and listings", "Team access", "Always free"],
      action: (
        <Link href={suiteHref("hq", locale)}>
          {es ? "Abrir AkiHQ gratis" : "Open free AkiHQ"} ↗
        </Link>
      ),
    },
    {
      id: "akiduermo-listing-premium",
      name: premiumName("akiduermo", "business", locale),
      label: es
        ? "Premium empresarial para AkiHQ"
        : "Business Premium for AkiHQ",
      description: es
        ? "Una ficha básica cuenta lo esencial. Presenta mejor tu alojamiento con contenido ampliado y herramientas Premium en AkiHQ."
        : "A basic listing covers the essentials. Show more of your property with enhanced media and Premium listing tools in AkiHQ.",
      price: monthlyPrice(
        approvedPricing.discovery.akiduermo.businessCents,
        locale,
      ),
      period: es ? "/ mes por propiedad" : "/ month per property",
      benefits: es
        ? [
            "Visibilidad Premium de tu propiedad",
            "Contenido multimedia ampliado",
            "AkiBusiness se contrata aparte",
          ]
        : [
            "Premium property presence",
            "Enhanced accommodation media",
            "AkiBusiness sold separately",
          ],
      highlighted: true,
      action: (
        <a href="mailto:alex@akipasa.com?subject=AkiDuermo%20Premium%20business">
          {es
            ? "Quiero mejorar mi alojamiento"
            : "Upgrade my property presence"}{" "}
          ↗
        </a>
      ),
      note: es
        ? "Precio mensual aprobado · consulta la disponibilidad"
        : "Approved monthly price · enquire about availability",
    },
  ];
  return (
    <StayAppShell locale={locale}>
      <AkiSuiteAudienceStudio
        theme="mint"
        locale={locale}
        product="AkiDuermo"
        eyebrow="AKIDUERMO / AKISUITE"
        title={
          es
            ? "Tu próxima estancia, a tu manera."
            : "A better stay starts here."
        }
        description={
          es
            ? "Membresías para viajeros y propietarios, claramente separadas."
            : "Separate memberships for travellers and property owners."
        }
        individual={individual}
        business={business}
        businessSoftwareHref={suiteHref("business", locale)}
        footerNote={
          <p>
            {es
              ? "Premium personal, Premium de alojamientos y AkiBusiness son suscripciones independientes. Ninguna compra se realiza aquí."
              : "Personal Premium, property Premium and AkiBusiness are separate subscriptions. This page does not collect payment."}
          </p>
        }
      />
    </StayAppShell>
  );
}
