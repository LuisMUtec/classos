import { test, expect } from "@playwright/test";

import {
  sendChatMessage,
  assistantTranscript,
  waitForChatIdle,
} from "./helpers/chat";
import {
  resetTeacherFixtures,
  getLatestCourseByTag,
  listLessons,
  listExercises,
  countInteractionsForStudent,
  db,
  E2E_COURSE_TAG,
} from "./helpers/db";

const COURSE_NAME = `${E2E_COURSE_TAG}integracion`;

/**
 * Demo-ready: when this spec passes, el flujo del jurado funciona.
 *
 * 1. Docente conversa en /chat → crea curso, una lección, un ejercicio.
 * 2. Estudiante entra a /student/[courseId], ve el curso, pide explicación,
 *    pide ejercicio, falla, pide pista, resuelve.
 * 3. Verificamos que interactions tiene actividad y mastery_score subió.
 */
test("flujo completo: docente crea, estudiante consume", async ({ page }) => {
  test.slow();
  await resetTeacherFixtures();

  // ── Docente ────────────────────────────────────────────────────────────
  await page.goto("/chat");
  await sendChatMessage(
    page,
    `Crea un curso de Python intro llamado "${COURSE_NAME}".`,
  );
  await sendChatMessage(
    page,
    "Agrega una lección llamada Loops, con contenido sobre `for` y suma de listas.",
  );
  await sendChatMessage(
    page,
    "Genera un ejercicio en esa lección donde el estudiante implemente `def suma(xs)` que sume los enteros de una lista. Dificultad fácil.",
  );

  const course = await getLatestCourseByTag();
  expect(course?.name).toBe(COURSE_NAME);
  const lessons = await listLessons(course!.id);
  expect(lessons.length).toBe(1);
  const exercises = await listExercises(lessons[0].id);
  expect(exercises.length).toBeGreaterThanOrEqual(1);

  // El curso necesita al menos un student para que track_event no falle.
  // La UI del estudiante debería materializar uno la primera vez que entra.
  const studentBefore = (
    await db().from("students").select("id").eq("course_id", course!.id)
  ).data?.length ?? 0;

  // ── Estudiante ────────────────────────────────────────────────────────
  await page.goto(`/student/${course!.id}`);
  await waitForChatIdle(page);

  await sendChatMessage(page, "Explícame qué se ve en este curso.");
  await sendChatMessage(page, "Dame el ejercicio para practicar.");

  // Primer intento: incorrecto a propósito.
  await sendChatMessage(
    page,
    "Mi solución:\n```python\ndef suma(xs):\n    return xs[0]\n```\nEvalúala.",
  );
  let transcript = (await assistantTranscript(page)).toLowerCase();
  expect(transcript).toMatch(/falla|fail|no pas|incorrect/);

  // Pide hint.
  await sendChatMessage(page, "Estoy atorado, dame una pista.");

  // Resuelve.
  await sendChatMessage(
    page,
    "Nueva solución:\n```python\ndef suma(xs):\n    total = 0\n    for x in xs:\n        total += x\n    return total\n```\nEvalúala.",
  );
  transcript = (await assistantTranscript(page)).toLowerCase();
  expect(transcript).toMatch(/passed|aprobad|correcto|✓|todos los tests|3\s*\/\s*3/);

  // ── Verificación de tracking ──────────────────────────────────────────
  const { data: students } = await db()
    .from("students")
    .select("id")
    .eq("course_id", course!.id);
  expect(students?.length ?? 0).toBeGreaterThan(studentBefore);

  const studentId = students![students!.length - 1].id;
  const interactions = await countInteractionsForStudent(studentId);
  expect(interactions).toBeGreaterThanOrEqual(4);

  // Mastery score debería haberse movido tras al menos un passed.
  const { data: progress } = await db()
    .from("progress")
    .select("mastery_score, attempts")
    .eq("student_id", studentId)
    .eq("lesson_id", lessons[0].id)
    .maybeSingle();
  expect(progress?.attempts ?? 0).toBeGreaterThanOrEqual(2);
  expect(Number(progress?.mastery_score ?? 0)).toBeGreaterThan(0);
});
