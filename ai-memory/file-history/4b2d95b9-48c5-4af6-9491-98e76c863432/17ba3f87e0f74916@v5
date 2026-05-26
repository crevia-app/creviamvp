# Crevia — CRITICAL BUG: Kira AI Down (Broken DB Columns + RPC)

## ROOT CAUSE (Confirmed)

**Problem**: Migrations `20260413000000` and `20260429100000` are recorded as "applied" in Supabase's tracking table but the SQL **never actually ran** on the remote database.

**Evidence**: Direct PostgREST query returned `{"code":"42703","message":"column profiles.kira_actions_used does not exist"}`.

**Consequence chain**:
1. `kira_actions_used`, `kira_actions_limit`, `kira_usage_month` columns **do not exist** in remote `profiles` table
2. `consume_kira_action` RPC **does not exist** (its SQL references the missing columns → creation failed silently)
3. `kira-gpt` edge function calls `supabase.rpc('consume_kira_action', ...)` → gets "function not found" → `gateError` is set → returns **HTTP 500**
4. Three client-side `profiles` queries for `kira_actions_used` → **HTTP 400** each (column doesn't exist)

## THE FIX — 3 Steps

### Step 1: New migration to add the missing DB objects
**File to create**: `supabase/migrations/20260507000000_fix_kira_db_objects.sql`

Contents (all idempotent):
```sql
-- Add missing kira tracking columns (IF NOT EXISTS guards make this safe to re-run)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_actions_used   INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_actions_limit  INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_usage_month    TEXT    DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_tokens_used    INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kira_tokens_limit   INTEGER DEFAULT 50000;

-- Ensure free-tier users have correct limit (10, not 5 from old migration)
UPDATE public.profiles SET kira_actions_limit = 10 WHERE kira_actions_limit IS NULL OR kira_actions_limit < 10;

-- Recreate the atomic gate RPC (CREATE OR REPLACE is idempotent)
CREATE OR REPLACE FUNCTION public.consume_kira_action(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_used  INTEGER;
  v_limit INTEGER;
  v_month TEXT;
BEGIN
  SELECT kira_actions_used, kira_actions_limit, kira_usage_month
    INTO v_used, v_limit, v_month
    FROM public.profiles
   WHERE id = p_user_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF v_month IS DISTINCT FROM TO_CHAR(CURRENT_DATE, 'YYYY-MM') THEN
    UPDATE public.profiles
       SET kira_actions_used = 0,
           kira_usage_month  = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
     WHERE id = p_user_id;
    v_used := 0;
  END IF;

  IF v_used >= v_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
     SET kira_actions_used = v_used + 1
   WHERE id = p_user_id;

  RETURN TRUE;
END;
$$;
```

### Step 2: Push migration to remote
```bash
npx supabase db push
```
This applies the new migration to production. The columns and RPC will now exist.

### Step 3: Remove redundant client-side limit check from Kira.tsx
**File**: `src/pages/Kira.tsx` lines 292–304 in `streamKiraResponse`

**Remove this block** (it's redundant — server-side gate handles it, and it was causing the 3 GET 400 errors):
```typescript
// ── CHECK KIRA DAILY LIMIT ──
const { data: profile } = await supabase
  .from('profiles')
  .select('kira_actions_used, kira_actions_limit')
  .eq('id', userId)
  .single();

const actionsToday = profile?.kira_actions_used || 0;
const actionsLimit = profile?.kira_actions_limit || 10;

if (actionsToday >= actionsLimit) {
  throw new Error("You have reached your daily Kira limit of " + actionsLimit + " actions. Upgrade to Pro for 40 actions per day.");
}
```

The server returns HTTP 429 with `{"error":"Daily Kira limit reached. Upgrade to Pro for 40 actions per day."}` which the existing error handler already surfaces to the user via toast. No client-side check needed.

## UNCHANGED FILES
- `supabase/functions/kira-gpt/index.ts` — no changes needed, logic is correct
- `supabase/functions/kira-suggestions/index.ts` — no changes
- All other files — untouched

## VERIFICATION
After push:
1. Refresh the app — the 3 GET 400 errors should be gone
2. Send a message to Kira — should get a real response (no "hiccup")
3. The UsageLimitBanner should correctly show the action count
