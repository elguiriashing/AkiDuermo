# Google Play data-safety preparation

This file is an engineering inventory, not a submitted declaration. Reconcile it
against the exact production release, privacy policy and Google Play form before
submission.

## Data the web application may process

- Account identifiers and contact details supplied for authentication.
- Reservation details, dates, party size, messages and reservation history.
- Saved stays and account preferences.
- Approximate or precise location only after an explicit user action and Android
  permission grant; manual destination search remains available.
- Files selected by the user for an authorised upload flow.
- Device, security, diagnostics and consent-aware analytics information exposed
  by the production website.

## Android shell behaviour

- Uses HTTPS only and accepts first-party cookies for the signed-in session.
- Rejects third-party cookies, cleartext traffic, executable URL schemes and
  unapproved download hosts.
- Requests location only when the loaded first-party site requests it.
- Opens non-AkiDuermo HTTPS, telephone, email, map and Play links externally.
- Disables Android cloud backup and device-transfer backup for app data.

## Submission gates

- Confirm every collected/shared category against production network evidence.
- Publish and link the final AkiDuermo privacy policy and account-deletion URL.
- Supply reviewer credentials only through Google Play Console.
- Verify retention/deletion statements with the shared Supabase account workflow.
