# AkiDuermo

Independent accommodation application extracted from `elguiriashing/akipasa` public master `080ea0ffb2dd6612436acd04c25b4daf8ff71129`. Canonical domain: https://akiduermo.com. Existing AkiPasa source and deployment remain intact.

Node 22+ and npm are required. Run `npm ci`, copy `.env.example` to ignored `.env.local`, bind the **existing** Supabase URL and public key, then run `npm run dev -- --port 3102`. `NEXT_PUBLIC_DATA_PROVIDER=fixtures` supports anonymous offline development without real inventory; it does not prove live availability or booking acceptance.

`npm run check` runs lint, TypeScript and focused booking/discovery/auth/privacy regressions. `npm run build` builds Next; commit tracked changes before `npm run build:cloudflare` (the release-source guard requires clean Git). `npm run dry-run:cloudflare` validates deployment packaging without publication. CI never publishes automatically.

Root, `/stays/[slug]`, `/saved`, `/map`, `/account`, `/bookings`, `/settings`, localized auth callback/recovery and terms run independently. Membership aliases navigate to AkiPasa's authoritative catalogue/account billing with `from=akiduermo`. Property management navigates to https://akibusiness.com and remains protected by that application's existing tenant authorization. No checkout, webhook or scheduler is duplicated here.

See [migration and deployment contract](docs/EXTRACTION.md). Production release, custom domains and provider redirect configuration are separately gated; a successful local build is not live acceptance.

The initial remote-main [migration contract](docs/INITIAL_MIGRATION_CONTRACT.md) is preserved. This extraction candidate extends that groundwork; its production readiness checklist remains unfulfilled until provider and deployed acceptance pass.
