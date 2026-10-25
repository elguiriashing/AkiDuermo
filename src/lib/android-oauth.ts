import { renderAndroidReturnPage } from "./android-return-page";
/** Preserve the WebView PKCE cookie: only the one-time code returns to the app. */
export const androidOAuthScript =
  "var seconds=5;var counter=document.getElementById(\"return-seconds\");var ticker=setInterval(function(){seconds=Math.max(0,seconds-1);if(counter)counter.textContent=String(seconds);if(seconds===0)clearInterval(ticker)},1000);setTimeout(function(){location.assign(document.getElementById(\"native-return\").href)},5000);";
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
  const nonce = crypto.randomUUID().replaceAll("-", "");
  return new Response(renderAndroidReturnPage({brand:"duermo",name:"AkiDuermo",locale,target:handoff,nonce,script:androidOAuthScript,id:"native-return"}), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'`,
      },
    },
  );
}
