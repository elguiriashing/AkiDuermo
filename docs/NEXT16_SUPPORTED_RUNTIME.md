# Supported Next runtime migration — 21 October 2026

The OpenNext Cloudflare build started rejecting the existing Next 15.5.28 dependency at its two-year release anniversary. The plain Next production build, TypeScript, lint and product tests still passed. This change upgrades the independent application rather than bypassing OpenNext’s support-policy check.

Targets: Next and eslint-config-next 16.4.2, OpenNext Cloudflare 1.20.12, Wrangler 4.151.3, all exact pinned stable registry versions. Existing patched React 19.1.10 satisfies the Next peer requirement and remains unchanged. Node 22 and TypeScript 5.8 satisfy the documented minimums.

The documented manual migration retains Webpack explicitly for dev/build so the existing server MapLibre alias remains effective. Existing edge middleware remains middleware: renaming it to proxy would change its runtime to Node. Async request APIs were already awaited; cache components and React Compiler remain off. Native ESLint flat exports replace the legacy FlatCompat bridge.

Existing canonical domain, host-local session cookies, Supabase identity/RLS, billing flags, product routing, EN/ES and production configuration are unchanged. No unsupported-version override is added. Cloudflare packages must still come from clean committed source. Fixture artifacts must never be uploaded to production.

Sources: https://nextjs.org/docs/app/guides/upgrading/version-16, https://nextjs.org/support-policy, https://opennext.js.org/cloudflare/get-started and the installed adapter’s peer dependencies.

Status: source implemented. Local lint, TypeScript, full product tests and optimized Next16 production build pass. Exact-commit Cloudflare packaging/dry-run and browser acceptance evidence is recorded in the release PR and must pass before release. Existing production remains the rollback; source upgrade requires a new reviewed deployment. AkiDuermo’s EXPECTED_SOURCE_SHA pin remains an independent runtime release gate and is not bypassed by this migration.

## Deferred new compiler diagnostics

React Compiler remains disabled. The existing rules-of-hooks/error and exhaustive-deps/warn plus every other Next/security/accessibility rule remain enabled. Only the new set-state-in-effect recommendation is deferred during this dependency-only migration; the new refs recommendation is also deferred for ProductionMap’s existing filter ref assignment. These are performance/compiler-adoption followups, not waived existing lint failures. React documents incremental adoption at https://react.dev/reference/eslint-plugin-react-hooks.

Original diagnostic inventory (src/components, source prior to upgrade): AccommodationBookingWorkspace.tsx:125; AkiDuermo.tsx:110,119; PersonalisationConsent.tsx:51,63,66; ProductionMap.tsx:216 (refs); StayProperty.tsx:47; ThemeModeControls.tsx:91.

Next16 image minimumCacheTTL is explicitly60 seconds to preserve the prior signed-media refresh interval. No explicit image-quality or local-query-image usage required migration.

Local test evidence: release-source1, product246, suite-navigation23 and shared eligibility29 tests passed; full npm check passed. No live account impersonation or production mutation was performed.
