# AkiDuermo extraction contract

Source: AkiPasa master `080ea0ffb2dd6612436acd04c25b4daf8ff71129`. Source files were copied using `git archive`, with no Git history, environment secrets, dependencies or generated assets. The original checkout is untouched. Shared modules are a reviewed source snapshot; future shared fixes require synchronized versioned updates and independent app checks. No cross-repository imports exist.

## Preserved boundaries

The public accommodation catalogue remains a separate discovery vertical. Availability, server-computed quote validation, authenticated reservation mutations, existing RLS, existing owner records, inclusive check-in/exclusive checkout and request/confirmed/cancelled states are copied without schema/price/entitlement changes. No real reservations or billing operations were exercised by extraction tests. Historical master/handoff docs describe source history, not proof that bookings are production ready.

Property management remains in AkiBusiness's authorized unified workspace; only user navigation links cross origins. Saved-stay and consent APIs, maps and public discovery run on this app. Customer history reads only the signed-in account. Membership and subscription purchases remain owned by the existing shared AkiPasa catalogue/billing surface. Stripe webhook, scheduled transactional mail, publication and subscription tasks remain owned solely by the existing AkiPasa Worker. This Worker has no scheduled handler or cron.

The same Supabase project preserves user IDs, roles and account identities. Each root domain receives a separate host-only browser session. No cookies are shared between unrelated roots. A user signs in to each domain using the same identity; seamless session transfer requires a separately verified broker. Canonical, legacy, localhost and explicitly allowlisted HTTPS previews use the stay return-path sanitizer. Unknown hosts fall back to canonical; incoming Origin does not establish trust. Configure `AKISUITE_ALLOWED_PREVIEW_ORIGINS` with exact preview origins and register corresponding EN/ES callback/recovery paths in Supabase. Do not use wildcard allowlists. Cookies retain the upstream secure/httpOnly/SameSite behavior with no Domain override.

## Release sequence and rollback

The default Wrangler config intentionally has no routes/custom domains: deploy to a separate `akiduermo` preview Worker first, keeping existing production domains on their current Worker. Bind existing public Supabase URL/key at build and runtime; values are not copied into source. The separate MapSnapshot Durable Object is a derived cache, not an application database clone. Verify provider project reference `vhpbvcfkcteswlsdjrfl` against the actual URL before deployment.

Run current-head CI/Cloudflare dry-run, browser smoke EN/ES mobile/desktop in both themes, real sandbox login/logout/OAuth/recovery/expiry, authorized customer booking/cancellation and owner/other-owner isolation against an approved staging database. Verify image/map loading, property manager cross-links, unchanged request/payment copy, provider redirect allowlists, SSL and source commit. Stay pages remain noindex and robots disallow all throughout migration. Do not attach domains or redirect legacy traffic until all required evidence and production approval exist. No database migration is applied by CI or deployment.

Record previous Worker version, routes and DNS before any cutover. Rollback restores previous route/domain ownership and deployment version; preserve the existing shared database and user/booking records. Reverting this repository has no entitlement or schema rollback requirement. Canonical/legacy URL redirects must be configured only after replacement acceptance; this source does not take over live traffic.

## Validation status

See the extraction PR and local handoff for exact commands/results. Provider, authenticated production, payment and real room-concurrency acceptance are separate gates; never infer these from fixtures or green builds.

## Canonical route implementation

The extracted routes live at their real product paths, rather than rewriting to the monolith's `/akiduermo` directory. Local runtime testing found that retaining the old rewrite/canonicalization pair caused requests to loop. Root-route promotion removes that cycle while keeping the same components, actions, RPCs, validation and RLS boundaries. Historical `/akiduermo/...` paths redirect once to their canonical counterparts. EN/ES roots redirect locally with validated `lang` and preserve query parameters. Local signout stays on this product. Account email/reset callbacks use the initiating trusted origin and return to Settings, including approved previews.

CI's Supabase URL and key are explicit synthetic localhost-only fixtures. Browser booking requests/quotes/cancellation are intercepted inert responses; they exercise request payloads and rendered pending/cancelled states, never real reservations. The real API is separately tested with authenticated mocked adapters for existing RPC contracts. Full production schema concurrency/RLS and provider authentication remain unperformed release gates.
