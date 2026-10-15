# AkiDuermo extraction contract

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

Outgoing membership and fallback redirects to AkiPasa apply the reviewed bounded
query sanitizer to encoded keys and nested credential-bearing values. Safe filter
values and duplicates remain. Only outgoing cross-origin redirects use the helper;
same-origin PKCE callbacks keep their code and validated local task intact.
Explicit harmless redirect fragments continue preventing fragment inheritance.

## Release sequence and rollback

The default `akiduermo` Worker already serves production; absence of routes in its local config does not establish isolation. Direct Wrangler deployment is blocked by a custom-build hook. Use `npm run dry-run:cloudflare` for inert packaging and the manual preview workflow for the separate `akiduermo-preview` identity. Disable the Cloudflare draft-branch build trigger before propagating these changes to its watched branch. Bind existing public Supabase URL/key at build and runtime; values are not copied into source. The separate MapSnapshot Durable Object is a derived cache, not an application database clone. Verify provider project reference `vhpbvcfkcteswlsdjrfl` against the actual URL before deployment.

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

The intended isolated preview origin is `https://akiduermo-preview.alexashing1.workers.dev`.
Supabase must approve both exact `/en/auth/callback` and `/es/auth/callback`
destinations; this new isolated origin and its callbacks still require provider configuration and verification. Preserve all existing
allowlist entries and the working custom Supabase Auth alias. Same shared user
identity still requires a separate host-local login and is not cross-domain SSO.

## Canonical route implementation

The extracted routes live at their real product paths, rather than rewriting to the monolith's `/akiduermo` directory. Local runtime testing found that retaining the old rewrite/canonicalization pair caused requests to loop. Root-route promotion removes that cycle while keeping the same components, actions, RPCs, validation and RLS boundaries. Historical `/akiduermo/...` paths redirect once to their canonical counterparts. EN/ES roots redirect locally with validated `lang` and preserve query parameters. Local signout stays on this product. Account email/reset callbacks use the initiating trusted origin and return to Settings, including approved previews.

CI's Supabase URL and key are explicit synthetic localhost-only fixtures. Browser booking requests/quotes/cancellation are intercepted inert responses; they exercise request payloads and rendered pending/cancelled states, never real reservations. The real API is separately tested with authenticated mocked adapters for existing RPC contracts. Full production schema concurrency/RLS and provider authentication remain unperformed release gates.

## Production deployment containment — 2026-10-15

The previously observed Cloudflare build watched `migration/five-product-duermo`
and deployed production Worker `akiduermo` directly, bypassing GitHub preview
isolation. This patch blocks the default Wrangler custom build and npm deployment
command. The supported dry-run always supplies `--dry-run`; preview release uses
`akiduermo-preview` and checks custom domains, all visible account zone routes and
schedules before upload. A scoped token must have read visibility over all account
zones, not a selected subset; provider permissions must be reviewed before use.
The new preview name does not itself prove that an existing Worker is isolated.

This source patch cannot stop a remote build of an older commit. Provider access
is required to disable the draft-branch production trigger without deleting the
Worker or changing its currently serving version/domains. Keep this fix on an
unwatched branch until that configuration is verified. No production release
script is enabled by this patch: a separately reviewed release must select the
exact successful-CI commit, real public build/runtime settings, auth/booking and
permission acceptance evidence, and previous Worker version/routes for recovery.
Do not bypass the hook using `--ignore-custom-build` or a generated config for
production. Credentials and provider permissions remain the security boundary;
repository guards prevent accidental supported-path uploads, not a token holder
intentionally overriding Wrangler.

Rollback of application traffic restores the previously recorded Worker version
and domain mappings. Keep the unsafe draft-branch trigger disabled during rollback;
reverting source protection is not a provider rollback. No data or schema change.

## Coordinated AkiHQ/AkiBusiness role switch

Build/runtime `NEXT_PUBLIC_AKISUITE_ROLE_SWAP=true` selects AkiHQ as the free
management destination (`config.businessUrl`, historical config key) and
AkiBusiness as operations (`config.crmUrl`). Default false retains current live
roles. Explicit preview origin overrides are preserved; old canonical defaults
are remapped only in the enabled mode. This is navigation/branding, never an
entitlement grant. Enable only with the coordinated verified domain releases,
auth callbacks and owner acceptance. This repository continues to identify as
AkiDuermo and keeps its own booking/account/callback routes.

Local `npm run preview:cloudflare` uses the same generated isolated configuration
and explicit `wrangler dev --local` after packaging/dry-run, so it does not invoke
the default production-blocking build hook or upload a Worker. Production token
permissions and remote trigger control remain separate from local preview.

## Independent accommodation read contract (disabled by default)

Central migrations `20261016010000_independent_accommodation_properties` and
`20261016020000_independent_accommodation_public_contract` must be applied and
verified before enabling server-only `AKISUITE_INDEPENDENT_ACCOMMODATION_ENABLED`.
Only exact `true` enables the union catalogue/detail/map/saved contract. The
manual isolated preview exposes this explicit input; production default remains
false and direct production deployment remains blocked.

Legacy property IDs equal retained venue IDs; independent properties never need a
venue. Existing availability `p_venue` and saved `p_venue` arguments intentionally
carry canonical property UUIDs after migration. Quote/request/cancel signatures
and customer-history tables remain compatible. Public projections contain no
owner/contact fields. Legacy header media remains in event-media with its
existing placements; independent public placements use accommodation-media.
Slug lookup with the caller's session permits only SQL-authorized hidden legacy
previews. Public search remains anonymous and uses one ordered union pagination.

Real publication, occupancy/concurrency, auth, signed Storage, confirmations,
saved-state backfills and owner/other-owner acceptance remain release gates.
Reverting this flag disables independent discovery but does not remove canonical
bookings or undo the additive schema; preserve independent cancellation/history
and use the central forward-recovery runbook rather than dropping data.
