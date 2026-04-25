-- edhack: tabla runs (anonymous, multi-pipeline).
-- Pegar en Supabase Studio → SQL editor → Run.

create extension if not exists pgcrypto;

create table public.runs (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  pipeline_id      text not null,
  mastra_run_id    text,
  input            jsonb not null,
  result           jsonb not null,
  markdown         text,
  iteration_count  int  not null default 1,
  exec_exit_code   int,
  exec_duration_ms int,
  elapsed_ms       int,
  topic            text,
  title            text
);

create index runs_pipeline_created_idx
  on public.runs (pipeline_id, created_at desc);

alter table public.runs enable row level security;

-- Anonymous puede leer todo (banco compartido) e insertar (sin auth).
-- Para producción: agregar auth + restringir a `authenticated`, o mover insert a Edge Function.
create policy "anon read all"
  on public.runs for select to anon using (true);

create policy "anon insert"
  on public.runs for insert to anon with check (true);
