/** Preserve the WebView PKCE cookie: only the one-time code returns to the app. */
export const androidOAuthScript =
  'setTimeout(function(){window.location.href=document.getElementById("native-return").href;},2000);';
export function googleOAuthCallback(
  origin: string,
  locale: "en" | "es",
  next: string,
  userAgent: string,
) {
  const callback = new URL(`${origin}/${locale}/auth/callback`);
  callback.searchParams.set("next", next);
  if (/\bAkiDuermoAndroid\//.test(userAgent))
    callback.searchParams.set("android", "1");
  return callback.toString();
}

export function androidOAuthHandoff(
  url: URL,
  locale: "en" | "es",
  next: string,
) {
  if (
    url.searchParams.get("android") !== "1" ||
    url.searchParams.get("native") === "1"
  )
    return null;
  if (!url.searchParams.get("code") && !url.searchParams.get("error"))
    return null;
  const handoff = new URL("akiduermo://auth/callback");
  handoff.searchParams.set("locale", locale);
  handoff.searchParams.set("next", next);
  for (const key of ["code", "error", "error_code", "error_description"]) {
    const value = url.searchParams.get(key);
    if (value) handoff.searchParams.set(key, value);
  }
  const href = handoff
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;");
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const label = locale === "es" ? "Volver a AkiDuermo" : "Return to AkiDuermo";
  return new Response(
    `<!doctype html><html lang="${locale}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>AkiDuermo</title></head><body style="font:16px system-ui;padding:24px;max-width:30rem;margin:12vh auto"><h1>AkiDuermo</h1><p>${locale === "es" ? "Abriendo la aplicación en 2 segundos. Si no se abre, pulsa el botón." : "Opening the app in 2 seconds. If it does not open, tap the button."}</p><a id="native-return" style="display:inline-block;padding:16px 24px" href="${href}">${label}</a><script nonce="${nonce}">${androidOAuthScript}</script></body></html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'`,
      },
    },
  );
}
