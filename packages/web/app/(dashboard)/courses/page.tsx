import Link from "next/link";
import {
  BookOpenIcon,
  FileTextIcon,
  KeyRoundIcon,
  MessageSquareIcon,
  UploadIcon,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

interface CourseRow {
  id: string;
  name: string;
  subject: string;
  syllabus_md: string;
  mcp_token: string;
}

interface LessonRow {
  id: string;
  course_id: string;
  order: number;
  title: string;
}

interface ExerciseRow {
  id: string;
  lesson_id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  verification_kind: string;
  statement_md: string;
}

interface MaterialRow {
  id: string;
  lesson_id: string;
  title: string;
  mime: string;
  file_url: string | null;
}

const SUBJECT_LABEL: Record<string, string> = {
  cs_python: "CS · Python",
  math_algebra: "Mate · Álgebra",
  math_calculus: "Mate · Cálculo",
};

const DIFFICULTY_VARIANT: Record<string, "secondary" | "warning" | "destructive"> = {
  easy: "secondary",
  medium: "warning",
  hard: "destructive",
};

async function loadAuthoringSnapshot(): Promise<{
  courses: CourseRow[];
  lessonsByCourse: Map<string, LessonRow[]>;
  exercisesByLesson: Map<string, ExerciseRow[]>;
  materialsByLesson: Map<string, MaterialRow[]>;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return {
      courses: [],
      lessonsByCourse: new Map(),
      exercisesByLesson: new Map(),
      materialsByLesson: new Map(),
      error: "Supabase no configurado",
    };
  }
  try {
    const c = getSupabase();

    const { data: courses, error: cErr } = await c
      .from("courses")
      .select("id, name, subject, syllabus_md, mcp_token")
      .order("created_at", { ascending: false });
    if (cErr) throw cErr;

    const courseIds = (courses ?? []).map((cr) => cr.id as string);
    const lessonsByCourse = new Map<string, LessonRow[]>();
    const exercisesByLesson = new Map<string, ExerciseRow[]>();
    const materialsByLesson = new Map<string, MaterialRow[]>();

    if (courseIds.length > 0) {
      const { data: lessons, error: lErr } = await c
        .from("lessons")
        .select('id, course_id, "order", title')
        .in("course_id", courseIds)
        .order("order", { ascending: true });
      if (lErr) throw lErr;

      for (const l of (lessons ?? []) as LessonRow[]) {
        const arr = lessonsByCourse.get(l.course_id) ?? [];
        arr.push(l);
        lessonsByCourse.set(l.course_id, arr);
      }

      const lessonIds = (lessons ?? []).map((l) => l.id as string);
      if (lessonIds.length > 0) {
        const [{ data: exercises, error: eErr }, { data: materials, error: mErr }] =
          await Promise.all([
            c
              .from("exercises")
              .select("id, lesson_id, topic, difficulty, verification_kind, statement_md")
              .in("lesson_id", lessonIds)
              .order("difficulty", { ascending: true }),
            c
              .from("materials")
              .select("id, lesson_id, title, mime, file_url")
              .in("lesson_id", lessonIds)
              .order("created_at", { ascending: false }),
          ]);
        if (eErr) throw eErr;
        if (mErr) throw mErr;

        for (const ex of (exercises ?? []) as ExerciseRow[]) {
          const arr = exercisesByLesson.get(ex.lesson_id) ?? [];
          arr.push(ex);
          exercisesByLesson.set(ex.lesson_id, arr);
        }

        for (const m of (materials ?? []) as MaterialRow[]) {
          const arr = materialsByLesson.get(m.lesson_id) ?? [];
          arr.push(m);
          materialsByLesson.set(m.lesson_id, arr);
        }
      }
    }

    return {
      courses: (courses ?? []) as CourseRow[],
      lessonsByCourse,
      exercisesByLesson,
      materialsByLesson,
      error: null,
    };
  } catch (err) {
    return {
      courses: [],
      lessonsByCourse: new Map(),
      exercisesByLesson: new Map(),
      materialsByLesson: new Map(),
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function statementExcerpt(md: string): string {
  const firstLine = md.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.replace(/^#+\s*/, "").slice(0, 120);
}

export default async function CoursesPage() {
  const { courses, lessonsByCourse, exercisesByLesson, materialsByLesson, error } =
    await loadAuthoringSnapshot();

  const totalLessons = Array.from(lessonsByCourse.values()).reduce(
    (sum, ls) => sum + ls.length,
    0,
  );
  const totalExercises = Array.from(exercisesByLesson.values()).reduce(
    (sum, exs) => sum + exs.length,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="Trabajo"
        title="Courses"
        description="Vista de autor: todos los cursos, lecciones y ejercicios persistidos. Para crear/editar, usa /chat."
        actions={
          <>
            <Badge variant="outline">
              {courses.length} curso{courses.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline">{totalLessons} lecciones</Badge>
            <Badge variant="outline">{totalExercises} ejercicios</Badge>
            <Button asChild size="sm">
              <Link href="/courses/upload">
                <UploadIcon className="size-4" />
                Subir material
              </Link>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <Link href="/chat">
                <MessageSquareIcon className="size-4" />
                Crear/editar en /chat
              </Link>
            </Button>
          </>
        }
      />

      {error ? (
        <Card className="flex items-start gap-3 border-warning/40 bg-warning/5 p-4">
          <KeyRoundIcon className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium">No se pudo cargar</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </Card>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<BookOpenIcon />}
          title="Aún no hay cursos"
          description="Entra a /chat y pídele al asistente que cree un curso."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course) => {
            const lessons = lessonsByCourse.get(course.id) ?? [];
            const courseExerciseCount = lessons.reduce(
              (n, l) => n + (exercisesByLesson.get(l.id)?.length ?? 0),
              0,
            );
            return (
              <Card key={course.id} className="overflow-hidden">
                <div className="flex flex-col gap-2 border-b bg-muted/30 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{course.name}</h2>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {SUBJECT_LABEL[course.subject] ?? course.subject}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      mcp:{course.mcp_token}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {lessons.length} lección{lessons.length === 1 ? "" : "es"} ·{" "}
                      {courseExerciseCount} ejercicio{courseExerciseCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  {course.syllabus_md ? (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {course.syllabus_md.replace(/^#+\s*/gm, "").trim()}
                    </p>
                  ) : null}
                </div>

                {lessons.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">
                    Sin lecciones todavía.
                  </div>
                ) : (
                  <ul className="divide-y">
                    {lessons.map((lesson) => {
                      const exs = exercisesByLesson.get(lesson.id) ?? [];
                      const mats = materialsByLesson.get(lesson.id) ?? [];
                      return (
                        <li key={lesson.id} className="px-4 py-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{lesson.order}
                            </span>
                            <h3 className="text-sm font-medium">{lesson.title}</h3>
                            <span className="ml-auto text-xs text-muted-foreground">
                              {exs.length} ejercicio{exs.length === 1 ? "" : "s"}
                              {mats.length > 0 ? ` · ${mats.length} material${mats.length === 1 ? "" : "es"}` : ""}
                            </span>
                          </div>
                          {exs.length > 0 ? (
                            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                              {exs.map((ex) => (
                                <li
                                  key={ex.id}
                                  className="flex items-start gap-2 rounded-md border bg-background/50 px-2 py-1.5 text-xs"
                                >
                                  <Badge
                                    variant={DIFFICULTY_VARIANT[ex.difficulty] ?? "outline"}
                                    className="text-[10px] uppercase"
                                  >
                                    {ex.difficulty}
                                  </Badge>
                                  <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="truncate font-medium">
                                      {statementExcerpt(ex.statement_md)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {ex.topic} · {ex.verification_kind}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {mats.length > 0 ? (
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {mats.map((m) => {
                                const inner = (
                                  <>
                                    <FileTextIcon className="size-3 text-muted-foreground" />
                                    <span className="truncate font-medium">{m.title}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {m.mime}
                                    </span>
                                  </>
                                );
                                return (
                                  <li key={m.id} className="max-w-full">
                                    {m.file_url ? (
                                      <a
                                        href={m.file_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-1.5 rounded-md border bg-background/50 px-2 py-1 text-[11px] hover:bg-muted"
                                      >
                                        {inner}
                                      </a>
                                    ) : (
                                      <span className="flex items-center gap-1.5 rounded-md border bg-background/50 px-2 py-1 text-[11px]">
                                        {inner}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
