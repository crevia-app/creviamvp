# Plan: Fix "Database error saving new user" on signup

## Context

The production app at `https://creviamvp.vercel.app` returns `Database error saving new user` (HTTP 500) on every signup attempt. All prior diagnostics ruled out:
- RLS blocking the INSERT (function is SECURITY DEFINER, owned by postgres, BYPASSRLS = true)
- Missing NOT NULL columns (only id, user_type, handle — all populated by trigger)
- Duplicate user in auth.users (confirmed no existing record)
- Broken trigger logic (Query 3 simulation of the profiles INSERT succeeded)

**Root cause identified:** The `handle_new_user` trigger function accesses `NEW.raw_user_metadata` but the actual column in Supabase's `auth.users` table is `raw_user_meta_data` (with underscore between "meta" and "data"). This is a runtime field-access error — it didn't surface in Query 3 because that simulation bypassed the trigger entirely and tested only the `INSERT INTO profiles` directly.

**Evidence of inconsistency:** Migration `20251121050933` (the THIRD migration ever applied) correctly uses `NEW.raw_user_meta_data`. Both the original trigger migration (`20251121041835`) and the latest fix migration (`20260429000000`) incorrectly use `NEW.raw_user_metadata`. This means the most recent `CREATE OR REPLACE FUNCTION` in production has the wrong column name.

---

## Fix: Two SQL statements + one dashboard change

### Step 1 — Confirm the column name (diagnostic, 30 seconds)

Run in Supabase SQL Editor:
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
  AND column_name LIKE '%meta%';
```
Expected result: `raw_app_meta_data` and `raw_user_meta_data`.
If confirmed → proceed to Step 2.

### Step 2 — Fix the trigger function (critical fix)

Run in Supabase SQL Editor:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  base_handle TEXT;
  final_handle TEXT;
  counter INTEGER := 0;
BEGIN
  base_handle := LOWER(
    REGEXP_REPLACE(
      COALESCE(NEW.raw_user_meta_data->>'handle', SPLIT_PART(NEW.email, '@', 1)),
      '[^a-z0-9_]', '_', 'g'
    )
  );

  final_handle := base_handle;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE handle = final_handle) LOOP
    counter := counter + 1;
    final_handle := base_handle || '_' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, user_type, handle, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'creator')::public.user_type,
    final_handle,
    NEW.email
  );

  RETURN NEW;
END;
$$;
```

### Step 3 — Set production URL in Supabase dashboard (1 minute)

Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://creviamvp.vercel.app`
- **Redirect URLs**: add `https://creviamvp.vercel.app/**`

This prevents GoTrue from rejecting the `emailRedirectTo` value that `Auth.tsx` sends.

### Step 4 — Also update the migration file (keeps local in sync with prod)

File: `supabase/migrations/20260429000000_fix_handle_uniqueness.sql`
Change both occurrences of `NEW.raw_user_metadata` → `NEW.raw_user_meta_data`

---

## Critical files

- `supabase/migrations/20260429000000_fix_handle_uniqueness.sql` — trigger function to fix
- `supabase/migrations/20251121041835_a3cab193-ad0e-43e4-ae2b-bcc05f231867.sql` — original (also wrong, but superseded)
- Supabase Dashboard → Authentication → URL Configuration (dashboard, not a file)

---

## Verification

1. Run Step 1 SQL — confirm `raw_user_meta_data` is the actual column name
2. Run Step 2 SQL — confirm it says `CREATE FUNCTION` (success)
3. Set Step 3 in dashboard — save changes
4. Go to `https://creviamvp.vercel.app/auth?mode=signup`
5. Sign up with a real email
6. Confirm: "Check your inbox" card appears (no error toast)
7. Confirm: email arrives from `hi@crevia.app` with the Crevia dark template
8. Confirm: clicking the link → spinner → redirects to `/kira`
