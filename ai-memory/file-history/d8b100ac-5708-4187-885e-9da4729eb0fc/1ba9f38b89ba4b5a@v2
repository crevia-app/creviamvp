-- Enable pgvector (pre-installed on Supabase)
create extension if not exists vector;

-- ── Long-term memory vector store ──────────────────────────────────────────
create table if not exists kira_memories (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  content     text        not null,
  embedding   vector(1536),
  metadata    jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

-- IVFFlat index for fast cosine similarity search
create index if not exists kira_memories_embedding_idx
  on kira_memories using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table kira_memories enable row level security;

create policy "Users own their memories"
  on kira_memories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Similarity search RPC ───────────────────────────────────────────────────
create or replace function match_kira_memories(
  query_embedding vector(1536),
  match_count     int   default 5,
  filter          jsonb default '{}'
)
returns table (
  id         uuid,
  content    text,
  metadata   jsonb,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    km.id,
    km.content,
    km.metadata,
    1 - (km.embedding <=> query_embedding) as similarity
  from kira_memories km
  where
    filter->>'user_id' is null
    or km.user_id = (filter->>'user_id')::uuid
  order by km.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ── Conversation summaries ──────────────────────────────────────────────────
create table if not exists conversation_summaries (
  conversation_id uuid        primary key references kira_conversations(id) on delete cascade,
  user_id         uuid        not null references auth.users(id) on delete cascade,
  summary         text        not null,
  message_count   int         not null default 0,
  updated_at      timestamptz not null default now()
);

alter table conversation_summaries enable row level security;

create policy "Users own their summaries"
  on conversation_summaries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
