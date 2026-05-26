# Plan: Cross-Session Persistent Memory for Kira

## Context

Kira currently has zero user-specific knowledge. The system prompt is hardcoded and identical for every user. The edge function only touches the `profiles` table for rate limiting — it doesn't read any business info about the user. Closing a conversation means Kira forgets everything. The goal is to inject a persistent user profile block into every Kira call so Kira always knows who it's talking to and can give personalized, specific answers.

---

## What Already Exists (free data, no new collection needed)

- `profiles.display_name` — business/creator name
- `profiles.user_type` — 'creator' or 'brand'
- `profiles.bio` — free text description
- `creator_profiles.creator_types` — array: ["photographer", "videographer", etc.]
- `creator_profiles.goals` — array: ["brand_deals", "earn_skills", etc.]
- `brand_profiles.business_type` — "agency", "startup", etc.
- `brand_profiles.company_description`

**None of this is currently injected into the system prompt.** That's the first win — zero new data needed.

## What's Missing (needs new storage)

- Standard rates (e.g. KES 20,000 per shoot)
- Preferred currency (KES, USD, NGN)
- Regular clients (Nike, Safaricom, etc.)
- Payment terms preference (50% upfront, net 30, etc.)
- Free-text notes Kira should always remember

---

## Implementation Plan

### Step 1 — Migration (new file)
**File:** `supabase/migrations/[timestamp]_add_kira_memory.sql`

Add a single JSONB column to `profiles`:
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS kira_memory JSONB DEFAULT '{}';
```

Shape of the JSON:
```json
{
  "standard_rate": "KES 20,000 per shoot",
  "currency": "KES",
  "clients": ["Nike", "Safaricom"],
  "payment_terms": "50% upfront, balance on delivery",
  "notes": "Specializes in luxury fashion brands. Dislikes fixed-fee retainers."
}
```

No migration complexity. No new table. Just a nullable JSONB field.

---

### Step 2 — Edge Function Enhancement
**File:** `supabase/functions/kira-gpt/index.ts`

After auth verification and before the OpenAI call, fetch the user's full profile context:

```typescript
// Fetch profile + role-specific profile + kira_memory in one query
const { data: profile } = await supabaseAdmin
  .from('profiles')
  .select(`
    display_name, user_type, bio, kira_memory,
    creator_profiles (creator_types, goals),
    brand_profiles (business_type, company_description)
  `)
  .eq('id', userId)
  .single();
```

Then build a `USER_CONTEXT_BLOCK` string from that data and inject it at the top of the system prompt:

```
What you know about this user (use this to personalize every response):
- Name: [display_name]
- Type: [Creator / Brand]
- Niche: [creator_types joined]
- Standard rate: [kira_memory.standard_rate or "not set"]
- Currency: [kira_memory.currency or "KES (assumed)"]
- Regular clients: [kira_memory.clients or "none on file"]
- Payment terms: [kira_memory.payment_terms or "not set"]
- Notes: [kira_memory.notes or "none"]
```

If any field is empty/null, Kira uses it as an opportunity to learn ("I don't have your rate on file yet — what do you usually charge?").

---

### Step 3 — Memory Settings UI
**New file:** `src/components/kira/KiraMemoryPanel.tsx`

A simple settings panel accessible from the Kira page (gear icon or "Tell Kira about you" button). Fields:

| Field | Input type |
|---|---|
| Standard rate | Text (e.g. "KES 20,000 per shoot") |
| Preferred currency | Select (KES, USD, GBP, NGN, ZAR, EUR) |
| Regular clients | Tag input or comma-separated text |
| Payment terms | Text (e.g. "50% upfront") |
| Notes for Kira | Textarea |

On save: direct Supabase client update to `profiles.kira_memory`. No edge function needed for writes — the client already has an authenticated session.

---

### Step 4 — Wire into Kira Page
**File:** `src/pages/Kira.tsx`

Add a small "Memory" button/icon in the Kira header or sidebar that opens the `KiraMemoryPanel` in a sheet or modal. No page navigation — just a drawer.

---

## Files to Touch

| File | Change |
|---|---|
| `supabase/migrations/[ts]_add_kira_memory.sql` | New — adds `kira_memory JSONB` to profiles |
| `supabase/functions/kira-gpt/index.ts` | Read profile + build user context block + inject into system prompt |
| `src/components/kira/KiraMemoryPanel.tsx` | New — settings form for rates/currency/clients/notes |
| `src/pages/Kira.tsx` | Add memory panel trigger button |
| `src/integrations/supabase/types.ts` | Add `kira_memory` field to profiles Row/Insert/Update types |

---

## Verification

1. Set a standard rate in the Memory panel → save
2. Open a **new** conversation
3. Ask Kira "How should I price this client?" — response should reference your saved rate without you telling it
4. Ask Kira about a completely unrelated topic — memory should still be present but not intrusive
5. Test with `kira_memory = {}` (empty) — Kira should still function normally and ask to learn rates
