# Android Google sign-in return

Google OAuth leaves the native WebView for the system browser. The PKCE verifier
remains in the original host-local WebView cookie jar. Android Google callbacks
now carry android=1 and show a code-only return link using akiduermo://auth/callback
before attempting any session exchange. The matching Android build maps this
fixed scheme to the product HTTPS callback with native=1; only then does the
existing callback exchange the code and apply terms/account eligibility guards.

Affected paths: English/Spanish Google sign-in action and auth callback, all
signed-in roles and original safe local return destinations. No database,
storage, provider, identity, pricing or cookie-domain changes. Ordinary web
Google login, password recovery and password login keep their existing paths.
No access token, refresh token, PKCE verifier or cookie is transferred to the
external browser. Handoff pages use no-store, no-referrer and restrictive CSP.

Deployment requires the paired Android custom-scheme build. Test cold/warm app
return on a real device in both locales, OAuth cancellation, account completion
and requested booking/settings destinations before claiming acceptance.
Asset Links publication must use the correct package and actual release
certificate; do not publish debug certificates in production.
