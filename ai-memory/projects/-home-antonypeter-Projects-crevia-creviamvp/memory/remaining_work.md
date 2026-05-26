---
name: Remaining Work Before Launch
description: Feature gaps that must be addressed before the 2026-05-04 hard launch
type: project
originSessionId: 5575c1c2-2ae2-40d7-b4ef-59c8f88d8717
---
As of 2026-05-18, these items are not yet done:

1. **Lead-to-Contract workflow** — Not started.

2. **Seat-based pricing enforcement** — Removed from UI; backend never enforced seat limits.

3. **GitHub repo → private** — Settings-only change, no code.

**Completed:** SMTP fixed, WhatsApp chat, 36 premium Crevia Link themes, contract send edge function, footer logo, Pricing page cleanup, PWA install banner. Full mobile responsiveness pass. New Crevia logo. SendDocumentDialog workspace DM. Nav link spacing. "Own Your Story" CTA. Kira React.useState crash fixed (was crashing entire /kira page on load). **Paystack USD integration complete** — Pricing page charges USD $14.99 (card) or KES 1,949 (M-Pesa/mobile money). PaymentsBilling page updated: payment method dialog with Card (USD) + Mobile Money (KES) options, both functional. Webhook handles charge.success, renewals, failures, cancellations. App_settings guard prevents stale KES values from overriding USD defaults. Admin panel updated to show USD $ pricing.

**Why:** Lead-to-contract is the last major feature. Paystack USD unblocked and shipped 2026-05-18.

**How to apply:** When the user asks what to work on next, surface lead-to-contract workflow first.
