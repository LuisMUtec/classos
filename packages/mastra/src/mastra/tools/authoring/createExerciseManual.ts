import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { VerificationSpec } from '@edhack/contracts';

import { supabase } from '../../supabase.js';

/**
 * Manual exercise creation: the docente already tiene el enunciado y la spec
 * de verificación armada (típicamente para álgebra/cálculo, donde no hay un
 * generador multi-agente como en CS). Acepta cualquier `VerificationKind`
 * (python_tests, sympy_equivalence, sympy_numeric, exact_match) y valida la
 * spec con el schema de @edhack/contracts antes de persistir.
 */
export const createExerciseManualTool = createTool({
  id: 'createExerciseManual',
  description:
    'Crea un ejercicio nuevo a partir de enunciado + verification_spec ya armados. ' +
    'Usa esto cuando el docente te dicta el ejercicio completo (especialmente para álgebra/cálculo, ' +
    'donde generateExerciseAndPersist no aplica). Para CS prefiere generateExerciseAndPersist. ' +
    'verification_spec debe ser un objeto con `kind` en {python_tests, sympy_equivalence, sympy_numeric, exact_match} ' +
    'más los campos requeridos por ese kind (ver @edhack/contracts).',
  inputSchema: z.object({
    lesson_id: z.string().uuid().describe('Lección donde guardar el ejercicio.'),
    topic: z
      .string()
      .min(1)
      .describe(
        'Tema libre, en kebab-case o slug (ej: "ecuaciones-lineales", "factorizacion", "loops"). ' +
          'Sirve como índice para `generate_exercise` del MCP.',
      ),
    statement_md: z
      .string()
      .min(1)
      .describe('Enunciado completo en markdown. Incluye firma/formato esperado de respuesta si aplica.'),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    verification_spec: z.unknown().describe(
      'Spec del verifier. Schema (discriminada por `kind`): ' +
        '{kind:"python_tests", tests:string, setup?:string, timeout_ms?:number} | ' +
        '{kind:"sympy_equivalence", expected:string, symbols?:string[]} | ' +
        '{kind:"sympy_numeric", expected:string, symbols?:string[], sample_points?:number, tolerance?:number} | ' +
        '{kind:"exact_match", expected:string, normalize?:"none"|"trim"|"lowercase"|"trim_lowercase"}',
    ),
  }),
  outputSchema: z.object({
    exercise_id: z.string().uuid(),
    lesson_id: z.string().uuid(),
    topic: z.string(),
    difficulty: z.string(),
    verification_kind: z.string(),
  }),
  execute: async ({ lesson_id, topic, statement_md, difficulty, verification_spec }) => {
    const parsed = VerificationSpec.safeParse(verification_spec);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ');
      throw new Error(`createExerciseManual: verification_spec inválida — ${issues}`);
    }

    const { data, error } = await supabase()
      .from('exercises')
      .insert({
        lesson_id,
        topic,
        statement_md,
        difficulty,
        verification_kind: parsed.data.kind,
        verification_spec: parsed.data,
      })
      .select('id, lesson_id, topic, difficulty, verification_kind')
      .single();
    if (error || !data) {
      throw new Error(`createExerciseManual: ${error?.message ?? 'no row'}`);
    }
    return {
      exercise_id: data.id as string,
      lesson_id: data.lesson_id as string,
      topic: data.topic as string,
      difficulty: data.difficulty as string,
      verification_kind: data.verification_kind as string,
    };
  },
});
