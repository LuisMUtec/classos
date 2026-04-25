import { z } from 'zod';

export const VerificationKind = z.enum([
  'python_tests',
  'sympy_equivalence',
  'sympy_numeric',
  'exact_match',
]);
export type VerificationKind = z.infer<typeof VerificationKind>;

export const VerificationSpec = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('python_tests'),
    tests: z.string().describe('pytest source code that imports student solution'),
    setup: z.string().optional().describe('optional setup code prepended before tests'),
    timeout_ms: z.number().int().positive().default(5000),
  }),
  z.object({
    kind: z.literal('sympy_equivalence'),
    expected: z.string().describe('SymPy-parseable expression, e.g. "(x-1)*(x+1)"'),
    symbols: z.array(z.string()).default(['x']),
  }),
  z.object({
    kind: z.literal('sympy_numeric'),
    expected: z.string(),
    symbols: z.array(z.string()).default(['x']),
    sample_points: z.number().int().positive().default(5),
    tolerance: z.number().positive().default(1e-6),
  }),
  z.object({
    kind: z.literal('exact_match'),
    expected: z.string(),
    normalize: z.enum(['none', 'trim', 'lowercase', 'trim_lowercase']).default('trim'),
  }),
]);
export type VerificationSpec = z.infer<typeof VerificationSpec>;

export const VerificationResult = z.object({
  passed: z.boolean(),
  feedback: z.string().describe('human-readable feedback fed back to the LLM client'),
  diagnostics: z.unknown().optional().describe('structured details (failed test names, sympy diff, etc.)'),
});
export type VerificationResult = z.infer<typeof VerificationResult>;

/**
 * Each verifier implements one VerificationKind.
 * Dev C plugs implementations into the registry in packages/verifiers/.
 */
export interface Verifier<K extends VerificationKind = VerificationKind> {
  readonly kind: K;
  verify(
    spec: Extract<VerificationSpec, { kind: K }>,
    studentAnswer: string
  ): Promise<VerificationResult>;
}
