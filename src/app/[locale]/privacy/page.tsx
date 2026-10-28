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
    title: es ? "Privacidad" : "Privacy",
    description: es
      ? "Cómo AkiDuermo utiliza y protege tus datos."
      : "How AkiDuermo uses and protects your data.",
    alternates: {
      canonical: `https://akiduermo.com/${locale}/privacy`,
      languages: {
        en: "https://akiduermo.com/en/privacy",
        es: "https://akiduermo.com/es/privacy",
      },
    },
  };
}

export default async function PrivacyPage({
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
          AkiDuermo · {es ? "Privacidad" : "Privacy"}
        </div>
        <h1>
          {es
            ? "Tu información, bajo control"
            : "Your information, under control"}
        </h1>
        <p className="lede">
          {es
            ? "Este resumen explica los datos que usa AkiDuermo para descubrir alojamientos, guardar estancias y gestionar solicitudes de reserva."
            : "This summary explains the data AkiDuermo uses for accommodation discovery, saved stays and booking requests."}
        </p>
      </section>
      <section className="panel stack">
        <h2>{es ? "Qué guardamos" : "What we store"}</h2>
        <p>
          {es
            ? "Datos de tu cuenta compartida de AkiSuite, estancias guardadas, preferencias, solicitudes e historial de reservas, y el contenido que envías. La ubicación precisa del dispositivo no se guarda por defecto."
            : "Your shared AkiSuite account data, saved stays, preferences, booking requests and history, and content you submit. Precise device location is not stored by default."}
        </p>
        <h2>{es ? "Cómo se usa" : "How it is used"}</h2>
        <p>
          {es
            ? "Para prestar y proteger el servicio, mostrar disponibilidad, tramitar solicitudes con el alojamiento y ofrecer estadísticas agregadas. No vendemos datos personales."
            : "To provide and protect the service, show availability, process requests with the accommodation provider and produce aggregate statistics. We do not sell personal data."}
        </p>
        <h2>{es ? "Cuenta y proveedores" : "Account and providers"}</h2>
        <p>
          {es
            ? "AkiDuermo conserva la identidad compartida y los registros de alojamiento existentes de AkiSuite. Solo se comparten con el alojamiento los datos necesarios para gestionar tu solicitud."
            : "AkiDuermo retains the existing shared AkiSuite identity and accommodation records. Only the details needed to handle your request are shared with the accommodation provider."}
        </p>
        <h2>{es ? "Lista de lanzamiento" : "Launch waitlist"}</h2>
        <p>
          {es
            ? "Si solicitas noticias del lanzamiento, recogemos nombre, email, ciudad o zona, perfil de interés (particular o empresa), idioma, intereses opcionales y tus elecciones de consentimiento. La lista no requiere crear una cuenta ni realizar reservas. Enviamos un enlace de verificación antes de confirmar la suscripción."
            : "If you request launch updates, we collect your name, email, city or area, audience (individual or business), language, optional interests and consent choices. Joining the list does not require an account or a booking. We send an email verification link before confirming your subscription."}
        </p>
        <p>
          {es
            ? "Los avisos relacionados con el lanzamiento requieren tu consentimiento y email verificado. Las promociones requieren un consentimiento adicional, separado y opcional. Usamos Cloudflare Turnstile contra abusos y un proveedor de correo para entregar la verificación. Los contadores antiabuso se almacenan como identificadores cifrados con clave, no como una lista pública de IP."
            : "Launch-related notices require your consent and a verified email. Promotional messages require separate, optional consent. We use Cloudflare Turnstile to prevent abuse and an email provider to deliver verification. Anti-abuse counters use keyed hashes rather than public IP lists."}
        </p>
        <p>
          {es
            ? "El plazo previsto es de 30 días para solicitudes no verificadas y hasta 12 meses para las verificadas; los registros de límite de solicitudes se depuran tras 2 días. Puedes retirar el consentimiento y solicitar acceso o eliminación en privacy@akipasa.com. El responsable es AkiPasa Marketing S.L."
            : "Retention is planned for 30 days for unverified requests and up to 12 months after verification; rate-limit records are cleared after two days. You can withdraw consent and request access or deletion at privacy@akipasa.com. The data controller is AkiPasa Marketing S.L."}
        </p>
        <h2>{es ? "Tus derechos" : "Your rights"}</h2>
        <p>
          {es
            ? "Puedes revisar tus preferencias desde Ajustes y solicitar acceso, exportación, corrección o eliminación escribiendo a privacy@akipasa.com."
            : "You can review preferences in Settings and request access, export, correction or deletion at privacy@akipasa.com."}
        </p>
        <p>
          <Link href="/settings">{es ? "Abrir Ajustes" : "Open Settings"}</Link>
          {" · "}
          <Link href={`/${locale}/terms`}>{es ? "Condiciones" : "Terms"}</Link>
          {" · "}
          <Link href="/">
            {es ? "Volver a AkiDuermo" : "Back to AkiDuermo"}
          </Link>
        </p>
        <small>
          {es
            ? "Última actualización: 28 de octubre de 2026. Pendiente de revisión jurídica profesional antes del lanzamiento comercial."
            : "Last updated: 28 October 2026. Pending professional legal review before commercial launch."}
        </small>
      </section>
    </main>
  );
}
