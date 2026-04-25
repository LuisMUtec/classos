import type { PipelineConfig } from './registry';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

interface DebuggingInput {
  buggyCode: string;
  expectedBehavior: string;
}

interface VerifiedHints {
  bugReport?: { tipo: string; line: number; evidence: string };
  conceptTag?: string;
  hints?: Array<{ level: 'L1' | 'L2' | 'L3'; text: string }>;
  verifiedFix?: { applied: boolean; testsPassed: number };
}

function DebuggingInputForm({
  value,
  onChange,
  disabled,
}: {
  value: DebuggingInput;
  onChange: (v: DebuggingInput) => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="buggyCode" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Código Python con bug
        </Label>
        <Textarea
          id="buggyCode"
          value={value.buggyCode}
          onChange={(e) => onChange({ ...value, buggyCode: e.target.value })}
          disabled={disabled}
          rows={8}
          className="font-mono text-[12px]"
          placeholder={'def suma(lst):\n    total = 0\n    for i in range(1, len(lst)):\n        total += lst[i]\n    return total'}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expected" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          ¿Qué debería hacer?
        </Label>
        <Textarea
          id="expected"
          value={value.expectedBehavior}
          onChange={(e) => onChange({ ...value, expectedBehavior: e.target.value })}
          disabled={disabled}
          rows={3}
          placeholder="Sumar todos los elementos de la lista"
        />
      </div>
    </>
  );
}

function DebuggingResultView({ result }: { result: VerifiedHints }) {
  return (
    <div className="px-8 py-8 max-w-[900px]" data-testid="debugging-result">
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 mb-4">
        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
          Stub
        </div>
        <p className="text-[13px] text-amber-900">
          El backend del tutor de debugging aún no está implementado. Esta vista renderiza la
          estructura final esperada cuando los 4 agentes (Analyzer → Concept Mapper → Hinter →
          Verifier) estén wired up.
        </p>
      </div>
      <pre className="bg-[#0F172A] text-slate-100 p-4 rounded-md text-[12px] overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

export const debuggingTutorPipeline: PipelineConfig<DebuggingInput, VerifiedHints> = {
  id: 'debuggingTutor',
  label: 'Tutor socrático de debugging',
  description:
    'Multi-agente que analiza código buggy, identifica el concepto CS detrás, genera 3 niveles de pista progresiva y verifica que la pista L3 lleve al fix.',
  enabled: false,
  accent: '#0EA5E9',
  defaultInput: {
    buggyCode: 'def suma(lst):\n    total = 0\n    for i in range(1, len(lst)):\n        total += lst[i]\n    return total',
    expectedBehavior: 'Sumar todos los elementos de la lista',
  },
  InputForm: DebuggingInputForm,
  ResultView: DebuggingResultView,
  buildBody: (input) => ({ buggyCode: input.buggyCode, expectedBehavior: input.expectedBehavior }),
  extractFinalResult: (chunk) => {
    const c = chunk as {
      type?: string;
      payload?: { stepName?: string; output?: VerifiedHints };
    };
    if (c?.type === 'workflow-step-result' && c.payload?.stepName === 'verifier') {
      return c.payload.output ?? null;
    }
    return null;
  },
  steps: [
    { id: 'analyzer', label: 'Analyzer', role: 'sandbox: clasifica el bug' },
    { id: 'concept-mapper', label: 'Concept Mapper', role: 'identifica concepto CS' },
    { id: 'hinter', label: 'Hinter', role: 'genera L1/L2/L3 de pistas' },
    { id: 'verifier', label: 'Verifier', role: 'aplica L3, ejecuta, valida' },
  ],
};
