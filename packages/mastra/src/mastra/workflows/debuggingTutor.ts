import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  BugReportSchema,
  ConceptTagSchema,
  DebuggingInputSchema,
  ProgressiveHintSchema,
  VerifiedHintsPackageSchema,
} from '../schemas/debugging.js';

/**
 * STUB workflow para el Tutor Socrático de Debugging (opción 1).
 * Replica el patrón del exerciseGenerator: 4 agentes en cascada + loop sobre el Verifier.
 * Por ahora todos los steps devuelven datos hardcodeados para que el workflow esté
 * registrado y el frontend pueda dispatchearlo. La lógica real (sandbox + agentes con
 * prompts reales + verificación por aplicación) se agrega después.
 */

const MAX_ITERATIONS = 2;

const VerifierLoopStateSchema = z.object({
  input: DebuggingInputSchema,
  bugReport: BugReportSchema,
  conceptTag: ConceptTagSchema,
  hints: z.array(ProgressiveHintSchema).length(3),
  iterationCount: z.number().int().min(0),
  accepted: z.boolean(),
  applicationProof: z
    .object({ codeAfterApply: z.string(), exitCode: z.number().int(), durationMs: z.number().int() })
    .nullable(),
  rejectionReason: z.string().nullable(),
});

// ---------- Step 1: Analyzer (stub) ----------
const analyzerStep = createStep({
  id: 'analyzer',
  inputSchema: DebuggingInputSchema,
  outputSchema: z.object({
    input: DebuggingInputSchema,
    bugReport: BugReportSchema,
  }),
  execute: async ({ inputData }) => {
    console.log(`\n🔍 [1/4 Analyzer] (STUB) clasificando bug...`);
    return {
      input: inputData,
      bugReport: {
        bugType: 'logic' as const,
        line: 3,
        evidence: 'STUB: el loop comienza en index 1 en vez de 0, salta el primer elemento',
      },
    };
  },
});

// ---------- Step 2: Concept Mapper (stub) ----------
const conceptMapperStep = createStep({
  id: 'concept-mapper',
  inputSchema: analyzerStep.outputSchema,
  outputSchema: z.object({
    input: DebuggingInputSchema,
    bugReport: BugReportSchema,
    conceptTag: ConceptTagSchema,
  }),
  execute: async ({ inputData }) => {
    console.log(`\n🧠 [2/4 Concept Mapper] (STUB) identificando concepto CS...`);
    return {
      ...inputData,
      conceptTag: {
        concept: 'Off-by-one en iteración',
        category: 'off-by-one' as const,
        pedagogicalReference: 'STUB: error clásico de boundary en loops sobre listas',
      },
    };
  },
});

// ---------- Step 3: init verifier loop state ----------
const initVerifierStateStep = createStep({
  id: 'init-verifier-state',
  inputSchema: conceptMapperStep.outputSchema,
  outputSchema: VerifierLoopStateSchema,
  execute: async ({ inputData }) => ({
    ...inputData,
    hints: [
      { level: 'L1' as const, text: 'STUB L1' },
      { level: 'L2' as const, text: 'STUB L2' },
      { level: 'L3' as const, text: 'STUB L3' },
    ],
    iterationCount: 0,
    accepted: false,
    applicationProof: null,
    rejectionReason: null,
  }),
});

// ---------- Step 4: Hinter + Verifier (loop body, stub) ----------
const hinterVerifierStep = createStep({
  id: 'hinter-verifier',
  inputSchema: VerifierLoopStateSchema,
  outputSchema: VerifierLoopStateSchema,
  execute: async ({ inputData }) => {
    const nextIter = inputData.iterationCount + 1;
    console.log(`\n💡 [3/4 Hinter] (STUB) generando 3 pistas iter ${nextIter}...`);
    console.log(`\n✅ [4/4 Verifier] (STUB) aplicando L3 + sandbox...`);
    return {
      ...inputData,
      hints: [
        { level: 'L1' as const, text: '¿Estás seguro de que el loop visita todos los elementos?' },
        { level: 'L2' as const, text: 'Mirá el rango del for en la línea 3.' },
        { level: 'L3' as const, text: 'En Python, range(1, n) empieza en 1, no en 0. Para iterar toda la lista usá range(len(lst)) o iterá directamente.' },
      ],
      iterationCount: nextIter,
      accepted: true,
      applicationProof: {
        codeAfterApply: 'def suma(lst):\n    total = 0\n    for i in range(len(lst)):\n        total += lst[i]\n    return total',
        exitCode: 0,
        durationMs: 42,
      },
      rejectionReason: null,
    };
  },
});

// ---------- Step 5: Pack final ----------
const packageStep = createStep({
  id: 'verifier',
  inputSchema: VerifierLoopStateSchema,
  outputSchema: VerifiedHintsPackageSchema,
  execute: async ({ inputData }) => {
    if (!inputData.accepted || !inputData.applicationProof) {
      throw new Error('Verifier: pipeline terminó sin aceptación');
    }
    console.log(`\n📦 [Pack] generando VerifiedHintsPackage...`);
    return {
      bugReport: inputData.bugReport,
      conceptTag: inputData.conceptTag,
      hints: inputData.hints,
      verification: {
        accepted: true as const,
        applicationProof: inputData.applicationProof,
      },
      iterationCount: inputData.iterationCount,
    };
  },
});

export const debuggingTutorWorkflow = createWorkflow({
  id: 'debugging-tutor',
  inputSchema: DebuggingInputSchema,
  outputSchema: VerifiedHintsPackageSchema,
})
  .then(analyzerStep)
  .then(conceptMapperStep)
  .then(initVerifierStateStep)
  .dountil(hinterVerifierStep, async ({ inputData }) => {
    return inputData.accepted || inputData.iterationCount >= MAX_ITERATIONS;
  })
  .then(packageStep)
  .commit();
