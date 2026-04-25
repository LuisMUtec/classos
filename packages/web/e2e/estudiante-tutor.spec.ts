import { test, expect } from "@playwright/test";

import {
  sendChatMessage,
  assistantTranscript,
  assistantBubbles,
  waitForChatIdle,
} from "./helpers/chat";
import {
  seedSampleCourse,
  clearSampleCourse,
  countInteractionsForStudent,
  type SeededSample,
} from "./helpers/db";

let sample: SeededSample;

test.describe("estudiante · consumo vía MCP en plataforma", () => {
  test.slow();

  test.beforeAll(async () => {
    sample = await seedSampleCourse();
  });

  test.afterAll(async () => {
    await clearSampleCourse();
  });

  test("S1 · /student lista cursos disponibles", async ({ page }) => {
    await page.goto("/student");
    await expect(page.getByText(/sample/i)).toBeVisible({ timeout: 30_000 });
  });

  test("S2 · /student/[courseId] abre chat con tutor agent", async ({ page }) => {
    await page.goto(`/student/${sample.courseId}`);
    await expect(page.getByText(/agent\s*·\s*tutor/i)).toBeVisible({ timeout: 30_000 });
    expect(await assistantBubbles(page).count()).toBe(0);
  });

  test("S3 · explicación está grounded en la lección (get_lesson_context)", async ({ page }) => {
    await page.goto(`/student/${sample.courseId}`);
    await waitForChatIdle(page);
    await sendChatMessage(page, "Explícame los loops del curso.");

    const transcript = (await assistantTranscript(page)).toLowerCase();
    // El content_md sembrado contiene "for x in [1,2,3]" → señal de que el
    // tutor pasó por get_lesson_context y citó/usó el contenido del docente,
    // no conocimiento general del modelo.
    expect(transcript).toMatch(/for\s+x\s+in|iterable|\[1,\s*2,\s*3\]/);
  });

  test("S4 · pide ejercicio y recibe enunciado (generate_exercise)", async ({ page }) => {
    await page.goto(`/student/${sample.courseId}`);
    await waitForChatIdle(page);
    await sendChatMessage(page, "Dame un ejercicio sencillo de loops para practicar.");

    const transcript = await assistantTranscript(page);
    expect(transcript.length).toBeGreaterThan(50);
    // Heurística: el enunciado típicamente llega con función o lista.
    expect(transcript.toLowerCase()).toMatch(/def\s|función|funcion|lista|implementa/);
  });

  test("S5 · pistas progresivas L1 → L2 → L3 son distintas (get_hint)", async ({ page }) => {
    await page.goto(`/student/${sample.courseId}`);
    await waitForChatIdle(page);
    // Establece exercise_id en contexto pidiendo el ejercicio sembrado.
    await sendChatMessage(
      page,
      `Quiero practicar el ejercicio "suma" de la lección de loops.`,
    );
    await sendChatMessage(page, "Estoy atorado, dame una pista.");
    const t1 = (await assistantBubbles(page).last().innerText()).trim();
    await sendChatMessage(page, "Sigo atorado, dame otra pista más concreta.");
    const t2 = (await assistantBubbles(page).last().innerText()).trim();
    await sendChatMessage(page, "Otra pista más, casi la solución pero sin darla.");
    const t3 = (await assistantBubbles(page).last().innerText()).trim();

    expect(t1.length).toBeGreaterThan(5);
    expect(t2.length).toBeGreaterThan(5);
    expect(t3.length).toBeGreaterThan(5);
    expect(t1).not.toEqual(t2);
    expect(t2).not.toEqual(t3);
    expect(t1).not.toEqual(t3);
  });

  test("S6a · respuesta correcta → passed=true (evaluate_answer)", async ({ page }) => {
    await page.goto(`/student/${sample.courseId}`);
    await waitForChatIdle(page);
    await sendChatMessage(
      page,
      `Quiero resolver el ejercicio "suma". Aquí está mi solución:\n\n` +
        "```python\ndef suma(xs):\n    total = 0\n    for x in xs:\n        total += x\n    return total\n```\n\n" +
        "Evalúala con tu verificador.",
    );

    const transcript = (await assistantTranscript(page)).toLowerCase();
    expect(transcript).toMatch(/passed|aprobad|correcto|✓|todos los tests|3\s*\/\s*3/);
  });

  test("S6b · respuesta buggy → passed=false con feedback (ground truth, no LLM-on-LLM)", async ({
    page,
  }) => {
    await page.goto(`/student/${sample.courseId}`);
    await waitForChatIdle(page);
    await sendChatMessage(
      page,
      `Evalúa esta solución para "suma":\n\n` +
        "```python\ndef suma(xs):\n    return xs[0]  # bug: solo el primero\n```",
    );

    const transcript = (await assistantTranscript(page)).toLowerCase();
    expect(transcript).toMatch(/falla|incorrect|failed|test|no pas/);
    // No debe haber declaración de éxito.
    expect(transcript).not.toMatch(/^.*\b(todos los tests pasan|✓ all)\b.*$/);
  });

  test("S7 · interactions registra al menos N filas tras la sesión", async ({ page }) => {
    const before = await countInteractionsForStudent(sample.studentId);

    await page.goto(`/student/${sample.courseId}`);
    await waitForChatIdle(page);
    await sendChatMessage(page, "Explícame los loops.");
    await sendChatMessage(page, "Dame un ejercicio.");
    await sendChatMessage(page, "Dame una pista.");

    const after = await countInteractionsForStudent(sample.studentId);
    expect(after - before).toBeGreaterThanOrEqual(3);
  });
});
