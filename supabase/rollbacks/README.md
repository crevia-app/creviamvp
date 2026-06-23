# Migration Rollback Scripts

Each file here undoes one forward migration from `supabase/migrations/`.

## Naming convention
`<timestamp>_<name>.sql` — matches the forward migration filename exactly.

## How to use
If a migration causes a production issue, run the matching rollback script
manually via the Supabase SQL editor or CLI:

```
supabase db query < supabase/rollbacks/<timestamp>_<name>.sql
```

Then deploy a corrective forward migration to restore to the intended state.

## Rule going forward
Every new migration added to `supabase/migrations/` must have a paired
rollback script added here before the PR is merged.
