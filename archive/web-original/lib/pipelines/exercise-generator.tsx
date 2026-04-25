import type { PipelineConfig } from './registry';
import type { TeacherPackage } from '../markdown';
import { TeacherPackageView } from '../../components/pipelines/exercise-generator/TeacherPackageView';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const TOPICS = [
  { value: 'recursion', label: 'Recursión' },
  { value: 'loops', label: 'Loops' },
  { value: 'condicionales', label: 'Condicionales' },
  { value: 'funciones', label: 'Funciones' },
  { value: 'listas', label: 'Listas' },
  { value: 'strings', label: 'Strings' },
  { value: 'dicts', label: 'Dicts' },
  { value: 'oop-basico', label: 'OOP básico' },
];

interface ExerciseInput {
  topic: string;
  durationMinutes: number;
  demoMode: boolean;
}

function ExerciseInputForm({
  value,
  onChange,
  disabled,
}: {
  value: ExerciseInput;
  onChange: (v: ExerciseInput) => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="topic" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Tema
        </Label>
        <Select
          value={value.topic}
          onValueChange={(v) => onChange({ ...value, topic: v })}
          disabled={disabled}
        >
          <SelectTrigger id="topic" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="duration" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Duración (minutos)
        </Label>
        <Input
          id="duration"
          type="number"
          min={15}
          max={120}
          value={value.durationMinutes}
          onChange={(e) => onChange({ ...value, durationMinutes: Number(e.target.value) })}
          disabled={disabled}
        />
      </div>

      <Label
        htmlFor="demoMode"
        className="flex items-start gap-2.5 cursor-pointer p-3 rounded-md border border-border bg-muted/40 hover:bg-card font-normal"
      >
        <Checkbox
          id="demoMode"
          checked={value.demoMode}
          onCheckedChange={(c) => onChange({ ...value, demoMode: c === true })}
          disabled={disabled}
          className="mt-0.5"
        />
        <span className="text-[12px] leading-snug">
          <span className="font-bold text-foreground">Demo mode</span>
          <br />
          <span className="text-muted-foreground">
            fuerza un rechazo intencional en iter 1 para ver el loop C→B
          </span>
        </span>
      </Label>
    </>
  );
}

function ExerciseResultView({ result }: { result: TeacherPackage }) {
  return <TeacherPackageView pkg={result} topic={result.solution.problem.title} />;
}

export const exerciseGeneratorPipeline: PipelineConfig<ExerciseInput, TeacherPackage> = {
  id: 'exerciseGenerator',
  label: 'Generador de ejercicios CS',
  description:
    'Multi-agente que diseña, resuelve y valida un ejercicio Python en sandbox. Output: paquete docente listo para el aula.',
  enabled: true,
  accent: '#DC2626',
  defaultInput: { topic: 'recursion', durationMinutes: 45, demoMode: true },
  InputForm: ExerciseInputForm,
  ResultView: ExerciseResultView,
  buildBody: (input) => ({
    topic: input.topic,
    durationMinutes: input.durationMinutes,
    demoMode: input.demoMode,
  }),
  extractFinalResult: (chunk) => {
    const c = chunk as {
      type?: string;
      payload?: { stepName?: string; output?: TeacherPackage };
    };
    if (c?.type === 'workflow-step-result' && c.payload?.stepName === 'reviewer') {
      return c.payload.output ?? null;
    }
    return null;
  },
  steps: [
    { id: 'researcher', label: 'Researcher', role: 'contexto LatAm auténtico' },
    { id: 'init-loop-state', label: 'Init', role: 'estado del loop' },
    { id: 'designer-solver', label: 'Designer ⇄ Solver', role: 'redacta · resuelve · sandbox' },
    { id: 'reviewer', label: 'Reviewer', role: 'rúbrica · errores · hints' },
  ],
};
