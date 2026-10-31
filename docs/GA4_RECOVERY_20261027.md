# Independent GA4 recovery: AkiDuermo

Status: staged source, not activated or verified production collection.

## Change impact and provenance

Port of the isolated consent repair in elguiriashing/AkiCoches PR 62, with the canonical host changed to akiduermo.com. This affects root-mounted ConsentAnalytics on every route, EN/ES, both themes, anonymous and signed-in visitors. Existing server trackingAllowed AND stored privacy choices remain authoritative. No UI, route, schema, account permission, storage, booking, billing, Android or Firebase setting changes.

NEXT_PUBLIC_GA4_MEASUREMENT_ID must be the verified AkiDuermo web-stream G- ID at build time. Missing, invalid or copied AkiPasa IDs disable collection. The only permitted hosts are akiduermo.com and www.akiduermo.com. The gtag queue now uses native Arguments objects; Ads consent stays denied, Google Signals/personalization stay off, defaults precede configuration, cookie deletion uses this domain, and remounts do not duplicate the loader/configuration.

## Evidence and remaining acceptance

On 27 October, neither the akiduermo Worker nor its production build trigger e1263df1-5434-43f8-b2f5-49824c5e7e70 contained a GA4 measurement ID. The earlier Codex task reported existing Google properties and the owner confirmed reporting links; those links are not proof of collection. No Google properties, DNS verification, reporting links, robots policy or sitemaps are changed here.

Twenty executable tests against the actual transpiled component passed locally on Node 22.16.0 with installed TypeScript. The added read-only workflow repeats those tests with the exact lockfile. This is mocked behavior evidence, not full React/browser/GA4 acceptance. Existing full lint/types/tests/build/Cloudflare/browser gates remain required. Reconcile this record with the master/extraction/change-impact ledgers before release.

Before release: recover and verify the already-created AkiDuermo stream's G- measurement ID, configure NEXT_PUBLIC_GA4_MEASUREMENT_ID in the production build trigger, rebuild the reviewed SHA, verify the live source stamp, then check one correct destination and GA4 Realtime/DebugView receipt in an eligible consented session. Reject/withdrawn consent, restricted accounts and preview hosts must not collect. Verify both locales. Preserve the existing Search Console property/link; verify its published sitemap and private-page index restrictions separately.

Rollback: remove the measurement-ID build setting and rebuild. Do not restore the incorrect AkiPasa fallback. No data rollback is needed. This source-only recovery does not overwrite uncommitted Alex-Laptop work.


## 31 October reconciliation

PR #58 subsequently recorded the confirmed public AkiDuermo stream as
`G-1747PJ2DKZ`. The consolidated candidate uses that product-specific default
when the build override is absent; explicit blank/invalid/copied overrides remain
closed. The earlier missing-ID gate above is historical. No Google property is
created or replaced. Analytics remains subject to canonical host, existing
server eligibility and visitor consent. Revoke/deny/preview/remount and actual
native Arguments are tested; live Google receipt is reported separately.


