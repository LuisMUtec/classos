import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  TeacherInputSchema,
  ScenarioCandidatesSchema,
  ProblemStatementSchema,
  SolverDecisionSchema,
  TeacherPackageSchema,
  type ScenarioCandidate,
  type ProblemStatement,
  type SolverDecision,
} from '../schemas/index.js';
import { CONTEXT_SEEDS } from '../seeds/contexts.js';
import { TOPIC_DESCRIPTIONS } from '../seeds/topics.js';
import { researcherAgent } from '../agents/researcher.js';
import { designerAgent } from '../agents/designer.js';
import { solverValidatorAgent } from '../agents/solverValidator.js';
import { reviewerAgent } from '../agents/reviewer.js';
import { MAX_OUTPUT_TOKENS } from '../models.js';
import { runPython } from '../sandbox/pythonRunner.js';

const MAX_ITERATIONS = 2;

// ---------- Step 1: Researcher ----------
const researcherStep = createStep({
  id: 'researcher',
  inputSchema: TeacherInputSchema,
  outputSchema: z.object({
    teacherInput: TeacherInputSchema,
    selectedScenario: z.object({
      title: z.string(),
      context: z.string(),
      rationale: z.string(),
      estimatedFitMinutes: z.number().int(),
    }),
    allCandidates: ScenarioCandidatesSchema,
  }),
  execute: async ({ inputData }) => {
    console.log(`\n🔍 [1/4 Researcher] proponiendo contextos auténticos para "${inputData.topic}"...`);
    const seeds = CONTEXT_SEEDS[inputData.topic];
    const seedsBlock = seeds
      .map((s, i) => `  ${i + 1}. ${s.title} — ${s.context} (auténtico porque: ${s.whyAuthentic})`)
      .join('\n');

    const prompt = `
Tema: ${inputData.topic}
Descripción del tema: ${TOPIC_DESCRIPTIONS[inputData.topic]}
Nivel: ${inputData.level}
Duración objetivo: ${inputData.durationMinutes} minutos
Restricciones adicionales: ${inputData.constraints.join(', ') || '(ninguna)'}

Seeds del catálogo (inspiración, podés usarlos, modificarlos o reemplazarlos):
${seedsBlock}

Devuelve 3-5 candidatos y elige cuál es el mejor (selectedIndex base 0).
Responde SOLO con JSON que matchee el schema.
`.trim();

    const response = await researcherAgent.generate(prompt, {
      structuredOutput: {
        schema: ScenarioCandidatesSchema,
        jsonPromptInjection: true,
      },
      modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

    const candidates = response.object;
    if (!candidates) throw new Error('Researcher: no structured output');
    const sel = candidates.candidates[candidates.selectedIndex];
    if (!sel) throw new Error('Researcher: invalid selectedIndex');

    const selectedScenario: ScenarioCandidate = {
      title: sel.title,
      context: sel.context,
      rationale: sel.rationale,
      estimatedFitMinutes: sel.estimatedFitMinutes,
    };
    console.log(`   ✓ ${candidates.candidates.length} contextos propuestos. Elegido: "${selectedScenario.title}"`);
    return { teacherInput: inputData, selectedScenario, allCandidates: candidates };
  },
});

// ---------- Step 2: Init loop state ----------
const DesignerSolverStateSchema = z.object({
  teacherInput: TeacherInputSchema,
  selectedScenario: z.object({
    title: z.string(),
    context: z.string(),
    rationale: z.string(),
    estimatedFitMinutes: z.number().int(),
  }),
  allCandidates: ScenarioCandidatesSchema,
  problem: ProblemStatementSchema.nullable(),
  decision: SolverDecisionSchema.nullable(),
  iterationCount: z.number().int().min(0),
  accepted: z.boolean(),
});

const initLoopStateStep = createStep({
  id: 'init-loop-state',
  inputSchema: researcherStep.outputSchema,
  outputSchema: DesignerSolverStateSchema,
  execute: async ({ inputData }) => ({
    teacherInput: inputData.teacherInput,
    selectedScenario: inputData.selectedScenario,
    allCandidates: inputData.allCandidates,
    problem: null,
    decision: null,
    iterationCount: 0,
    accepted: false,
  }),
});

// ---------- Step 3: Designer + Solver-Validator (loop body) ----------
const designerSolverStep = createStep({
  id: 'designer-solver',
  inputSchema: DesignerSolverStateSchema,
  outputSchema: DesignerSolverStateSchema,
  execute: async ({ inputData }) => {
    const nextIter = inputData.iterationCount + 1;
    const previousFeedback =
      inputData.decision && !inputData.decision.accepted
        ? inputData.decision.feedbackForDesigner
        : undefined;

    console.log(`\n🎨 [2/4 Designer] iteración ${nextIter}${previousFeedback ? ' (corrigiendo feedback previo)' : ''}...`);

    // ---- DEMO MODE: en iter 1 inyectamos un problema deliberadamente buggy ----
    // El Solver lo procesa REAL y naturalmente rechaza. Iter 2 corre Designer real.
    // En slides declaramos: "demo input fuerza ambigüedad para mostrar el loop".
    let problem: ProblemStatement;
    if (inputData.teacherInput.demoMode && nextIter === 1) {
      problem = {
        title: 'Suma de dígitos',
        story:
          'Estás validando dígitos verificadores de DNI peruano. Necesitás una función que reciba un entero positivo y devuelva la suma de sus dígitos.',
        ioSpec: 'Recibe un entero positivo n (n >= 1). Devuelve un entero con la suma de sus dígitos.',
        examples: [
          { input: '123', output: '6', explanation: 'Suma simple.' },
          { input: '0', output: '0', explanation: 'Caso base.' }, // CONTRADICCIÓN: n>=1 pero ejemplo usa 0
          { input: '99', output: '18', explanation: 'Dígitos repetidos.' },
        ],
        constraints: ['1 <= n <= 10**9'],
        functionSignature: 'def suma_digitos(n: int) -> int:',
        iteration: nextIter,
        previousFeedback: undefined,
      };
    } else {
      // ---- Designer real ----
      const designerPrompt = `
Tema: ${inputData.teacherInput.topic} (${TOPIC_DESCRIPTIONS[inputData.teacherInput.topic]})
Duración objetivo: ${inputData.teacherInput.durationMinutes} minutos
Contexto auténtico seleccionado:
  Título: ${inputData.selectedScenario.title}
  Descripción: ${inputData.selectedScenario.context}
  Por qué es auténtico: ${inputData.selectedScenario.rationale}

${
  previousFeedback
    ? `[REINTENTO] El intento anterior fue RECHAZADO con este feedback:\n  "${previousFeedback}"\nDebes corregir EXACTAMENTE lo señalado.`
    : inputData.teacherInput.demoMode
      ? `[PRIMER INTENTO — DEMO MODE OBLIGATORIO]
DEBES introducir una contradicción CONCRETA y DETECTABLE entre los ejemplos y los constraints.
Elegí UNA de estas tácticas (no más de una):
  (a) un constraint dice "n entero positivo" pero un ejemplo usa 0 o un negativo
  (b) ioSpec dice "devuelve un entero" pero un ejemplo devuelve string
  (c) un ejemplo pide ordenar ascendente pero el output es descendente
  (d) un constraint dice "lista no vacía" pero un ejemplo usa lista vacía
La contradicción debe ser real (no excusable). El validador la detectará y nos forzará a una segunda iteración. NO menciones que es intencional. Sé sutil pero claro.`
      : '[PRIMER INTENTO] Este es el diseño inicial.'
}

Devuelve un ProblemStatement completo. Iteration: ${nextIter}.
Responde SOLO con JSON que matchee el schema.
`.trim();

    const designerResponse = await designerAgent.generate(designerPrompt, {
      structuredOutput: {
        schema: ProblemStatementSchema,
        jsonPromptInjection: true,
      },
      modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

      const problemRaw = designerResponse.object;
      if (!problemRaw) throw new Error('Designer: no structured output');
      problem = {
        ...problemRaw,
        iteration: nextIter,
        previousFeedback,
      };
    }

    // ---- Solver-Validator (sin tools — emite código, el workflow ejecuta) ----
    const solverPrompt = `
Recibes este ProblemStatement. Decidí aceptar o rechazar siguiendo tus reglas.

Title: ${problem.title}
Story: ${problem.story}
ioSpec: ${problem.ioSpec}
Examples:
${problem.examples.map((e, i) => `  ${i + 1}. input=${e.input}  output=${e.output}${e.explanation ? `  (${e.explanation})` : ''}`).join('\n')}
Constraints: ${problem.constraints.join('; ')}
Function signature: ${problem.functionSignature}

Si el spec/ejemplos tienen CUALQUIER contradicción, devolvé { accepted: false, ... }.
Si el spec es claro, devolvé { accepted: true, solutionCode, tests }. El sistema ejecutará por vos.
Responde SOLO con JSON que matchee el schema SolverDecision.
`.trim();

    const solverResponse = await solverValidatorAgent.generate(solverPrompt, {
      structuredOutput: {
        schema: SolverDecisionSchema,
        jsonPromptInjection: true,
      },
      modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

    let decision = solverResponse.object as SolverDecision | undefined;
    if (!decision) throw new Error('Solver-Validator: no structured output');

    console.log(`\n🔬 [3/4 Solver-Validator] evaluando problema...`);

    // ---- Workflow ejecuta la solución vía sandbox si Solver aceptó ----
    if (decision.accepted && decision.solutionCode && decision.tests) {
      console.log(`   → ejecutando solución + ${decision.tests.length} tests en sandbox Python...`);
      const fullCode = `${decision.solutionCode}\n\n# tests\n${decision.tests.map((t) => t.code).join('\n')}\nprint("ok")\n`;
      const execution = await runPython(fullCode, { timeoutMs: 5000 });
      if (execution.exitCode === 0 && execution.stdout.includes('ok')) {
        decision = { ...decision, execution };
        console.log(`   ✅ ACEPTADO (exit ${execution.exitCode}, ${execution.durationMs}ms)`);
      } else {
        decision = {
          accepted: false,
          rejectionReason: 'tests-failed',
          feedbackForDesigner: `La solución propuesta para este spec no pasó los tests al ejecutarse. stderr: ${execution.stderr.slice(0, 500)}`,
          attemptedSolution: decision.solutionCode,
          failedExecution: execution,
        };
        console.log(`   ❌ RECHAZADO: tests fallaron al ejecutar`);
      }
    } else {
      console.log(`   ❌ RECHAZADO: ${decision.rejectionReason}`);
      console.log(`   📝 feedback al Designer: "${decision.feedbackForDesigner}"`);
    }

    return {
      teacherInput: inputData.teacherInput,
      selectedScenario: inputData.selectedScenario,
      allCandidates: inputData.allCandidates,
      problem,
      decision,
      iterationCount: nextIter,
      accepted: decision.accepted,
    };
  },
});

// ---------- Step 4: Reviewer ----------
const reviewerStep = createStep({
  id: 'reviewer',
  inputSchema: DesignerSolverStateSchema,
  outputSchema: TeacherPackageSchema,
  execute: async ({ inputData }) => {
    if (!inputData.problem || !inputData.decision || !inputData.decision.accepted) {
      throw new Error(
        `Reviewer no recibió un SolutionPackage aceptado. iteration=${inputData.iterationCount}, accepted=${inputData.accepted}`,
      );
    }
    const decision = inputData.decision;
    console.log(`\n📚 [4/4 Reviewer] generando rúbrica + errores comunes + hints...`);

    const prompt = `
Recibís este SolutionPackage validado. Generá el TeacherPackage para que el profe lo use mañana.

Tema: ${inputData.teacherInput.topic}
Problema:
  Title: ${inputData.problem.title}
  Story: ${inputData.problem.story}
  Function signature: ${inputData.problem.functionSignature}
  Examples: ${inputData.problem.examples.map((e) => `${e.input}→${e.output}`).join(', ')}

Solución validada:
\`\`\`python
${decision.solutionCode}
\`\`\`

Tests que pasaron:
${(decision.tests ?? []).map((t, i) => `  ${i + 1}. ${t.description}`).join('\n')}

Devuelve TeacherPackage completo (rubric, commonErrors, progressiveHints x3, extensions).
Responde SOLO con JSON que matchee el schema.
`.trim();

    const response = await reviewerAgent.generate(prompt, {
      structuredOutput: {
        schema: TeacherPackageSchema.omit({ solution: true }),
        jsonPromptInjection: true,
      },
      modelSettings: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });

    const partial = response.object;
    if (!partial) throw new Error('Reviewer: no structured output');

    return {
      ...partial,
      solution: {
        problem: inputData.problem,
        decision,
        iterationCount: inputData.iterationCount,
      },
    };
  },
});

// ---------- Workflow ----------
export const exerciseGeneratorWorkflow = createWorkflow({
  id: 'exercise-generator',
  inputSchema: TeacherInputSchema,
  outputSchema: TeacherPackageSchema,
})
  .then(researcherStep)
  .then(initLoopStateStep)
  .dountil(designerSolverStep, async ({ inputData }) => {
    return inputData.accepted || inputData.iterationCount >= MAX_ITERATIONS;
  })
  .then(reviewerStep)
  .commit();
