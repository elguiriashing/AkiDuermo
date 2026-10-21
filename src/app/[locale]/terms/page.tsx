import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const es = locale === "es";
  return {
    title: es ? "Condiciones de uso" : "Terms of use",
    description: es
      ? "Condiciones de uso de AkiDuermo."
      : "AkiDuermo terms of use.",
    alternates: {
      canonical: `https://akiduermo.com/${locale}/terms`,
      languages: {
        en: "https://akiduermo.com/en/terms",
        es: "https://akiduermo.com/es/terms",
      },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const es = locale === "es";
  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">
          AkiDuermo · {es ? "Condiciones" : "Terms"}
        </div>
        <h1>
          {es
            ? "Usar AkiDuermo de forma responsable"
            : "Using AkiDuermo responsibly"}
        </h1>
        <p className="lede">
          {es
            ? "Estas condiciones cubren la búsqueda, las cuentas y las solicitudes de reserva de AkiDuermo."
            : "These terms cover AkiDuermo discovery, accounts and booking requests."}
        </p>
      </section>
      <section className="panel stack">
        <h2>{es ? "Alojamientos y contenido" : "Properties and content"}</h2>
        <p>
          {es
            ? "Los negocios y usuarios deben publicar información verdadera, autorizada y legal. Podemos moderar, ocultar o retirar contenido engañoso, inseguro o infractor."
            : "Businesses and users must publish truthful, authorised and lawful information. We may moderate, hide or remove misleading, unsafe or infringing content."}
        </p>
        <h2>
          {es ? "Disponibilidad y reservas" : "Availability and bookings"}
        </h2>
        <p>
          {es
            ? "Los precios y la disponibilidad se vuelven a comprobar al solicitar. Una solicitud no queda confirmada hasta que el alojamiento la acepte. No se procesan pagos en línea en AkiDuermo. Se aplican las condiciones y la política de cancelación mostradas por el alojamiento."
            : "Prices and availability are checked again when you request a stay. A request is not confirmed until the accommodation provider accepts it. AkiDuermo does not process online payments. The provider's displayed terms and cancellation policy apply."}
        </p>
        <h2>
          {es ? "Cuentas y acceso empresarial" : "Accounts and business access"}
        </h2>
        <p>
          {es
            ? "Debes mantener segura tu cuenta compartida de AkiSuite. Podemos solicitar prueba de representación antes de permitir que una empresa gestione un alojamiento; el acceso del equipo solo debe darse a personas autorizadas."
            : "You must keep your shared AkiSuite account secure. We may request proof of authority before a business can manage an accommodation listing; team access must be limited to authorised people."}
        </p>
        <h2>{es ? "Contacto" : "Contact"}</h2>
        <p>support@akipasa.com</p>
        <p>
          <Link href={`/${locale}/privacy`}>
            {es ? "Privacidad" : "Privacy"}
          </Link>
          {" · "}
          <Link href="/">
            {es ? "Volver a AkiDuermo" : "Back to AkiDuermo"}
          </Link>
        </p>
        <small>
          {es
            ? "Versión preliminar, 19 de octubre de 2026. Pendiente de revisión jurídica profesional antes del lanzamiento comercial."
            : "Preview version, 19 October 2026. Pending professional legal review before commercial launch."}
        </small>
      </section>
    </main>
  );
}
