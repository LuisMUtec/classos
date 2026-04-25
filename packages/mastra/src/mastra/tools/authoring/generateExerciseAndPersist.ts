import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

import { supabase } from '../../supabase.js';
import { exerciseGeneratorWorkflow } from '../../workflows/exerciseGenerator.js';
import {
  TopicSchema,
  type Topic,
  type TeacherPackage,
} from '../../schemas/index.js';

const TOPIC_ALIASES: Record<string, Topic> = {
  recursion: 'recursion',
  recursión: 'recursion',
  recursiones: 'recursion',
  loops: 'loops',
  loop: 'loops',
  bucles: 'loops',
  iteración: 'loops',
  iteracion: 'loops',
  condicionales: 'condicionales',
  ifs: 'condicionales',
  if: 'condicionales',
  funciones: 'funciones',
  function: 'funciones',
  listas: 'listas',
  list: 'listas',
  strings: 'strings',
  cadenas: 'strings',
  dicts: 'dicts',
  diccionarios: 'dicts',
  oop: 'oop-basico',
  'oop-basico': 'oop-basico',
  clases: 'oop-basico',
};

function normalizeTopic(t: string): Topic {
  const k = t.trim().toLowerCase();
  const alias = TOPIC_ALIASES[k];
  const parsed = TopicSchema.safeParse(alias ?? k);
  if (parsed.success) return parsed.data;
  throw new Error(
    `topic "${t}" no soportado. Opciones: ${TopicSchema.options.join(', ')}.`,
  );
}

function statementMarkdown(pkg: TeacherPackage): string {
  const p = pkg.solution.problem;
  const examples = p.examples
    .map(
      (e, i) =>
        `${i + 1}. **Input:** \`${e.input}\` → **Output:** \`${e.output}\`${e.explanation ? ` — ${e.explanation}` : ''}`,
    )
    .join('\n');
  const constraints = p.constraints.map((c) => `- ${c}`).join('\n');
  return [
    `# ${p.title}`,
    '',
    p.story,
    '',
    '## Especificación',
    p.ioSpec,
    '',
    '## Firma',
    '```python',
    p.functionSignature,
    '```',
    '',
    '## Ejemplos',
    examples,
    '',
    '## Restricciones',
    constraints || '- (sin restricciones adicionales)',
  ].join('\n');
}

function buildPytestSource(pkg: TeacherPackage): string {
  const tests = pkg.solution.decision.tests ?? [];
  const blocks = tests
    .map((t, i) => {
      const safe = t.code.trim();
      return `# ${t.description}\n${safe.startsWith('def ') ? safe : `def test_${i}():\n    ${safe}`}`;
    })
    .join('\n\n');
  return blocks || '# (sin tests generados)\ndef test_placeholder():\n    assert True';
}

export const generateExerciseAndPersistTool = createTool({
  id: 'generateExerciseAndPersist',
  description:
    'Genera un ejercicio CS validado con el workflow multi-agente y lo persiste en la lección indicada. ' +
    'Úsalo cuando el docente pida "genera/crea un ejercicio" sobre un tema (loops, recursion, listas, etc.). ' +
    'Devuelve exercise_id y un resumen del enunciado para mostrarle al docente.',
  inputSchema: z.object({
    lesson_id: z.string().uuid().describe('Lección donde guardar el ejercicio.'),
    topic: z
      .string()
      .describe(
        'Tema del ejercicio en español o inglés (loops, recursión, listas, condicionales, funciones, strings, dicts, oop). ' +
          'Se normaliza internamente.',
      ),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    durationMinutes: z.number().int().min(15).max(180).default(45),
  }),
  outputSchema: z.object({
    exercise_id: z.string().uuid(),
    title: z.string(),
    statement_md: z.string(),
    verification_kind: z.literal('python_tests'),
  }),
  execute: async ({ lesson_id, topic, difficulty, durationMinutes }) => {
    const normalized = normalizeTopic(topic);
    const duration = durationMinutes ?? 45;

    const run = await exerciseGeneratorWorkflow.createRun();
    const result = await run.start({
      inputData: {
        topic: normalized,
        level: 'intro-universitario' as const,
        durationMinutes: duration,
        constraints: [],
        demoMode: false,
      },
    });

    if (result.status !== 'success') {
      const reason = 'error' in result ? String((result as { error: unknown }).error) : result.status;
      throw new Error(`generateExerciseAndPersist: workflow falló (${reason})`);
    }

    const pkg = result.result as TeacherPackage;
    if (!pkg.solution.decision.accepted) {
      throw new Error(
        'generateExerciseAndPersist: el solver-validator rechazó tras 2 iteraciones. ' +
          'Reporta esto al docente y propone otro tema o más duración.',
      );
    }

    const statement_md = statementMarkdown(pkg);
    const tests = buildPytestSource(pkg);
    const verification_spec = {
      kind: 'python_tests' as const,
      tests,
      setup: pkg.solution.decision.solutionCode ?? '',
      timeout_ms: 5000,
    };

    const { data, error } = await supabase()
      .from('exercises')
      .insert({
        lesson_id,
        topic: normalized,
        statement_md,
        difficulty,
        verification_kind: 'python_tests',
        verification_spec,
      })
      .select('id, statement_md')
      .single();
    if (error || !data) {
      throw new Error(`generateExerciseAndPersist: ${error?.message ?? 'no row'}`);
    }

    return {
      exercise_id: data.id as string,
      title: pkg.solution.problem.title,
      statement_md: data.statement_md as string,
      verification_kind: 'python_tests' as const,
    };
  },
});
