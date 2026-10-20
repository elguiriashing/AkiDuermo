# AkiDuermo extraction contract

## 2026-10-20 | Host-local OAuth terms gate

The independent EN/ES Google sign-in no longer depends on a required checkbox
before OAuth. Browser validation previously stopped an unchecked form before the
Worker server action, so neither Cloudflare nor Supabase received a request and
the control could appear inert. Terms and privacy links remain beside the Google
button, and acceptance is now enforced after Supabase establishes the host-local
PKCE session. The callback validates the shared user, reads the authoritative
`profiles.terms_version`, and sends missing or outdated acceptance to the local
`/{locale}/terms/accept` route with the sanitized AkiDuermo task preserved.

The callback is shared by Google OAuth, magic links, email confirmation and
password recovery, so every successful exchange receives the same post-auth
terms check. Already-started OAuth attempts carrying the former short-lived
`akipasa_terms_ack` cookie remain compatible and delete it after processing.
Canonical and approved preview callback allowlists, host-only Supabase cookies,
local/global logout scopes, password policy, RLS and booking authority are
unchanged. No cross-domain session transfer, schema migration, role change,
storage change, payment activation or provider-setting mutation is introduced.

## 2026-10-19 | Independent production cutover candidate

The main branch is now the only deploy source. Unknown routes return a local 404
and all membership aliases resolve to AkiDuermo's own /membership; there is no
website fallback to AkiPasa. The catalogue keeps Personal Premium behind the
server-read adoption flag and lists AkiDuermo for Business, free AkiHQ,
AkiBusiness Standard/Plus/Pro and Enterprise without enabling checkout. Public
home/property pages and the local sitemap use akiduermo.com canonicals; private
account, booking, auth and API routes remain excluded from crawling.

Property/listing management is an explicit AkiHQ handoff and paid operations are
an explicit AkiBusiness handoff. The legacy venue-backed accommodation tables and
booking RPCs remain authoritative because the independent-property migrations
are not present in the shared Supabase project. No schema migration, entitlement
change, payment activation, booking mutation or cross-domain cookie sharing is
part of this cutover.

The Android project is com.akipasa.duermo, targets API 36, uses AkiDuermo
branding and includes EN/ES Play listing preparation. Store submission remains
blocked on Play signing/App Links, final graphics/screenshots, Console
declarations and signed-device acceptance.

## 2026-10-18 | Native membership storefront candidate

The independent /membership route now displays AkiDuermo for Business, AkiBusiness
Standard and Pro, and Enterprise using the accommodation theme. Personal Premium
remains hidden ahead of adoption launch. No Stripe checkout or new entitlement
is introduced. The account links to /membership; /en/membership and
/es/membership resolve to the local product page with the correct locale,
while authenticated subscription management remains with the authoritative
AkiPasa billing service. The current production branch in Cloudflare is
release/hold-duermo-role-cutover. This candidate does not modify billing,
the shared Supabase database, identity, bookings, or scheduled jobs.
Test CI, build, preview, page loading in EN/ES, navigation, and protected
account flows before merging the candidate into that production branch.
Rollback via reverting the commit and restoring the previous Worker version.

## 2026-10-17 | Candidate account UI refinement

The release/hold source gets a separate unmerged UI candidate for a genuine
account dashboard on /account. Existing saved stays are device-local;
reservation summary reads use the user's Supabase session and explicitly
filter by profile_id, preserving RLS. Host-only sign out and the AkiBusiness
property-management handoff remain unchanged. No changes to global billing,
schedules, data or auth. The Cloudflare EXPECTED_SOURCE_SHA pin deliberately
requires an authorized source update after CI and preview acceptance;
its mismatch with the merged navigation commit is not a build compilation fault.

Source: AkiPasa master `080ea0ffb2dd6612436acd04c25b4daf8ff71129`. Source files were copied using `git archive`, with no Git history, environment secrets, dependencies or generated assets. The original checkout is untouched. Shared modules are a reviewed source snapshot; future shared fixes require synchronized versioned updates and independent app checks. No cross-repository imports exist.

## Preserved boundaries

The public accommodation catalogue remains a separate discovery vertical. Availability, server-computed quote validation, authenticated reservation mutations, existing RLS, existing owner records, inclusive check-in/exclusive checkout and request/confirmed/cancelled states are copied without schema/price/entitlement changes. No real reservations or billing operations were exercised by extraction tests. Historical master/handoff docs describe source history, not proof that bookings are production ready.

Property management remains in AkiBusiness's authorized unified workspace; only user navigation links cross origins. Saved-stay and consent APIs, maps and public discovery run on this app. Customer history reads only the signed-in account. Membership and subscription purchases remain owned by the existing shared AkiPasa catalogue/billing surface. Stripe webhook, scheduled transactional mail, publication and subscription tasks remain owned solely by the existing AkiPasa Worker. This Worker has no scheduled handler or cron.

The same Supabase project preserves user IDs, roles and account identities. Each root domain receives a separate host-only browser session. No cookies are shared between unrelated roots. A user signs in to each domain using the same identity; seamless session transfer requires a separately verified broker. Canonical, legacy, localhost and explicitly allowlisted HTTPS previews use the stay return-path sanitizer. Unknown hosts fall back to canonical; incoming Origin does not establish trust. Configure `AKISUITE_ALLOWED_PREVIEW_ORIGINS` with exact preview origins and register corresponding EN/ES callback/recovery paths in Supabase. Do not use wildcard allowlists. Cookies retain the upstream secure/httpOnly/SameSite behavior with no Domain override.

Ordinary account and authentication logout explicitly use Supabase `scope: local`
to preserve the user's independent sessions on other products. Only recovery
after a successful shared-password update intentionally uses `scope: global` as
a security response. Never change the owner's real password to test migration;
recovery failures do not revoke sessions. Supabase access JWTs retain their
existing expiry behavior; neither logout scope immediately invalidates issued
access JWTs. See the [primary sign-out contract](https://supabase.com/docs/guides/auth/signout).

Local membership aliases apply the reviewed bounded query sanitizer to encoded
keys and nested credential-bearing values. Safe filter values and duplicates
remain. Same-origin PKCE callbacks keep their code and validated local task
intact; unknown routes do not redirect to another product.

## Release sequence and rollback

The default Wrangler config intentionally has no routes/custom domains: deploy to a separate `akiduermo` preview Worker first, keeping existing production domains on their current Worker. Bind existing public Supabase URL/key at build and runtime; values are not copied into source. The separate MapSnapshot Durable Object is a derived cache, not an application database clone. Verify provider project reference `vhpbvcfkcteswlsdjrfl` against the actual URL before deployment.

Run current-head CI/Cloudflare dry-run, browser smoke EN/ES mobile/desktop in both themes, real sandbox login/logout/OAuth/recovery/expiry, authorized customer booking/cancellation and owner/other-owner isolation against an approved staging database. Verify image/map loading, property manager cross-links, unchanged request/payment copy, provider redirect allowlists, SSL and source commit. Stay pages remain noindex and robots disallow all throughout migration. Do not attach domains or redirect legacy traffic until all required evidence and production approval exist. No database migration is applied by CI or deployment.

Record previous Worker version, routes and DNS before any cutover. Rollback restores previous route/domain ownership and deployment version; preserve the existing shared database and user/booking records. Reverting this repository has no entitlement or schema rollback requirement. Canonical/legacy URL redirects must be configured only after replacement acceptance; this source does not take over live traffic.

## Validation status

See the extraction PR and local handoff for exact commands/results. Provider, authenticated production, payment and real room-concurrency acceptance are separate gates; never infer these from fixtures or green builds.

## Approved preview navigation and repeatable packaging

Internal property links use relative `stayPath` destinations, including catalogue,
device-saved stays and map popups. Property back links and error/404 recovery also
remain on the current origin. `stayHref` remains the absolute canonical helper for
metadata. This permits an approved isolated preview to be accepted before its
canonical domain exists, without changing business-management or billing handoffs.

`.github/workflows/preview-release.yml` accepts an exact 40-character source SHA
with successful product CI. It validates the fixed repository/account/Worker,
real shared public Supabase configuration, absent domain routes and schedules,
and unchanged closed billing flags. Public settings are supplied at both build
and runtime, including the Google-auth visibility flag. Source-stamped OpenNext
and dry-run artifacts are retained. Optional deployment requires a scoped token
and verifies `/api/bookings/release` over HTTPS at the exact preview origin.
It refuses an existing Worker with custom production domains or schedules; use
the separately reviewed production release path after authenticated acceptance.
The clean-source packaging wrapper recreates only generated `.open-next` output
before every build, preventing duplicate generated environment exports on repeat
builds while retaining `.next/cache`.

The actual preview origin is `https://akiduermo.alexashing1.workers.dev`.
Supabase must approve both exact `/en/auth/callback` and `/es/auth/callback`
destinations; provider verification found these preview callbacks unapproved
while the canonical AkiDuermo callbacks were accepted. Preserve all existing
allowlist entries and the working custom Supabase Auth alias. Same shared user
identity still requires a separate host-local login and is not cross-domain SSO.

## Canonical route implementation

The extracted routes live at their real product paths, rather than rewriting to the monolith's `/akiduermo` directory. Local runtime testing found that retaining the old rewrite/canonicalization pair caused requests to loop. Root-route promotion removes that cycle while keeping the same components, actions, RPCs, validation and RLS boundaries. Historical `/akiduermo/...` paths redirect once to their canonical counterparts. EN/ES roots redirect locally with validated `lang` and preserve query parameters. Local signout stays on this product. Account email/reset callbacks use the initiating trusted origin and return to Settings, including approved previews.

CI's Supabase URL and key are explicit synthetic localhost-only fixtures. Browser booking requests/quotes/cancellation are intercepted inert responses; they exercise request payloads and rendered pending/cancelled states, never real reservations. The real API is separately tested with authenticated mocked adapters for existing RPC contracts. Full production schema concurrency/RLS and provider authentication remain unperformed release gates.
