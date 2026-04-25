import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";

let cached: SupabaseClient | null = null;
export function db(): SupabaseClient {
  if (cached) return cached;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "e2e/db: falta SUPABASE_SERVICE_ROLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY como fallback) en el entorno",
    );
  }
  cached = createClient(URL, key, { auth: { persistSession: false } });
  return cached;
}

export const E2E_TEACHER_ID = "00000000-0000-0000-0000-00000000e2ed";
export const E2E_STUDENT_ID = "00000000-0000-0000-0000-0000000571d0";
export const E2E_COURSE_TAG = "e2e:";

/**
 * Reset all rows produced by the docente test suite. Conservative: deletes
 * only courses whose name starts with E2E_COURSE_TAG (cascade wipes
 * lessons/exercises/materials/interactions). Safe to run multiple times.
 */
export async function resetTeacherFixtures(): Promise<void> {
  const c = db();
  await c.from("courses").delete().like("name", `${E2E_COURSE_TAG}%`);
}

export interface SeededSample {
  courseId: string;
  lessonId: string;
  exerciseId: string;
  studentId: string;
  mcpToken: string;
}

/**
 * Seeds a deterministic course + lesson + python_tests exercise + 1 student
 * for the estudiante suite. Idempotent: cleans before inserting.
 */
export async function seedSampleCourse(): Promise<SeededSample> {
  const c = db();
  const courseName = `${E2E_COURSE_TAG}sample`;
  await c.from("courses").delete().eq("name", courseName);

  const mcp_token = `e2e-${randomUUID()}`;
  const { data: course, error: ce } = await c
    .from("courses")
    .insert({
      teacher_id: E2E_TEACHER_ID,
      name: courseName,
      subject: "cs_python",
      syllabus_md: "Curso de muestra para e2e.",
      mcp_token,
    })
    .select("id")
    .single();
  if (ce || !course) throw new Error(`seed course: ${ce?.message}`);

  const { data: lesson, error: le } = await c
    .from("lessons")
    .insert({
      course_id: course.id,
      order: 0,
      title: "Loops básicos",
      content_md:
        "# Loops\n\nUn `for` en Python recorre cualquier iterable. Ejemplo:\n\n```python\nfor x in [1,2,3]:\n  print(x)\n```",
      objectives: ["Identificar un for", "Sumar elementos de una lista con un loop"],
    })
    .select("id")
    .single();
  if (le || !lesson) throw new Error(`seed lesson: ${le?.message}`);

  const { data: exercise, error: ee } = await c
    .from("exercises")
    .insert({
      lesson_id: lesson.id,
      topic: "loops",
      statement_md:
        "Implementa `def suma(xs: list[int]) -> int` que devuelva la suma de los elementos.",
      difficulty: "easy",
      verification_kind: "python_tests",
      verification_spec: {
        kind: "python_tests",
        entry: "suma",
        tests: [
          { name: "vacia", input: [[]], expected: 0 },
          { name: "una", input: [[5]], expected: 5 },
          { name: "varias", input: [[1, 2, 3]], expected: 6 },
        ],
      },
    })
    .select("id")
    .single();
  if (ee || !exercise) throw new Error(`seed exercise: ${ee?.message}`);

  const { data: student, error: se } = await c
    .from("students")
    .insert({
      course_id: course.id,
      display_name: "e2e student",
      anon_token: `e2e-stu-${randomUUID()}`,
    })
    .select("id")
    .single();
  if (se || !student) throw new Error(`seed student: ${se?.message}`);

  return {
    courseId: course.id,
    lessonId: lesson.id,
    exerciseId: exercise.id,
    studentId: student.id,
    mcpToken: mcp_token,
  };
}

export async function clearSampleCourse(): Promise<void> {
  await db().from("courses").delete().eq("name", `${E2E_COURSE_TAG}sample`);
}

export async function countCoursesNamed(name: string): Promise<number> {
  const { count, error } = await db()
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("name", name);
  if (error) throw error;
  return count ?? 0;
}

export async function getLatestCourseByTag(): Promise<{ id: string; name: string } | null> {
  const { data, error } = await db()
    .from("courses")
    .select("id, name")
    .like("name", `${E2E_COURSE_TAG}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function listLessons(courseId: string) {
  const { data, error } = await db()
    .from("lessons")
    .select("id, order, title, content_md, objectives")
    .eq("course_id", courseId)
    .order("order");
  if (error) throw error;
  return data ?? [];
}

export async function listExercises(lessonId: string) {
  const { data, error } = await db()
    .from("exercises")
    .select("id, topic, statement_md, difficulty, verification_kind, verification_spec")
    .eq("lesson_id", lessonId);
  if (error) throw error;
  return data ?? [];
}

export async function listMaterials(lessonId: string) {
  const { data, error } = await db()
    .from("materials")
    .select("id, lesson_id, mime, file_url, content_md")
    .eq("lesson_id", lessonId);
  // Si la tabla aún no existe (migración pendiente), devolvemos [] para que el
  // test reporte "0 materials" como fallo de aserción y no como fallo de helper.
  if (error && /relation .*materials.* does not exist/i.test(error.message)) return [];
  if (error) throw error;
  return data ?? [];
}

export async function countInteractionsForStudent(studentId: string): Promise<number> {
  const { count, error } = await db()
    .from("interactions")
    .select("*", { count: "exact", head: true })
    .eq("student_id", studentId);
  if (error) throw error;
  return count ?? 0;
}
