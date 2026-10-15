/** Public application roles are separate from historical permission/plan keys. */
export function resolveProductRoles(options: {
  roleSwap?: string;
  managementUrl?: string;
  operationsUrl?: string;
}) {
  const swapped = options.roleSwap === "true";
  function origin(value: string | undefined, legacy: string, target: string) {
    const fallback = swapped ? target : legacy;
    if (!value || (swapped && value.replace(/\/$/, "") === legacy))
      return fallback;
    try {
      const url = new URL(value);
      const loopback = ["localhost", "127.0.0.1"].includes(url.hostname);
      if (
        (url.protocol !== "https:" &&
          !(loopback && url.protocol === "http:")) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.pathname !== "/"
      )
        return fallback;
      return url.origin;
    } catch {
      return fallback;
    }
  }
  return {
    swapped,
    managementName: swapped ? "AkiHQ" : "AkiBusiness",
    operationsName: swapped ? "AkiBusiness" : "AkiHQ",
    managementUrl: origin(
      options.managementUrl,
      "https://akibusiness.com",
      "https://akihq.app",
    ),
    operationsUrl: origin(
      options.operationsUrl,
      "https://akihq.app",
      "https://akibusiness.com",
    ),
  };
}

// Direct NEXT_PUBLIC reads are required for matching Next build/runtime bundles.
export const productRoles = resolveProductRoles({
  roleSwap: process.env.NEXT_PUBLIC_AKISUITE_ROLE_SWAP,
  managementUrl: process.env.NEXT_PUBLIC_BUSINESS_URL,
  operationsUrl: process.env.NEXT_PUBLIC_CRM_URL,
});
