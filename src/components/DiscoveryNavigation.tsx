"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icons";
import "./DiscoveryNavigation.css";

/** AkiSuite discovery navigation v1. Identical source in Duermo and Coches. */
export function DiscoveryNavigation({
  locale,
  product,
}: {
  locale: "en" | "es";
  product: "duermo" | "coches";
}) {
  const path = usePathname() || "/";
  const es = locale === "es";
  const name = product === "duermo" ? "AkiDuermo" : "AkiCoches";
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
  return (
    <nav
      className="suite-discovery-nav"
      data-product={product}
      aria-label={es ? `Navegación de ${name}` : `${name} navigation`}
    >
      <span className="suite-discovery-label">{name}</span>
      {items.map((item) => (
        <Link
          key={item.path}
          href={`${item.path}?lang=${locale}`}
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
  );
}
