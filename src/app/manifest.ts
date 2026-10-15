import type { MetadataRoute } from "next";

/** This independent app keeps its own identity on canonical and preview hosts. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/akiduermo",
    name: "AkiDuermo",
    short_name: "AkiDuermo",
    description: "Descubre alojamientos con AkiDuermo.",
    start_url: "/",
    display: "standalone",
    background_color: "#143c43",
    theme_color: "#35c6a6",
    lang: "es",
    scope: "/",
    categories: ["travel"],
    icons: ([192, 512] as const).flatMap((size) => [
      {
        src: `/pwa/duermo-${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any" as const,
      },
      {
        src: `/pwa/duermo-maskable-${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "maskable" as const,
      },
    ]),
  };
}
