-- Materials: archivos que el docente sube como contexto adicional para una lección.
-- Mínimo viable: metadata + content_md extraído (por ahora plain text, sin embeddings).
-- Storage real (PDFs/imgs) vive en Supabase Storage, bucket "materials".

create table public.materials (
  id          uuid primary key default gen_random_uuid(),
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  title       text not null check (length(title) > 0),
  mime        text not null,
  file_path   text,                                -- path en storage (bucket "materials")
  file_url    text,                                -- public/signed URL si aplica
  content_md  text not null default '',            -- texto extraído (markdown plano)
  size_bytes  int,
  created_at  timestamptz not null default now()
);

create index materials_lesson_idx on public.materials (lesson_id);

alter table public.materials enable row level security;

create policy "anon all materials"
  on public.materials
  for all to anon
  using (true)
  with check (true);

-- Storage bucket para los binarios. La policy más laxa hasta que tengamos auth real.
insert into storage.buckets (id, name, public)
values ('materials', 'materials', true)
on conflict (id) do nothing;

create policy "anon read materials bucket"
  on storage.objects for select
  to anon
  using (bucket_id = 'materials');

create policy "anon write materials bucket"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'materials');
