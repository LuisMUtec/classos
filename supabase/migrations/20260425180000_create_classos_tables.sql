-- ClassOS: tablas core (courses, lessons, exercises, students, interactions, progress)
-- Pegar en Supabase Studio → SQL editor → Run.

create extension if not exists pgcrypto;

-- ─── courses ────────────────────────────────────────────────────────────────
create table public.courses (
  id           uuid primary key default gen_random_uuid(),
  teacher_id   uuid not null,
  name         text not null check (length(name) > 0),
  subject      text not null check (subject in ('cs_python','math_algebra','math_calculus')),
  syllabus_md  text not null default '',
  mcp_token    text not null unique,
  created_at   timestamptz not null default now()
);

create index courses_teacher_idx on public.courses (teacher_id);
create index courses_token_idx   on public.courses (mcp_token);

-- ─── lessons ────────────────────────────────────────────────────────────────
create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  "order"     int  not null default 0,
  title       text not null check (length(title) > 0),
  content_md  text not null default '',
  objectives  jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index lessons_course_order_idx on public.lessons (course_id, "order");

-- ─── exercises ──────────────────────────────────────────────────────────────
-- verification_kind is duplicated from verification_spec->>'kind' for indexability.
-- Application layer keeps them in sync (via @edhack/contracts).
create table public.exercises (
  id                 uuid primary key default gen_random_uuid(),
  lesson_id          uuid not null references public.lessons(id) on delete cascade,
  topic              text not null,
  statement_md       text not null,
  difficulty         text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  verification_kind  text not null check (verification_kind in ('python_tests','sympy_equivalence','sympy_numeric','exact_match')),
  verification_spec  jsonb not null,
  created_at         timestamptz not null default now()
);

create index exercises_lesson_idx on public.exercises (lesson_id);
create index exercises_topic_idx  on public.exercises (topic);

-- ─── students ───────────────────────────────────────────────────────────────
create table public.students (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  display_name text not null check (length(display_name) > 0),
  anon_token   text not null unique,
  created_at   timestamptz not null default now()
);

create index students_course_idx on public.students (course_id);
create index students_token_idx  on public.students (anon_token);

-- ─── interactions ───────────────────────────────────────────────────────────
create table public.interactions (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.students(id) on delete cascade,
  course_id   uuid not null references public.courses(id)  on delete cascade,
  lesson_id   uuid references public.lessons(id)   on delete set null,
  exercise_id uuid references public.exercises(id) on delete set null,
  type        text not null check (type in (
    'tool_call',
    'context_requested',
    'exercise_generated',
    'exercise_attempted',
    'exercise_passed',
    'exercise_failed',
    'hint_requested',
    'concept_struggle',
    'concept_understood'
  )),
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index interactions_course_created_idx  on public.interactions (course_id, created_at desc);
create index interactions_student_created_idx on public.interactions (student_id, created_at desc);
create index interactions_type_idx            on public.interactions (course_id, type, created_at desc);

-- ─── progress ───────────────────────────────────────────────────────────────
create table public.progress (
  student_id     uuid not null references public.students(id) on delete cascade,
  lesson_id      uuid not null references public.lessons(id)  on delete cascade,
  mastery_score  numeric not null default 0 check (mastery_score >= 0 and mastery_score <= 1),
  attempts       int not null default 0,
  last_activity  timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create index progress_lesson_idx on public.progress (lesson_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────
-- Para hackathon: anonymous puede leer/insertar. En producción restringir por auth + token.
alter table public.courses      enable row level security;
alter table public.lessons      enable row level security;
alter table public.exercises    enable row level security;
alter table public.students     enable row level security;
alter table public.interactions enable row level security;
alter table public.progress     enable row level security;

create policy "anon all courses"      on public.courses      for all to anon using (true) with check (true);
create policy "anon all lessons"      on public.lessons      for all to anon using (true) with check (true);
create policy "anon all exercises"    on public.exercises    for all to anon using (true) with check (true);
create policy "anon all students"     on public.students     for all to anon using (true) with check (true);
create policy "anon all interactions" on public.interactions for all to anon using (true) with check (true);
create policy "anon all progress"     on public.progress     for all to anon using (true) with check (true);
