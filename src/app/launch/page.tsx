import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { stayLocale } from "@/lib/akiduermo-i18n";
import styles from "./launch.module.css";

/** Deliberately noindexed preview until the verified waitlist backend is live. */
export const metadata: Metadata = {
  title: "AkiDuermo | Launch preview",
  description: "Preview of the upcoming AkiDuermo experience.",
  robots: { index: false, follow: false },
};

export default async function LaunchPreviewPage() {
  const locale = stayLocale((await headers()).get("x-akipasa-locale"));
  const es = locale === "es";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href={"/?lang=" + locale} className={styles.brand}>
          <Image
            src="/brand/v3/duermo.svg"
            alt=""
            width={48}
            height={48}
            unoptimized
          />
          <strong>AkiDuermo<span>.</span></strong>
        </Link>
        <span className={styles.tag}>
          {es ? "Próximamente" : "Coming soon"}
        </span>
      </header>

      <section className={styles.main} aria-labelledby="launch-title">
        <span className={styles.eyebrow}>
          {es ? "En desarrollo" : "Under development"}
        </span>
        <h1 id="launch-title" className={styles.title}>
          {es
            ? "Estamos preparando tu próximo alojamiento."
            : "Your next stay is being built."}
        </h1>
        <p className={styles.copy}>
          {es
            ? "AkiDuermo está en desarrollo. Todavía no ofrecemos un catálogo activo ni reservas nuevas desde esta página. Estamos preparando una experiencia de estancias locales más clara y útil."
            : "AkiDuermo is under development. We are not presenting a live accommodation catalogue or accepting new bookings from this page. We're building a clearer, more useful local stays experience."}
        </p>
        <section className={styles.detail} aria-label={es ? "Lanzamiento" : "Launch"}>
          <h2>{es ? "Una lista de espera, sin spam" : "A waitlist without the spam"}</h2>
          <p>
            {es
              ? "Estamos preparando un registro para personas y negocios, por ciudad e intereses. Se abrirá cuando la verificación del email y la privacidad estén listas. Esta vista previa no recoge datos."
              : "We're preparing a sign-up for individuals and businesses, by city and interests. It opens once email verification and privacy controls are ready. This preview does not collect information."}
          </p>
          <div className={styles.pills}>
            <span className={styles.pill}>{es ? "Personas" : "Individuals"}</span>
            <span className={styles.pill}>{es ? "Negocios" : "Businesses"}</span>
            <span className={styles.pill}>{es ? "ES / EN" : "EN / ES"}</span>
          </div>
        </section>
        <nav className={styles.actions} aria-label={es ? "Opciones" : "Options"}>
          <Link href={"/hq-login?lang=" + locale}>
            {es ? "Acceso para negocios" : "Business sign in"}
          </Link>
          <Link href={"/account?lang=" + locale}>
            {es ? "Mi cuenta" : "My account"}
          </Link>
          <Link href={"https://akipasa.com/" + locale}>
            {es ? "Descubre planes en AkiPasa" : "Find plans on AkiPasa"}
          </Link>
        </nav>
      </section>
      <footer className={styles.footer}>
        <span>AkiDuermo · {es ? "Una experiencia en construcción" : "An experience in progress"}</span>
        <Link href={"/" + locale + "/privacy"}>
          {es ? "Privacidad" : "Privacy"}
        </Link>
      </footer>
    </main>
  );
}
