import { suiteHref } from "@/lib/suite-navigation";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { stayLocale } from "@/lib/akiduermo-i18n";
import { StayAppShell } from "@/components/StayAppShell";
import styles from "./membership.module.css";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Membership · AkiDuermo",
  description: "AkiDuermo and AkiSuite membership options",
  alternates: { canonical: "https://akiduermo.com/membership" },
};

export default async function StayMembershipPage() {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  const es = locale === "es";
  const plans = [
    {
      name: "AkiHQ",
      kind: es ? "Gestión gratuita" : "Free management hub",
      description: es
        ? "Gestiona tus anuncios, propiedades y accesos de equipo sin una suscripción separada."
        : "Manage listings, properties and team access without a separate subscription.",
      monthly: es ? "Gratis" : "Free",
      href: suiteHref("hq", locale),
      hue: "hq",
      benefits: es
        ? ["Fichas y ubicaciones", "Equipo y permisos", "Siempre gratis"]
        : ["Listings and locations", "Team and permissions", "Always free"],
    },
    {
      name: "AkiDuermo Premium",
      kind: es ? "Más visibilidad" : "More visibility",
      description: es
        ? "Haz que un alojamiento destaque con mejor presencia y contenido."
        : "Help one property stand out with stronger presence and content.",
      monthly: "€14.99",
      href: "mailto:alex@akipasa.com?subject=AkiDuermo%20Premium",
      hue: "mint",
      benefits: es
        ? ["Presencia Premium", "Contenido ampliado", "Más información útil"]
        : ["Premium presence", "Enhanced content", "More useful insights"],
    },
    {
      name: "AkiBusiness Standard",
      kind: es ? "Operaciones" : "Operations",
      description: es
        ? "Herramientas esenciales para una ubicación operativa."
        : "Essential operating tools for one business location.",
      monthly: "€24.99",
      href: suiteHref("business", locale),
      hue: "gold",
      benefits: es
        ? [
            "4 de 12 herramientas",
            "1 cambio por ciclo mensual",
            "Por ubicación",
          ]
        : ["4 of 12 tools", "1 change each monthly cycle", "Per location"],
    },
    {
      name: "AkiBusiness Plus",
      kind: es ? "Operaciones ampliadas" : "Expanded operations",
      description: es
        ? "Más automatización, control y colaboración para el equipo."
        : "More automation, control and collaboration for the team.",
      monthly: "€44.99",
      href: suiteHref("business", locale),
      hue: "gold",
      featured: true,
      benefits: es
        ? [
            "8 de 12 herramientas",
            "2 cambios por ciclo mensual",
            "Para equipos en crecimiento",
          ]
        : [
            "8 of 12 tools",
            "2 changes each monthly cycle",
            "For growing teams",
          ],
    },
    {
      name: "AkiBusiness Pro",
      kind: es ? "Herramientas avanzadas" : "Advanced tools",
      description: es
        ? "TPV, inventario y operaciones avanzadas para una ubicación."
        : "POS, inventory and advanced operations for one location.",
      monthly: "€64.99",
      href: suiteHref("business", locale),
      hue: "gold",
      benefits: es
        ? ["Las 12 herramientas", "Cambios sin límite", "Operaciones completas"]
        : ["All 12 tools", "Unrestricted replacements", "Complete operations"],
    },
  ];
  return (
    <StayAppShell locale={locale}>
      <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>AKIDUERMO / AKISUITE</span>
          <h1>
            {es
              ? "Tu alojamiento. Más posibilidades."
              : "Your property. More possibilities."}
          </h1>
          <p>
            {es
              ? "Cinco opciones claras. Elige visibilidad o el nivel de operaciones que necesitas."
              : "Five clear choices. Pick visibility or the level of operations you need."}
          </p>
        </header>
        <section
          className={styles.grid}
          aria-label={es ? "Planes disponibles" : "Available plans"}
        >
          {plans.map((plan) => (
            <article
              className={styles.card}
              data-hue={plan.hue}
              data-featured={
                "featured" in plan && plan.featured ? true : undefined
              }
              key={plan.name}
            >
              <div className={styles.cardTop}>
                <span className={styles.eyebrow}>{plan.kind}</span>
                {"featured" in plan && plan.featured && (
                  <span className={styles.popular}>
                    {es ? "8 herramientas" : "8 tools"}
                  </span>
                )}
              </div>
              <div className={styles.cardBrand}>
                <Image
                  src={plan.hue === "hq" ? "/brand/hq-mark.svg" : plan.hue === "mint" ? "/brand/duermo-icon.png" : "/brand/business-mark.svg"}
                  alt=""
                  width={46}
                  height={46}
                  unoptimized
                />
              </div>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className={styles.price}>
                <strong>{plan.monthly}</strong>
                {plan.monthly.startsWith("€") && (
                  <span>{es ? "/ mes" : "/ month"}</span>
                )}
              </div>
              <ul className={styles.benefits}>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
              <Link className={styles.action} href={plan.href}>
                {es ? "Explorar opciones" : "Explore options"}{" "}
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </section>
        <p className={styles.note}>
          {es
            ? "Tu selección activa permite trabajar ahora. Los cambios guardados se aplican en la próxima rotación mensual, también para las suscripciones anuales existentes. Puedes delegar las herramientas activas al equipo al instante. Listing Premium y las herramientas operativas son suscripciones distintas."
            : "Your active toolbox is available now. Saved changes apply at the next monthly rotation, including existing annual subscriptions. Delegate active tools to staff instantly. Listing Premium and operating tools are separate subscriptions."}
        </p>
        <p className={styles.note}>
          {es
            ? "Importes mensuales. Los impuestos aplicables se confirman antes del pago. Esta página no inicia cargos; el checkout seguirá cerrado hasta su verificación."
            : "Monthly amounts. Applicable taxes are confirmed before payment. This page initiates no charge; checkout stays closed until verified."}
        </p>
      </div>
    </StayAppShell>
  );
}
