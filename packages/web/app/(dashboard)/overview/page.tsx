import {
  ArrowRightIcon,
  BookOpenIcon,
  GraduationCapIcon,
  MessageSquareIcon,
  SparklesIcon,
  PlusIcon,
  ListChecksIcon,
} from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/ui/stat-card";
import { IconBadge } from "@/components/ui/icon-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface CourseRow {
  id: string;
  name: string;
  subject: string;
  syllabus_md: string;
  created_at: string;
}

const SUBJECT_LABEL: Record<string, string> = {
  cs_python: "CS · Python",
  math_algebra: "Mate · Álgebra",
  math_calculus: "Mate · Cálculo",
};

async function loadTeacherSummary() {
  if (!isSupabaseConfigured()) {
    return {
      courses: [] as CourseRow[],
      totalLessons: 0,
      totalExercises: 0,
      lessonsByCourse: new Map<string, number>(),
      configured: false,
    };
  }
  const c = getSupabase();
  const [coursesRes, lessonsRes, exercisesRes] = await Promise.all([
    c
      .from("courses")
      .select("id, name, subject, syllabus_md, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    c.from("lessons").select("id, course_id"),
    c.from("exercises").select("id"),
  ]);
  const courses = (coursesRes.data ?? []) as CourseRow[];
  const lessons = (lessonsRes.data ?? []) as { id: string; course_id: string }[];
  const exercises = (exercisesRes.data ?? []) as { id: string }[];
  const lessonsByCourse = new Map<string, number>();
  for (const l of lessons) {
    lessonsByCourse.set(l.course_id, (lessonsByCourse.get(l.course_id) ?? 0) + 1);
  }
  return {
    courses,
    totalLessons: lessons.length,
    totalExercises: exercises.length,
    lessonsByCourse,
    configured: true,
  };
}

export default async function OverviewPage() {
  const { courses, totalLessons, totalExercises, lessonsByCourse, configured } =
    await loadTeacherSummary();

  return (
    <>
      <div className="relative -mx-4 -mt-4 px-4 pt-4 md:-mx-8 md:-mt-8 md:px-8 md:pt-8">
        <div
          aria-hidden="true"
          className="brand-glow pointer-events-none absolute inset-x-0 top-0 h-72"
        />
        <PageHeader
          eyebrow="Profesor"
          title="Tu sala de profesores"
          description="Crea y edita cursos conversando con la IA. Tus alumnos los ven al instante en su vista."
          actions={
            <>
              <Button variant="outline" asChild>
                <Link href="/courses">
                  <BookOpenIcon /> Mis cursos
                </Link>
              </Button>
              <Button asChild>
                <Link href="/chat">
                  <SparklesIcon /> Crear con IA
                </Link>
              </Button>
            </>
          }
        />
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Cursos"
          value={courses.length}
          hint={configured ? "publicados a tus alumnos" : "Supabase no configurado"}
          icon={<BookOpenIcon />}
          href="/courses"
        />
        <StatCard
          label="Lecciones"
          value={totalLessons}
          hint="totales en tus cursos"
          icon={<ListChecksIcon />}
          href="/courses"
        />
        <StatCard
          label="Ejercicios"
          value={totalExercises}
          hint="generados con IA y verificables"
          icon={<SparklesIcon />}
          href="/courses"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <article className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-xs">
          <header className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Badge variant="outline" className="w-fit">
                Mis cursos recientes
              </Badge>
              <h2 className="text-base font-semibold tracking-tight">
                {courses.length === 0 ? "Aún no tienes cursos" : "Continúa donde quedaste"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {courses.length === 0
                  ? "Crea tu primer curso conversando con el asistente."
                  : "Click en un curso para ver lecciones y ejercicios."}
              </p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link href="/chat">
                <PlusIcon /> Nuevo
              </Link>
            </Button>
          </header>

          {courses.length === 0 ? (
            <EmptyState
              icon={<BookOpenIcon />}
              title="Sin cursos todavía"
              description={
                configured
                  ? 'Ve a "Crear con IA" y dile algo como: «Crea un curso de Python intro».'
                  : "Configura Supabase en Settings → Persistencia para empezar a guardar cursos."
              }
              actions={
                <Button asChild>
                  <Link href="/chat">
                    <SparklesIcon /> Crear con IA
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="flex flex-col divide-y">
              {courses.map((course) => (
                <li key={course.id}>
                  <Link
                    href="/courses"
                    className="group/row flex items-center gap-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
                  >
                    <IconBadge tone="primary" size="sm">
                      <BookOpenIcon />
                    </IconBadge>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-sm font-medium">{course.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {SUBJECT_LABEL[course.subject] ?? course.subject} ·{" "}
                        {lessonsByCourse.get(course.id) ?? 0} lecciones
                      </p>
                    </div>
                    <ArrowRightIcon className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs">
          <header className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight">Atajos</h2>
            <p className="text-sm text-muted-foreground">
              Lo que harás con más frecuencia.
            </p>
          </header>
          <div className="flex flex-col gap-2">
            <ShortcutRow
              icon={<SparklesIcon />}
              label="Crear o editar un curso"
              hint="Conversa con el asistente"
              href="/chat"
            />
            <ShortcutRow
              icon={<BookOpenIcon />}
              label="Mis cursos"
              hint="Lecciones y ejercicios"
              href="/courses"
            />
            <ShortcutRow
              icon={<GraduationCapIcon />}
              label="Vista del alumno"
              hint="Cómo lo ven tus estudiantes"
              href="/student"
            />
            <ShortcutRow
              icon={<MessageSquareIcon />}
              label="Chat de prueba"
              hint="Sandbox del asistente"
              href="/chat"
            />
          </div>
        </article>
      </section>
    </>
  );
}

function ShortcutRow({
  icon,
  label,
  hint,
  href,
  external,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  href: string;
  external?: boolean;
}) {
  const cls =
    "group/row flex items-center gap-3 rounded-lg border border-transparent p-2.5 text-sm transition-colors hover:border-border hover:bg-muted/40";
  const inner = (
    <>
      <IconBadge tone="muted" size="sm">
        {icon}
      </IconBadge>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{hint}</p>
      </div>
      <ArrowRightIcon className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/row:translate-x-0 group-hover/row:opacity-100" />
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
