-- Saved clients address book for invoice autofill
create table if not exists public.saved_clients (
  id              uuid        default gen_random_uuid() primary key,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  client_name     text        not null,
  client_email    text,
  client_phone    text,
  billing_address text,
  tax_id          text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Unique per user so upsert on (user_id, client_name) works
alter table public.saved_clients
  add constraint saved_clients_user_name_unique unique (user_id, client_name);

alter table public.saved_clients enable row level security;

create policy "saved_clients_select" on public.saved_clients
  for select using (auth.uid() = user_id);

create policy "saved_clients_insert" on public.saved_clients
  for insert with check (auth.uid() = user_id);

create policy "saved_clients_update" on public.saved_clients
  for update using (auth.uid() = user_id);

create policy "saved_clients_delete" on public.saved_clients
  for delete using (auth.uid() = user_id);

-- Keep updated_at current
create or replace function public.handle_saved_clients_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger saved_clients_updated_at
  before update on public.saved_clients
  for each row execute procedure public.handle_saved_clients_updated_at();
