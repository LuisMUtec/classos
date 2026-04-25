import type { PipelineState } from '../../lib/pipelineState';
import { Shimmer } from '../ai-elements/shimmer';
import { AgentCard, PipelineArrow } from './AgentCard';
import { CandidateCarousel } from './CandidateCarousel';
import { IterationStack } from './IterationStack';

interface Props {
  state: PipelineState;
  topic: string;
  durationMinutes: number;
  demoMode: boolean;
}

export function PipelineView({ state, topic, durationMinutes, demoMode }: Props) {
  const { researcher, designerSolver, reviewer } = state;
  const dsBadge =
    designerSolver.iterations.length > 0
      ? `${designerSolver.iterations.length}/2 iter`
      : undefined;

  return (
    <div className="px-8 py-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-mono text-muted-foreground">workflow:</span>
        <span className="text-[11px] font-mono font-bold text-foreground">
          {topic} · {durationMinutes}min{demoMode ? ' · demo' : ''}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1.4fr_auto_1fr] items-stretch gap-0">
        <AgentCard
          name="Researcher"
          role="contexto LatAm auténtico"
          state={researcher.state}
          active={researcher.state === 'running'}
        />
        <PipelineArrow active={researcher.state === 'success'} />
        <AgentCard
          name="Designer ⇄ Solver"
          role="redacta · resuelve · sandbox"
          state={designerSolver.state === 'pending' && designerSolver.iterations.length > 0 ? 'running' : designerSolver.state}
          active={designerSolver.iterations.some((i) => i.state === 'running')}
          badge={dsBadge}
        />
        <PipelineArrow active={designerSolver.state === 'success'} />
        <AgentCard
          name="Reviewer"
          role="rúbrica · errores · hints"
          state={reviewer.state}
          active={reviewer.state === 'running'}
        />
      </div>

      {researcher.candidates && (
        <CandidateCarousel candidates={researcher.candidates} selected={researcher.selected} />
      )}

      <IterationStack iterations={designerSolver.iterations} />

      {reviewer.state === 'running' && (
        <Shimmer as="div" className="mt-4 text-xs font-mono">
          📚 reviewer compilando paquete docente…
        </Shimmer>
      )}
    </div>
  );
}

export function PipelineSummary({
  state,
  elapsedMs,
}: {
  state: PipelineState;
  elapsedMs?: number;
}) {
  const iters = state.designerSolver.iterations.length;
  const acceptedIter = state.designerSolver.iterations.find((i) => i.state === 'success');
  const exec = acceptedIter?.decision?.execution;
  return (
    <div className="px-8 py-3 border-b border-border bg-emerald-50 flex items-center gap-4 text-[12px] flex-wrap">
      <span className="font-bold text-[#10B981]">✓ generado</span>
      <span className="text-muted-foreground">
        <span className="font-mono font-bold">{iters}</span> iteración{iters !== 1 ? 'es' : ''} del loop validador
      </span>
      {exec && (
        <span className="text-muted-foreground">
          sandbox: <span className="font-mono font-bold">exit {exec.exitCode}</span> ·{' '}
          <span className="font-mono font-bold">{exec.durationMs}ms</span>
        </span>
      )}
      {elapsedMs !== undefined && (
        <span className="text-muted-foreground ml-auto font-mono text-[11px]">⏱ {(elapsedMs / 1000).toFixed(1)}s</span>
      )}
    </div>
  );
}
