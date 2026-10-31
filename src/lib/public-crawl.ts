/** Only published public pages on the canonical host may be indexed. */
export const canonicalCrawlHost = "akiduermo.com";

export function isCanonicalCrawlHost(host: string) {
  return host.toLowerCase() === canonicalCrawlHost;
}

export function isCrawlerMetadata(pathname: string) {
  return pathname === "/robots.txt" || pathname === "/sitemap.xml";
}

export function isPublicCrawlPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/membership" ||
    /^\/stays\/[^/]+\/?$/.test(pathname) ||
    /^\/(en|es)\/(privacy|terms)\/?$/.test(pathname)
  );
}
