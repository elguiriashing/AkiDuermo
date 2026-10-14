# AkiDuermo repository guidance

This is the independent consumer accommodation application. Deploy source is `main`; extraction work remains on `migration/five-product-duermo` until required checks and review pass. Original AkiPasa public source `master` is **another repository** and must stay operational and untouched. Do not create worktrees unless explicitly asked; cloud tasks already have isolated checkouts.

Read `docs/EXTRACTION.md`, `docs/AKIPASA_MASTER.md` and relevant source contracts before changes. The copied historical contract/handoff is provenance, not evidence that features or migrations are currently deployed. Record affected route/locale/role/API/data/storage dependencies in `docs/CHANGE_IMPACT_REGISTER.md` and keep the extraction contract current.

Run `npm run check`, `npm run build`, `npm run build:cloudflare` and relevant browser tests before release. OpenNext release packaging requires a clean committed tracked source and stamps its exact HEAD. CI builds with inert local fixtures; deployable builds need verified real public configuration at build and runtime. Never publish a fixture artifact.

Canonical routes are actual root routes (`/`, `/stays/[slug]`, `/map`, `/saved`, `/account`, `/bookings`, `/settings`), without internal-product rewrites. Preserve EN/ES, theme and responsive navigation. Property management belongs to the server-authorized AkiBusiness workspace. User IDs, account roles, RLS, request booking states and server-side price calculations remain authoritative in the existing shared Supabase project. Local fixture/test successes do not establish real concurrency, RLS, payment or production acceptance.

Never put secrets in source, expose a service-role key, disable RLS, share cookies across unrelated roots, invent inventory/prices or claim unverified deployments. Do not add cron/webhook ownership here: existing AkiPasa owns global mail, billing, publication and cancellation tasks. Keep checkout/readiness flags unchanged. Deploys, domain redirects, provider updates, paid resources, external communications and linked production data mutations require explicit authorization and the release gates in `docs/EXTRACTION.md`.
