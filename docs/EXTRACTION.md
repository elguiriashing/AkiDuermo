# AkiDuermo extraction contract

Android Google OAuth requires the product-specific code-only browser return and
paired custom-scheme Android client described in android-oauth-return.md. The
original WebView performs PKCE exchange; sessions never transfer across hosts.

## 2026-10-24 | Owner-approved monthly pricing and upgrade paths

The current commercial catalogue is `APPROVED_PRICING_20261024.md` and
`config/approved-pricing.json`. It supersedes older public tier/price descriptions:
AkiBusiness Basic/Standard/Pro €19.99/€48.99/€97.99; individuals €1.99 for each
AkiPasa/AkiDuermo/AkiCoches Premium; businesses €11.99/€24.99/€19.99 respectively.
Free AkiHQ access, historical machine identifiers and existing subscriber terms
are retained. EN/ES marketing and CTAs explain product-specific Premium upgrades
without activating billing or inventing benefits. Shared audience source remains
identical in the three discovery apps. Source, account, Stripe, SQL guard, service
worker and release dependencies are traced in that pricing contract and receipts.
The 36-case local pricing/lifecycle SQL suite passes; full checks, hosted CI and
exact-source live readback remain required before release acceptance.

## 2026-10-22 | Audience-first native membership storefront

Supersedes the five-card sales ladder directly below. The membership
storefront now offers Individual and Business selection, each with two
transparent cards. Individual Free remains available; Personal Premium
remains staged for new purchases (historical subscriptions unaffected).
Business exposes free AkiHQ property management and a separately staged
€14.99 property listing Premium enquiry. AkiBusiness Standard/Plus/Pro
are accessed on the standalone software website, not sold as listing perks.
The component and CSS are byte-identical with AkiPasa and AkiCoches. EN/ES,
accessibility, property-vs-personal scope, safe cross-domain handoffs and no
new checkout/Stripe/RLS/database changes are mandatory. Mobile/browser,
CI and exact hosted-SHA release verification remain required.

## 2026-10-21 | Compact five-plan membership comparison

The native membership route now presents exactly free AkiHQ, AkiDuermo
Premium and AkiBusiness Standard/Plus/Pro. It removes the public tool/sector
configurator, Enterprise and adoption-gated personal card from this commercial
comparison. Standard communicates 4 of 12 tools with one replacement per
monthly cycle, Plus 8 of 12 with two, and Pro all 12. Annual customers retain
monthly anniversary rotations; billing frequency does not change tool access.

Desktop uses one five-card comparison row. Tablet and mobile use a compact
horizontal snap rail so the hero and a complete decision card share the first
screen. Paid actions remain non-charging handoffs while checkout/tax gates are
closed. No Stripe, entitlement, property, booking, identity, RLS, schema,
customer record or production mapping changes.

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

## 2026-10-20 | Gated shared account eligibility

The server member guard reads AkiPasa's caller-only onboarding contract after
`AKISUITE_ONBOARDING_SCHEMA_READY` activation. Pending/negative declarations
redirect to the canonical same-language AkiPasa completion page. Separate domains
retain host-only sessions; that destination may request sign-in with the same
identity. No JWT, password, PKCE code or arbitrary return URL crosses products.
The shared database state takes effect on the next guarded request without client
cache authority. Existing accounts remain exempt. No schema, cohort activation,
terms version, subscription, ownership or routing setting changes here.

Native customer booking/saved API routes deny restricted accounts after identity
validation where present. The shared AkiPasa migration owns covered legacy mutation
guards. All remaining privileged endpoints and safety flows require joint
acceptance before enrolment activation. Completion currently returns to AkiPasa;
the user can switch products afterwards. This explicit central handoff avoids a
local completion redirect loop, but seamless authenticated cross-product resume
remains a separately gated enhancement. Legal, export, deletion and sign-out
remain reachable on AkiPasa's separate safety route.

## 2026-10-20 | Explicit cross-product language contract

AkiSuite selectors and management/operations handoffs now retain EN/ES using
canonical product-specific route formats. AkiHQ remains free management;
AkiBusiness remains paid operations. The synchronized suite-navigation v1
contract rejects external/query/fragment/path-traversal destinations and can
carry only bounded explicit workspace identity and a validated public referral
code. No auth token or account identity crosses domains in links. Existing
server membership checks remain authoritative. Focused tests pass; complete
CI/build and canonical authenticated acceptance remain release gates. See
`docs/SUITE_NAVIGATION_V1.md`. No schema, billing or customer data changes.

## 2026-10-20 | Contextual free management and operations previews

The business-owner disclosure uses the canonical AkiSuite navigation contract,
keeping free AkiHQ listing/location/team management separate from AkiBusiness
paid operations. Venue claim initiation is shown only when the existing public
ownership check confirms claim availability; property/rental prompts use the
free hub without fabricating claimability or creating a venue dependency.
Category workflow previews describe organisation steps, without invented results
or prices. The operations link is neutral, not an upgrade promise or entitlement
grant; actual target server permissions remain authoritative.

CTA impressions/clicks and claim starts use existing GA4 only when the current
analytics consent cookie grants it. No identifier, contact field, payment success
or claim completion is inferred or sent. Consent revocation is rechecked on
every signal. No new loader, cross-domain cookie, tracking pixel, billing flow,
backend mutation, schema or production configuration is introduced. The mirrored
BusinessPathway, suite-conversion and suite-navigation sources have shared v1
provenance and no sibling-checkout imports.

Validation: new five-case rendered/interaction/consent suite; full source gates
and responsive/provider acceptance remain tracked in the release report. Revert
these source commits for rollback; no data restoration is required.

## 2026-10-20 | Validated referral task completion

Account completion preserves a single public referral code matching the existing
uppercase alphanumeric 8–24 character navigation bound. The canonical public
`/{locale}/referrals?ref=CODE` task returns to AkiPasa's explicit confirmation page;
other allowed product tasks retain their validated code and EN/ES choice through
the same fixed-origin resume envelope. Duplicate, URL-shaped, lowercase and
out-of-range codes are discarded. Direct unprefixed AkiPasa referral completion
uses this same sanitizer rather than falling back to Account.

This changes navigation only: pending/underage restrictions, legal and tracking
choices, first-attribution immutability and the explicit confirmation action remain
authoritative. No automatic attribution, referral cookie, identity transfer, schema,
financial incentive or production write is introduced. Shared contract copies and
role-controller regressions cover all five products and both languages. Hosted CI
and exact-source release checks remain required; unit fixtures do not establish
authenticated production browser acceptance.

Actual accommodation Account and Bookings server loaders now pass validated request search parameters into the same bounded task helper before requireUser. The selected tab/page and single referral survive pending/underage completion in EN/ES. Production deployment remains blocked by the existing EXPECTED_SOURCE_SHA pin to edd37b5041950111cb2dc2e26ff62bc3560ae0ac until authorized Cloudflare configuration access is restored; no source-pin check is bypassed or weakened.

## Supported runtime update — 21 October 2026

Next/OpenNext build support migrated after Next15 crossed the adapter support window. Existing product/role, locale, auth, shared schema and source-stamp release contracts remain authoritative; see NEXT16_SUPPORTED_RUNTIME.md. No unsupported-version flag, runtime pin change or production configuration mutation is permitted by this source amendment.

Completion-resume scope correction retains the actual legacy property/company/organisation query names using the shared bounded allowlist; no scope authorisation or runtime pin change. See ACCOUNT_TASK_RESUME_V1.md.

## Isolated tooling security maintenance — 21 October 2026

A separate candidate patches test/build dependencies after the scoped completion correction. Product/runtime dependencies, MapLibre backport verification, roles, consent, RLS, billing and release source pins remain authoritative. See security/TOOLING_REVIEW_20261021.md for advisory provenance, residual braces baseline and pending exact-head CI requirements.

## Monthly operating-tier alignment — 21 October 2026

The compact five-card membership design is preserved. Operating cards use approved Básico €24.99 / Standard €44.99 / Pro €64.99 monthly amounts and 4/8/12 tools, with 1/2/unrestricted monthly replacements. Unverified operations annual totals and the global annual savings control are removed; no new annual Stripe products or pricing are inferred. The Standard accent now says “8 tools”, without an unsupported popularity claim. Existing listing monthly pricing remains separate; no billing objects or personal subscription records change. Saved toolbox changes activate at the next monthly rotation, including existing annual subscribers; delegation of active tools remains instant.

EN/ES functional server-render tests assert each actual card’s price, tools, replacement allowance, five-card count, locale destination and absence of annual/popularity promises. Checkout remains gated and no provider or production configuration changes are made. Scope-preservation and patched-tooling public ancestry are retained with the latest membership primary. Full exact-head hosted release gates remain required before merging.

## 2026-10-24 | Native shared account journey

AkiDuermo now serves its own shared profile/settings forms and retains local
account and membership navigation. All editable fields use one atomic UPDATE
to the authenticated identity's existing public.profiles row; explicit column
validation excludes IDs, roles, entitlements and billing. Email changes and
password recovery use trusted same-product callbacks and the existing identity.
Name, username, bio, contact, locality/province, language and visibility therefore
follow the account across products without syncing copies or sharing cookies.
The form is withheld after a failed profile read; no blank overwrite is offered.
EN/ES, existing product shells, tenant permissions, saved/booking records and
separate identity/privacy safety gates remain authoritative. No SQL, provider
config, purchase activation or customer data is changed by the source release.
Shared source v1 mirrors have no sibling repository imports. Regression tests
cover both locales, field bounds, role/foreign-ID stripping and failed reads.
Full check/build, hosted CI and exact live-source acceptance remain required.
Rollback is a source revert; profiles and sessions are retained.

## 2026-10-25 | Shared icon family v3

Owner-requested burgundy Coches (#3B101B) and space-grey HQ (#252830) tiles
are synchronized across all five product selectors, favicons, Apple/PWA and
mobile icon sources. Coches uses the current car-free mark; black artwork has
a fine brand-colour edge for legibility. Pasa, Duermo and the purple AB geometry
are preserved. Default dark canvases match the tiles; light and selected owner
themes remain available. Versioned URLs and the static operating suite cache
refresh remove stale selector artwork. Stable PWA IDs and app identifiers remain.
No roles, links, data, billing, analytics, storage or provider configuration change.
See AKISUITE_ICON_FAMILY.md for dependencies, checks, native rebuild limitations
and source-only rollback. Local visual/asset validation and required CI are
separate from exact-source production and signed native-device acceptance.

## 2026-10-25 | AkiSuite navigation and surface continuity

Owner-authorized tightening preserves identity, tenant permissions, booking and
billing authority. Discovery membership audience now survives explicit Business
handoffs, reload and browser history without enabling checkout. Duermo/Coches
share one desktop rail/mobile dock component where available; Coches membership
retains its product header. Pasa's auth selector uses all five canonical brands
and origins. Duermo auth stays teal; HQ marketing and login use one request
language, keep readable dark-surface text, and expose header controls. Business
login gains local home/language/appearance controls retaining input only in memory.
Each repository carries only its affected subset. No schema, feature activation,
provider setting, customer record or native signing change. Source revert is the
rollback. Full source, browser/CI and exact production checks remain required;
device/authenticated acceptance must not be inferred from fixtures.

## 2026-10-25 | AkiSelector workspace login integration

Alex explicitly selected the existing private lab's AkiSelector for the public
login workspace chooser. All five apps appear: Pasa orange, Duermo teal,
Coches red/burgundy, HQ yellow/space grey and Business purple. Reuse the
engine's card scene, swipe, keyboard navigation and reduced-motion behavior
in a compact sign-in adapter. Previewing an app never submits, navigates or
replaces a login form; opening another app is an explicit localized action
with only the bounded referral code passed across origins. Current product
is selected initially. Mobile keeps the chooser after the sign-in fields.
The static operating app uses a DOM adapter and the same scene styles, with
no framework runtime or third-party dependency added. The private lab keeps
its administrator-only route. No pricing, session, tenant, permissions or
provider setting changes. Source revert is rollback. Source, responsive
browser, exact live source and physical device acceptance remain distinct.

## 2026-10-26 | Actionable accommodation map recovery

Duermo's full-screen map exposes localized Retry map and Browse stays actions
when initialization or marker reads fail. The catalogue handoff retains the
applied destination and validated property type, rather than promising a list
without an action. Retry retains the filters and latest known map camera;
failed retries restore keyboard focus. The catalogue now accepts only its
existing allowlisted property types as initial URL state. No automatic location
permission, booking, payment, schema, role, provider or storage change.

Dependencies: /map client filters, ProductionMap/MapLibre lifecycle and existing
/api/map/stays reads; root server query validation, AkiDuermo's existing
/api/stays filter request and #stays results. EN/ES, light/dark and phone/tablet/
desktop remain required. Unit failure/retry regressions and a deterministic
WebGL-unavailable browser journey verify filter retention and actual catalogue
requests. The healthy-map fixture now returns the real markers/truncated shape.
Full checks, hosted CI, exact live source and visual inspection remain required;
fixtures do not establish provider, authenticated or physical-device acceptance.
Rollback is a source revert; no data restoration.

## 2026-10-26 | Direct workspace icon navigation

Owner-requested sign-in refinement: the five icon cards are the navigation
links themselves. Remove the visible previous/next controls, caption/count and
separate Open/current-workspace row from every public login chooser. Swiping
and Arrow/Home/End browse the carousel without navigation or draft changes;
an explicit tap/click or Enter on an icon follows its canonical localized link.
Suppress the compatibility click after a horizontal swipe so it cannot open an
app accidentally. Current app identity uses aria-current; browsing is distinct
from authorization and never submits the sign-in form. The private lab keeps
its original radio-selection controls by default through an opt-in link mode.

Dependencies: identical React engine/adapter/CSS copies in Pasa, Duermo, Coches
and HQ; equivalent static Business adapter at both guest sign-in entries.
Business selector assets advance to v2 and production offline cache to 155,
with release assertions retained. Existing bounded referral-only href helper,
EN/ES, product icons/palettes, reduced motion, roving focus, 44px active targets
and phone placement after the form remain. No session, permission, identity,
price, tenant, API/provider, database, analytics or customer-data changes.

Validation: destination/keyboard/private-lab regressions plus responsive browser
checks for first-click icon navigation, swipe click suppression, retained draft,
no footer/actions, localized/referral-safe URLs and zero scene scroll. Complete
hosted source/browser/Cloudflare checks and exact live-source verification are
required before release; installed native/device acceptance remains separate.
Rollback is a source revert and renewed Business asset/cache versions.

## 2026-10-26 | Headerless desktop discovery rails

Owner requested matching Pasa's desktop shell on Duermo and Coches. The desktop
rail now starts at the viewport top, uses a v3 icon plus expanded wordmark,
collapses to the icon, and persists its own product-local collapse preference.
The separate top header is removed from desktop layout. The footer order is
AkiSuite links, prominent sign-in, appearance/language, then collapse. Existing
settings/sign-out and bounded referral handoffs remain available. Phone/narrow
tablet retain the compact header and one bottom dock, like Pasa's mobile shell.

The same rail component/CSS are copied into both independent apps. Desktop
content padding follows the actual expanded/collapsed width. Fullscreen map
and rental layouts use the available height rather than retaining a hidden
header offset; map canvases resize without a camera reset. Menus remain within
short viewports. Duermo auth/legal routes join its local rail; in-place language
callbacks retain public exploration/property drafts, while other routes retain
local language navigation. No auth session, permission, identity, price, booking,
provider, schema, analytics or customer-data change; existing server actions
remain authoritative. Revert source for rollback; the optional UI collapse
preference is harmless and does not grant access.

Validation: navigation/collapse persistence/footer/language component tests;
actual EN/ES light/dark guest-route browser checks for zero desktop header/gap,
fixed rail during scroll, compact brand, reachable 480px menu, dock/rail map
boundaries and responsive rental flows. Complete hosted check/build/browser and
exact production source/visual acceptance remain required. Physical device and
authenticated production writes are not inferred from fixtures.

## 2026-10-26 | Coastal stay identity and photographic welcome

AkiDuermo default dark surfaces use deep coastal teal with warm ivory text; light
mode uses warm linen and green ink. Product tokens flow into navigation, account,
search and booking screens. Explicit owner background choices remain preserved.
Explore uses a larger photographic welcome with a restrained teal overlay, a larger
headline, more generous spacing and destination photography. Responsive search
controls retain their original queries, dates and submission behavior. Existing
media assets, layout routes, locale/identity/permissions, APIs, booking logic,
analytics, provider settings and data are unchanged. No new imagery is fetched.
Source/type/lint, full build/browser CI and EN/ES light/dark phone/tablet/desktop
visual review remain release requirements. Revert source for rollback.

## 2026-10-26 | Cinematic AkiSelector energy and transitions

The login selector now uses five distinct vector-mask materials: Pasa flame
tongues/cinders, Duermo tidal ribbons, Coches diagonal velocity trails, HQ
precision orbital tracks and Business spectral curtains. The existing generic
effect IDs remain compatible with the private lab. Every activation has a
brief lens flare, dissipating wave and glass reflection. Outgoing artwork stays
mounted for a 650ms opacity decay; incoming energy ramps over 280ms while card
travel eases over 680ms. Interrupted changes converge via CSS transitions,
without JavaScript animation frames or timeouts. Inactive material loops pause.

Mouse hover previews only energy and retains selection, roving focus, current
app and href geometry; pointer exit restores selected energy. Touch/pen retain
swipe browsing and direct icon navigation with the compatibility-click guard.
Keyboard input clears hover preview. EN/ES, referral-only links, preserved
login drafts, mobile placement and administrator-only lab boundaries remain.
Both explicit motion-off and OS reduced motion remove loops/transitions/flare.

Dependencies: shared React engine/CSS in Pasa, Duermo, Coches and HQ; equivalent
DOM adapter and identical CSS in Business. Business engine CSS, adapter CSS and JS URLs advance to
v2/v3/v3 and its effective paid release cache to v156, including release assertions.
No authentication exchange, session, API, tenant/role, database, storage,
analytics, payment, provider configuration or Android binary change. This is
web-delivered presentation. Rollback restores source and advances static asset
versions/cache again. Source and real-browser evidence is recorded in the PR;
full CI, production deployment and physical-device acceptance are separate gates.

## 2026-10-26 | Product-specific AkiSelector opening stories

The five login choices opt into an optional product arrival independently from
the reusable ember/breeze/bloom/solar/aurora idle effect. Pasa drops a discovery
pin and sparks; Duermo rolls and softly lands a suitcase; Coches sends a red
coupe with spinning wheels and a light wake across the foreground; free AkiHQ
gathers locations into a management hub; operations AkiBusiness wakes a till
and prints a receipt. Each decorative vector story plays once over 1.25–1.7s,
then disappears as its material rises into the sustained hovering/orbit phase.
The Coches idle is slower and includes a red orbital arc. Returning to an app
restarts its story; uninterrupted idle does not replay it. Generic lab effects
remain compatible without product stories unless the caller opts in.

Dependencies: AkiSelector option arrival, WorkspaceSelector adapter, shared CSS
and the equivalent static Business DOM adapter. All artwork is inline SVG masks
and CSS; no image/provider calls, animation timers or new packages. Decorative
actors ignore pointer events and are hidden from assistive technology. Direct
links are immediate, with no animation wait; browsing, safe referral/locale
URLs, drafts, keyboard focus, swipe suppression and auth/session/permissions
remain intact. Reduced motion and motion-off hide opening stories and keep
static idle artwork. Business engine CSS v3 / adapter CSS v3 / JS v4 and the
effective release cache v157 advance together with release assertions.

Validation includes all five actual actor animations becoming visible, finishing
once and handing off to full idle opacity, plus source/component/browser parity.
The current report records completed checks and separate broader map acceptance.
No production data, SQL, storage, billing, analytics, provider configuration or
Android binary changes. Source revert plus fresh static versions is rollback.
GitHub publication is still awaiting the explicit authorization requested earlier;
no push, PR, merge or deployment is implied by this design refinement.
