import { test, expect } from "@playwright/test";
import path from "node:path";

import {
  clearChat,
  sendChatMessage,
  assistantTranscript,
  assistantBubbles,
} from "./helpers/chat";
import {
  resetTeacherFixtures,
  countCoursesNamed,
  getLatestCourseByTag,
  listLessons,
  listExercises,
  listMaterials,
  E2E_COURSE_TAG,
} from "./helpers/db";

const COURSE_NAME = `${E2E_COURSE_TAG}Algoritmos 101`;

test.describe("docente · chat-driven authoring", () => {
  test.slow();

  test.beforeEach(async ({ page }) => {
    await resetTeacherFixtures();
    await page.goto("/chat");
    await expect(page.getByText("¿En qué te ayudo?")).toBeVisible();
  });

  test("D1 · crea curso desde chat", async ({ page }) => {
    await sendChatMessage(
      page,
      `Crea un curso de Python intro llamado "${COURSE_NAME}". Confirma con su id cuando esté listo.`,
    );

    expect(await countCoursesNamed(COURSE_NAME)).toBe(1);

    const course = await getLatestCourseByTag();
    expect(course?.name).toBe(COURSE_NAME);

    const transcript = await assistantTranscript(page);
    // Acceptance: el assistant comunica al docente que el curso fue creado.
    expect(transcript.toLowerCase()).toMatch(/curso|creado|listo/);
  });

  test("D2 · añade lecciones tras crear curso", async ({ page }) => {
    await sendChatMessage(
      page,
      `Crea un curso llamado "${COURSE_NAME}".`,
    );
    await sendChatMessage(
      page,
      "Agrega 3 lecciones a ese curso: 1) Loops, 2) Condicionales, 3) Funciones.",
    );

    const course = await getLatestCourseByTag();
    expect(course).not.toBeNull();
    const lessons = await listLessons(course!.id);
    expect(lessons.length).toBe(3);

    const orders = lessons.map((l) => l.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    const titles = lessons.map((l) => l.title.toLowerCase()).join("|");
    expect(titles).toMatch(/loop/);
    expect(titles).toMatch(/condicional/);
    expect(titles).toMatch(/funci/);
  });

  test("D3 · sube archivo y lo vincula a la lección 2", async ({ page }) => {
    await sendChatMessage(page, `Crea un curso llamado "${COURSE_NAME}".`);
    await sendChatMessage(
      page,
      "Agrega 3 lecciones: Loops, Condicionales, Funciones.",
    );

    const course = await getLatestCourseByTag();
    const lessons = await listLessons(course!.id);
    expect(lessons.length).toBeGreaterThanOrEqual(2);
    const lesson2 = lessons[1];

    // El upload real requerirá un input file expuesto por la UI. Cuando
    // exista, este test usará setInputFiles. Hasta entonces, queda como
    // marker rojo de que falta el componente.
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(path.join(__dirname, "fixtures", "sample.md"));
    await sendChatMessage(
      page,
      `Ingiere ese archivo en la lección "${lesson2.title}".`,
    );

    const materials = await listMaterials(lesson2.id);
    expect(materials.length).toBeGreaterThan(0);
    const m = materials[0];
    expect(m.lesson_id).toBe(lesson2.id);
    expect((m.content_md ?? "").toLowerCase()).toMatch(/loop|sílabo|silabo/);
  });

  test("D4 · genera ejercicio para una lección", async ({ page }) => {
    await sendChatMessage(page, `Crea un curso llamado "${COURSE_NAME}".`);
    await sendChatMessage(page, "Agrega una lección llamada Recursión.");

    const course = await getLatestCourseByTag();
    const [lesson] = await listLessons(course!.id);

    await sendChatMessage(
      page,
      `Genera un ejercicio sobre recursión para la lección "${lesson.title}", dificultad media.`,
    );

    const exercises = await listExercises(lesson.id);
    expect(exercises.length).toBeGreaterThanOrEqual(1);
    const ex = exercises[0];
    expect(ex.statement_md.length).toBeGreaterThan(20);
    expect(["python_tests", "exact_match"]).toContain(ex.verification_kind);
    expect(ex.verification_spec).toBeTruthy();
    expect((ex.verification_spec as { kind?: string }).kind).toBe(ex.verification_kind);
  });

  test("D5 · edita lección existente", async ({ page }) => {
    await sendChatMessage(page, `Crea un curso llamado "${COURSE_NAME}".`);
    await sendChatMessage(
      page,
      "Agrega una lección llamada Loops, con contenido inicial corto sobre `for` y `while`.",
    );

    const course = await getLatestCourseByTag();
    const [before] = await listLessons(course!.id);
    const beforeMd = before.content_md;

    await sendChatMessage(
      page,
      `Edita la lección "${before.title}" para enfatizar nested loops y dar un ejemplo extra.`,
    );

    const [after] = await listLessons(course!.id);
    expect(after.id).toBe(before.id);
    expect(after.content_md).not.toBe(beforeMd);
    expect(after.content_md.toLowerCase()).toMatch(/nested|anidad/);
  });

  test("D6 · lista contenido del curso", async ({ page }) => {
    await sendChatMessage(page, `Crea un curso llamado "${COURSE_NAME}".`);
    await sendChatMessage(
      page,
      "Agrega 2 lecciones: Variables y Loops.",
    );
    await sendChatMessage(page, "¿Qué tengo en este curso?");

    const transcript = (await assistantTranscript(page)).toLowerCase();
    expect(transcript).toMatch(/variables/);
    expect(transcript).toMatch(/loops/);
  });

  test("memoria · no requiere repetir course_id en mensajes consecutivos", async ({ page }) => {
    await sendChatMessage(page, `Crea un curso llamado "${COURSE_NAME}".`);
    // Mensaje deliberadamente sin course_id explícito.
    await sendChatMessage(page, "Agrega una lección sobre listas.");

    const course = await getLatestCourseByTag();
    const lessons = await listLessons(course!.id);
    expect(lessons.length).toBe(1);
    expect(lessons[0].title.toLowerCase()).toMatch(/lista/);
  });

  test("honestidad · si la tool falla, el chat lo reporta", async ({ page }) => {
    // Pedimos editar una lección que no existe. El assistant debe llamar la
    // tool, recibir error y comunicarlo — no inventar éxito.
    await sendChatMessage(
      page,
      "Edita la lección 'fantasma-inexistente-xyz' para añadirle una sección.",
    );

    const transcript = (await assistantTranscript(page)).toLowerCase();
    expect(transcript).toMatch(/no\s+(existe|encontr|hay)|error|no\s+puedo/);
    // Y nada debió crearse.
    expect(await countCoursesNamed(COURSE_NAME)).toBe(0);
  });

  test("regression · /chat carga y conecta al agent assistant", async ({ page }) => {
    // Smoke: el chat es navegable y muestra el badge del agente.
    await expect(page.getByText("agent · assistant")).toBeVisible();
    expect(await assistantBubbles(page).count()).toBe(0);
    await clearChat(page).catch(() => {}); // botón inicialmente disabled, ok
  });
});
