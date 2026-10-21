# AkiDuermo repository guidance

This is the independent consumer accommodation application. Deploy source is `main`; extraction work remains on `migration/five-product-duermo` until required checks and review pass. Original AkiPasa public source `master` is **another repository** and must stay operational and untouched. Do not create worktrees unless explicitly asked; cloud tasks already have isolated checkouts.

Read `docs/EXTRACTION.md`, `docs/AKIPASA_MASTER.md` and relevant source contracts before changes. The copied historical contract/handoff is provenance, not evidence that features or migrations are currently deployed. Record affected route/locale/role/API/data/storage dependencies in `docs/CHANGE_IMPACT_REGISTER.md` and keep the extraction contract current.

Run `npm run check`, `npm run build`, `npm run build:cloudflare` and relevant browser tests before release. OpenNext release packaging requires a clean committed tracked source and stamps its exact HEAD. CI builds with inert local fixtures; deployable builds need verified real public configuration at build and runtime. Never publish a fixture artifact.

Canonical routes are actual root routes (`/`, `/stays/[slug]`, `/map`, `/saved`, `/account`, `/bookings`, `/settings`), without internal-product rewrites. Preserve EN/ES, theme and responsive navigation. Property management belongs to the server-authorized AkiBusiness workspace. User IDs, account roles, RLS, request booking states and server-side price calculations remain authoritative in the existing shared Supabase project. Local fixture/test successes do not establish real concurrency, RLS, payment or production acceptance.

Never put secrets in source, expose a service-role key, disable RLS, share cookies across unrelated roots, invent inventory/prices or claim unverified deployments. Do not add cron/webhook ownership here: existing AkiPasa owns global mail, billing, publication and cancellation tasks. Keep checkout/readiness flags unchanged. Deploys, domain redirects, provider updates, paid resources, external communications and linked production data mutations require explicit authorization and the release gates in `docs/EXTRACTION.md`.

## Preserved remote-main migration instructions

# Codex migration instructions — AkiDuermo

This repository is being extracted from `elguiriashing/akipasa` at its latest `master`. The existing main production repo and Worker MUST remain functional and unchanged by this extraction.

Canonical domain: `https://akiduermo.com`. Legacy host: `https://akiduermo.akipasa.com`.

- Read `README.md` first. Treat it as the product-specific extraction contract.
- Copy the actual application and all necessary transitive dependencies. Do not fabricate replacement functionality or ship placeholders.
- Implement **independent** Next.js/OpenNext Cloudflare build scripts, Wrangler configuration and CI.
- Preserve Supabase user identities, tenancy/RLS protections and business/booking identifiers. Shared project ref: `vhpbvcfkcteswlsdjrfl`.
- Keep real credentials in Cloudflare secrets. No private keys in Git or PRs.
- Cross-domain logins require explicit OAuth redirect allowlists and robust sessions; do not rely on cross-site cookies.
- Build/test and preview before attaching new production hostnames. Do not modify legacy redirects until the new system is verified.
- Write down skipped functionality and risks in the PR; no silent regressions.
- Coordinate with ongoing Codex work to avoid overlapping branches or forced pushes.

## Version-matched framework documentation

For Next16 migration/runtime work, read installed `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md` when present; bundled docs match the exact installed dependency. Existing product and release contracts above still apply.
