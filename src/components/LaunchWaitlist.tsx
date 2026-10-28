"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./LaunchWaitlist.module.css";

type Product = "duermo" | "coches";
type Locale = "es" | "en";
type FormStatus =
  | "idle"
  | "submitting"
  | "check_email"
  | "try_later"
  | "verification_failed"
  | "temporarily_unavailable";

const COPY = {
  duermo: {
    es: {
      eyebrow: "UN NUEVO MODO DE DESCUBRIR DÓNDE QUEDARTE",
      title: "Los mejores viajes empiezan antes de hacer la maleta.",
      description:
        "Estamos preparando AkiDuermo, una nueva forma de descubrir alojamientos y escapadas. Aún no aceptamos reservas desde esta web.",
      launch: "Apúntate para el lanzamiento",
      launchHint: "Te avisaremos cuando esté listo en tu zona, sin prometer fechas.",
      business: "Tengo un alojamiento",
    },
    en: {
      eyebrow: "A NEW WAY TO FIND YOUR NEXT STAY",
      title: "Better trips start before you pack.",
      description:
        "We're building AkiDuermo, a new way to find stays and getaways. Bookings are not open through this website yet.",
      launch: "Join the launch list",
      launchHint: "We'll let you know when it's ready in your area. No invented launch dates.",
      business: "I manage accommodation",
    },
  },
  coches: {
    es: {
      eyebrow: "TU PRÓXIMO VIAJE ESTÁ EN MARCHA",
      title: "Más libertad. Menos complicaciones.",
      description:
        "Estamos preparando AkiCoches para descubrir opciones de movilidad y alquiler de coches. Aún no ofrecemos reservas desde esta web.",
      launch: "Apúntate para el lanzamiento",
      launchHint: "Te avisaremos cuando esté disponible en tu zona, sin fechas inventadas.",
      business: "Tengo una empresa de alquiler",
    },
    en: {
      eyebrow: "YOUR NEXT JOURNEY IS TAKING SHAPE",
      title: "More freedom. Less hassle.",
      description:
        "We're building AkiCoches to help you discover local car rentals and travel options. Bookings are not open here yet.",
      launch: "Join the launch list",
      launchHint: "We'll let you know when it's available in your area, without made-up dates.",
      business: "I run a rental business",
    },
  },
} as const;

const formCopy = {
  es: {
    name: "Nombre",
    email: "Correo electrónico",
    city: "Ciudad o zona de interés",
    audience: "Me interesa como",
    person: "Persona / viajero",
    business: "Negocio / profesional",
    interests: "¿Qué te interesa? (opcional)",
    interestsPlaceholder: "Por ejemplo, escapadas de fin de semana",
    consent:
      "Quiero recibir el correo de confirmación y avisos relacionados con el lanzamiento de este producto.",
    marketing:
      "También quiero recibir promociones y comunicaciones comerciales (opcional).",
    submit: "Avisadme del lanzamiento",
    sending: "Enviando...",
    check_email:
      "Comprueba tu correo. Si no estabas ya apuntado, recibirás un enlace para confirmar tu dirección.",
    try_later: "Demasiados intentos. Vuelve a probar más tarde.",
    verification_failed:
      "Completa la verificación de seguridad y vuelve a intentarlo.",
    temporarily_unavailable:
      "Ahora mismo no podemos registrar tu solicitud. Prueba de nuevo más tarde.",
    no_challenge:
      "Estamos terminando la configuración de las inscripciones seguras. El formulario aún no está activo.",
    legal: "Puedes darte de baja o pedir que borremos tus datos cuando quieras.",
    privacy: "Política de privacidad",
    existing: "¿Ya tienes cuenta?",
    account: "Acceder a mi cuenta",
    discover: "Descubre qué hacer mientras tanto en AkiPasa",
  },
  en: {
    name: "Name",
    email: "Email address",
    city: "City or area of interest",
    audience: "I'm interested as a",
    person: "Individual / traveller",
    business: "Business / professional",
    interests: "What are you interested in? (optional)",
    interestsPlaceholder: "For example, weekend escapes",
    consent:
      "I want an email confirmation and updates related to this product's launch.",
    marketing:
      "I also want promotions and marketing messages (optional).",
    submit: "Notify me at launch",
    sending: "Sending...",
    check_email:
      "Check your inbox. If you're not already subscribed, you'll receive a link to confirm your email.",
    try_later: "Too many attempts. Please try again later.",
    verification_failed:
      "Complete the security check and try again.",
    temporarily_unavailable:
      "We can't register your request right now. Please try again later.",
    no_challenge:
      "Secure registration is still being configured. Signups aren't open yet.",
    legal: "You can unsubscribe or request deletion of your data at any time.",
    privacy: "Privacy policy",
    existing: "Already have an account?",
    account: "Go to my account",
    discover: "Find something to do while you wait on AkiPasa",
  },
} as const;

export function LaunchWaitlist({
  product,
  locale,
  siteKey,
}: {
  product: Product;
  locale: Locale;
  siteKey: string | null;
}) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [scriptReady, setScriptReady] = useState(false);
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !scriptReady || !challengeRef.current) return;
    const api = (window as Window & {
      turnstile?: {
        render: (element: HTMLElement, options: Record<string, string>) => string;
        remove: (widgetId: string) => void;
      };
    }).turnstile;
    if (!api || widgetIdRef.current) return;
    const widgetId = api.render(challengeRef.current, {
      sitekey: siteKey,
      action: "launch_waitlist",
      theme: "dark",
    });
    widgetIdRef.current = widgetId;
    return () => {
      api.remove(widgetId);
      widgetIdRef.current = null;
    };
  }, [siteKey, scriptReady]);
  const content = COPY[product][locale];
  const labels = formCopy[locale];
  const name = product === "duermo" ? "AkiDuermo" : "AkiCoches";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!siteKey || status === "submitting" || status === "check_email") return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const challenge = String(values.get("cf-turnstile-response") || "");
    if (!challenge) {
      setStatus("verification_failed");
      return;
    }
    const payload = {
      product,
      locale,
      fullName: String(values.get("fullName") || ""),
      email: String(values.get("email") || ""),
      city: String(values.get("city") || ""),
      audience: String(values.get("audience") || "person"),
      interests: String(values.get("interests") || ""),
      launchConsent: values.get("launchConsent") === "on",
      marketingConsent: values.get("marketingConsent") === "on",
      turnstileToken: challenge,
      website: String(values.get("website") || ""),
    };
    setStatus("submitting");
    try {
      const response = await fetch("https://akipasa.com/api/launch-waitlist", {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const outcome = (await response.json()) as {
        ok?: boolean;
        status?: FormStatus;
      };
      if (response.status === 202 && outcome.ok) {
        setStatus("check_email");
        form.reset();
      } else {
        setStatus(
          outcome.status === "try_later" ||
            outcome.status === "verification_failed"
            ? outcome.status
            : "temporarily_unavailable",
        );
      }
    } catch {
      setStatus("temporarily_unavailable");
    }
    const challengeWindow = window as Window & {
      turnstile?: { reset: (widgetId?: string) => void };
    };
    if (widgetIdRef.current) challengeWindow.turnstile?.reset(widgetIdRef.current);
  }

  return (
    <main className={styles.landing} data-waitlist-product={product}>
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/">
            <Image
              src={
                product === "duermo"
                  ? "/brand/v3/duermo.svg"
                  : "/brand/v3/coches.svg"
              }
              alt=""
              width={46}
              height={46}
            />
            <span>{name}</span>
          </Link>
          <nav className={styles.navigation} aria-label="Navigation">
            <Link href={"/?lang=" + (locale === "es" ? "en" : "es")}>
              {locale === "es" ? "EN" : "ES"}
            </Link>
            <Link href={"/hq-login?lang=" + locale}>{content.business}</Link>
          </nav>
        </header>

        <div className={styles.grid}>
          <section className={styles.intro}>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className={styles.description}>{content.description}</p>
            <div className={styles.orbit} aria-hidden="true">
              <div className={styles.orbitRing}>
                <Image
                  src={
                    product === "duermo"
                      ? "/brand/v3/duermo.svg"
                      : "/brand/v3/coches.svg"
                  }
                  alt=""
                  width={92}
                  height={92}
                />
              </div>
            </div>
            <a className={styles.discover} href="https://akipasa.com">
              {labels.discover}
            </a>
          </section>

          <section className={styles.formPanel} aria-labelledby="launch-title">
            <p className={styles.tag}>
              {locale === "es" ? "PRÓXIMAMENTE" : "COMING SOON"}
            </p>
            <h2 id="launch-title">{content.launch}</h2>
            <p className={styles.launchHint}>{content.launchHint}</p>
            {status === "check_email" ? (
              <p className={styles.success} role="status">
                {labels.check_email}
              </p>
            ) : (
              <form className={styles.form} onSubmit={submit}>
                <label>
                  {labels.name}
                  <input
                    type="text"
                    name="fullName"
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  {labels.email}
                  <input
                    type="email"
                    name="email"
                    maxLength={254}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  {labels.city}
                  <input
                    type="text"
                    name="city"
                    maxLength={120}
                    autoComplete="address-level2"
                    required
                  />
                </label>
                <label>
                  {labels.audience}
                  <select name="audience" defaultValue="person">
                    <option value="person">{labels.person}</option>
                    <option value="business">{labels.business}</option>
                  </select>
                </label>
                <label>
                  {labels.interests}
                  <input
                    type="text"
                    name="interests"
                    maxLength={180}
                    placeholder={labels.interestsPlaceholder}
                  />
                </label>
                <label className={styles.honeypot} aria-hidden="true">
                  Website
                  <input
                    type="text"
                    name="website"
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" name="launchConsent" required />
                  <span>{labels.consent}</span>
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" name="marketingConsent" />
                  <span>{labels.marketing}</span>
                </label>
                {siteKey ? (
                  <>
                    <Script
                      src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
                      strategy="afterInteractive"
                      onReady={() => setScriptReady(true)}
                    />
                    <div ref={challengeRef} />
                  </>
                ) : (
                  <p className={styles.notice}>{labels.no_challenge}</p>
                )}
                {status !== "idle" && status !== "submitting" ? (
                  <p className={styles.error} role="alert">
                    {labels[status]}
                  </p>
                ) : null}
                <button
                  type="submit"
                  disabled={!siteKey || status === "submitting"}
                >
                  {status === "submitting" ? labels.sending : labels.submit}
                </button>
              </form>
            )}
            <p className={styles.legal}>
              {labels.legal}{" "}
              <Link href={"/" + locale + "/privacy"}>{labels.privacy}</Link>
              {" · "}
              <a href="mailto:support@akipasa.com">support@akipasa.com</a>
            </p>
            <div className={styles.existing}>
              <span>{labels.existing}</span>{" "}
              <Link href={"/account?lang=" + locale}>{labels.account}</Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
