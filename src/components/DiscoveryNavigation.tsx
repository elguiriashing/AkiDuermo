"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";
import { ThemeToggle } from "./ThemeModeControls";
import { useSuiteReferral } from "./useSuiteReferral";
import { suiteHref } from "../lib/suite-navigation";
import "./DiscoveryNavigation.css";

/** AkiSuite discovery rail v2. Identical source in Duermo and Coches. */
export function DiscoveryNavigation({
  locale,
  product,
  onLanguageChange,
  children,
}: {
  locale: "en" | "es";
  product: "duermo" | "coches";
  onLanguageChange?: () => void;
  children?: ReactNode;
}) {
  const path = usePathname() || "/";
  const es = locale === "es";
  const name = product === "duermo" ? "AkiDuermo" : "AkiCoches";
  const suffix = product === "duermo" ? "Duermo" : "Coches";
  const storageKey = `aki${product}.sidebar.collapsed`;
  const [compact, setCompact] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const previousPath = useRef(path);
  const referralCode = useSuiteReferral();
  useEffect(() => {
    try {
      setCompact(localStorage.getItem(storageKey) === "1");
    } catch {}
  }, [storageKey]);
  useEffect(() => {
    if (previousPath.current === path) return;
    previousPath.current = path;
    menu.current?.removeAttribute("open");
  }, [path]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target))
        menu.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  function changeLanguage() {
    if (onLanguageChange) return onLanguageChange();
    const next = es ? "en" : "es";
    const key =
      product === "coches" ? "akiconduzco_locale" : "akiduermo_locale";
    document.cookie = `${key}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    const url = new URL(location.href);
    url.pathname = url.pathname.replace(/^\/(?:en|es)(?=\/|$)/, `/${next}`);
    url.searchParams.set("lang", next);
    location.assign(url.toString());
  }
  function toggle() {
    const next = !compact;
    setCompact(next);
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {}
    window.dispatchEvent(new Event("akipasa:map-resize"));
  }
  const items: Array<{ path: string; label: string; icon: IconName }> = [
    { path: "/", label: es ? "Descubrir" : "Explore", icon: "discover" },
    { path: "/map", label: es ? "Mapa" : "Map", icon: "map" },
    product === "duermo"
      ? { path: "/saved", label: es ? "Guardados" : "Saved", icon: "saved" }
      : {
          path: "/membership",
          label: es ? "Membresía" : "Membership",
          icon: "membership",
        },
    {
      path: "/bookings",
      label: es ? "Reservas" : "Bookings",
      icon: "calendar",
    },
    { path: "/account", label: es ? "Cuenta" : "Account", icon: "account" },
  ];
  const apps = [
    ["pasa", "AkiPasa"],
    ["duermo", "AkiDuermo"],
    ["coches", "AkiCoches"],
    ["hq", "AkiHQ"],
    ["business", "AkiBusiness"],
  ] as const;
  return (
    <aside
      className="suite-discovery-nav"
      data-product={product}
      data-compact={compact}
      aria-label={es ? "Navegación principal" : "Primary navigation"}
    >
      <Link
        className="suite-discovery-brand"
        href={`/?lang=${locale}`}
        aria-label={es ? `Inicio de ${name}` : `${name} home`}
      >
        <Image
          src={`/brand/v3/${product}.svg`}
          width={40}
          height={40}
          alt=""
          unoptimized
        />
        <strong aria-hidden="true">
          Aki<span>{suffix}.</span>
        </strong>
      </Link>
      <nav
        className="suite-discovery-links"
        aria-label={es ? `Navegación de ${name}` : `${name} navigation`}
      >
        {items.map((item) => (
          <Link
            key={item.path}
            href={`${item.path}?lang=${locale}`}
            aria-label={item.label}
            title={compact ? item.label : undefined}
            aria-current={
              path === item.path ||
              (item.path === "/account" && path === "/settings")
                ? "page"
                : undefined
            }
          >
            <Icon name={item.icon} size={21} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="suite-discovery-footer">
        <details
          ref={menu}
          className="suite-discovery-menu"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
        >
          <summary
            aria-label={
              es ? "Cambiar aplicación AkiSuite" : "Switch AkiSuite app"
            }
          >
            <Icon name="more" />
            <span>AkiSuite</span>
          </summary>
          <div className="suite-discovery-popover">
            <nav aria-label={es ? "Aplicaciones AkiSuite" : "AkiSuite apps"}>
              {apps.map(([id, label]) => (
                <a
                  key={id}
                  href={
                    id === product
                      ? `/?lang=${locale}`
                      : suiteHref(id, locale, { referralCode })
                  }
                  aria-current={id === product ? "page" : undefined}
                  onClick={() => menu.current?.removeAttribute("open")}
                >
                  <Image
                    src={`/brand/v3/${id}.svg`}
                    width={36}
                    height={36}
                    alt=""
                    unoptimized
                  />
                  <span>{label}</span>
                </a>
              ))}
            </nav>
            <div className="suite-discovery-actions">
              <Link href={`/settings?lang=${locale}`}>
                {es ? "Ajustes" : "Settings"}
              </Link>
              {children}
            </div>
            {referralCode && (
              <a
                href={suiteHref("pasa", locale, {
                  path: "/referrals",
                  referralCode,
                })}
              >
                {es
                  ? "Aplicar invitación de referido"
                  : "Apply referral invitation"}
              </a>
            )}
          </div>
        </details>
        <Link
          className="suite-discovery-signin"
          href={`/${locale}/auth${referralCode ? `?ref=${referralCode}` : ""}`}
          aria-label={es ? "Entrar" : "Sign in"}
          title={compact ? (es ? "Entrar" : "Sign in") : undefined}
        >
          <Icon name="account" />
          <span>{es ? "Entrar" : "Sign in"}</span>
        </Link>
        <div className="suite-discovery-tools">
          <ThemeToggle locale={locale} />
          <button
            type="button"
            onClick={changeLanguage}
            aria-label={es ? "Switch to English" : "Cambiar a español"}
          >
            {es ? "EN" : "ES"}
          </button>
        </div>
        <button
          className="suite-discovery-collapse"
          type="button"
          onClick={toggle}
          aria-expanded={!compact}
          aria-label={
            compact
              ? es
                ? "Expandir barra lateral"
                : "Expand sidebar"
              : es
                ? "Contraer barra lateral"
                : "Collapse sidebar"
          }
        >
          <Icon name="chevron" />
          <span>{es ? "Contraer barra" : "Collapse sidebar"}</span>
        </button>
      </div>
    </aside>
  );
}
