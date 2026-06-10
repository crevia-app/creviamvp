create table if not exists error_logs (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        references profiles(id) on delete set null,
  user_email    text,
  message       text        not null,
  stack         text,
  source        text        not null default 'unknown',
  url           text,
  user_agent    text,
  app_version   text,
  context       jsonb,
  resolved      boolean     not null default false,
  resolved_at   timestamptz,
  resolved_by   uuid,
  created_at    timestamptz not null default now()
);

alter table error_logs enable row level security;

-- Admins can read all errors
create policy "admin_read_errors" on error_logs
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Anyone (including anon) can insert — errors happen before/outside auth
create policy "anyone_insert_errors" on error_logs
  for insert with check (true);

-- Admins can update (resolve / unresolve)
create policy "admin_update_errors" on error_logs
  for update using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Admins can delete
create policy "admin_delete_errors" on error_logs
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- Fast queries: unresolved errors desc, per-user lookup
create index error_logs_created_at_idx  on error_logs (created_at desc);
create index error_logs_resolved_idx    on error_logs (resolved) where resolved = false;
create index error_logs_user_id_idx     on error_logs (user_id);
create index error_logs_source_idx      on error_logs (source);
