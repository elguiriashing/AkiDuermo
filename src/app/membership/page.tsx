import { suiteHref } from "@/lib/suite-navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { stayLocale } from "@/lib/akiduermo-i18n";
import { personalPremiumVisible } from "@/lib/akisuite-rollout";
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
  const personalUnlocked = await personalPremiumVisible();
  const plans = [
    ...(personalUnlocked
      ? [
          {
            name: "AkiDuermo Premium",
            kind: es ? "Para viajeros" : "For travellers",
            description: es
              ? "Ventajas personales para guardar, descubrir y planificar estancias."
              : "Personal benefits for saving, discovering and planning stays.",
            monthly: "€1.99",
            yearly: "€19.10",
            href: "mailto:alex@akipasa.com?subject=AkiDuermo%20Premium",
            hue: "mint",
          },
        ]
      : []),
    {
      name: "AkiDuermo for Business",
      kind: es ? "Para alojamientos" : "For accommodation hosts",
      description: es
        ? "Mejora un alojamiento con más presencia, contenido y herramientas de visibilidad."
        : "Upgrade one property with stronger presentation, media and visibility tools.",
      monthly: "€14.99",
      yearly: "€143.90",
      href: suiteHref("hq", locale),
      hue: "mint",
    },
    {
      name: "AkiHQ",
      kind: es ? "Gestión gratuita" : "Free management hub",
      description: es
        ? "Gestiona tus anuncios, propiedades y accesos de equipo sin una suscripción separada."
        : "Manage listings, properties and team access without a separate subscription.",
      monthly: es ? "Gratis" : "Free",
      yearly: null,
      href: suiteHref("hq", locale),
      hue: "hq",
    },
    {
      name: "AkiBusiness Standard",
      kind: es ? "Operaciones" : "Operations",
      description: es
        ? "Herramientas esenciales para una ubicación operativa."
        : "Essential operating tools for one business location.",
      monthly: "€24.99",
      yearly: "€239.90",
      href: suiteHref("business", locale),
      hue: "gold",
    },
    {
      name: "AkiBusiness Plus",
      kind: es ? "Operaciones ampliadas" : "Expanded operations",
      description: es
        ? "Más automatización, control y colaboración para el equipo."
        : "More automation, control and collaboration for the team.",
      monthly: "€44.99",
      yearly: "€431.90",
      href: suiteHref("business", locale),
      hue: "gold",
    },
    {
      name: "AkiBusiness Pro",
      kind: es ? "Herramientas avanzadas" : "Advanced tools",
      description: es
        ? "TPV, inventario y operaciones avanzadas para una ubicación."
        : "POS, inventory and advanced operations for one location.",
      monthly: "€64.99",
      yearly: "€623.90",
      href: suiteHref("business", locale),
      hue: "gold",
    },
    {
      name: "AkiEnterprise",
      kind: es ? "AkiSuite completo" : "Complete AkiSuite",
      description: es
        ? "Un paquete de AkiSuite adaptado a toda tu organización."
        : "A tailored AkiSuite bundle for your whole organisation.",
      monthly: es ? "A medida" : "Custom",
      yearly: null,
      href: "mailto:alex@akipasa.com?subject=AkiEnterprise%20enquiry",
      hue: "enterprise",
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
              ? "Planes claros para viajeros, alojamientos y operaciones. Premium personal aparece automáticamente al alcanzar el objetivo de adopción."
              : "Clear plans for travellers, properties and operations. Personal Premium appears automatically when the adoption goal is reached."}
          </p>
          {!personalUnlocked && (
            <p className={styles.gate} role="status">
              {es
                ? "Premium personal aún no está disponible; las opciones para negocios siguen visibles."
                : "Personal Premium is not open yet; business options remain visible."}
            </p>
          )}
        </header>
        <section
          className={styles.grid}
          aria-label={es ? "Planes disponibles" : "Available plans"}
        >
          {plans.map((plan) => (
            <article
              className={styles.card}
              data-hue={plan.hue}
              key={plan.name}
            >
              <span className={styles.eyebrow}>{plan.kind}</span>
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
              <div className={styles.price}>
                <strong>{plan.monthly}</strong>
                {plan.monthly.startsWith("€") && (
                  <span>{es ? "/ mes" : "/ month"}</span>
                )}
              </div>
              {plan.yearly && (
                <small className={styles.yearly}>
                  {plan.yearly}{" "}
                  {es ? "al año · 20 % menos" : "yearly · 20% off"}
                </small>
              )}
              <Link className={styles.action} href={plan.href}>
                {es ? "Explorar opciones" : "Explore options"}{" "}
                <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </section>
        <p className={styles.note}>
          {es
            ? "Precios de lanzamiento antes de impuestos aplicables. Esta página no inicia cargos; el checkout seguirá cerrado hasta su verificación."
            : "Launch prices before applicable taxes. This page initiates no charge; checkout stays closed until verified."}
        </p>
      </div>
    </StayAppShell>
  );
}
