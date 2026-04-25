import type { DesignerSolverIteration } from '../../lib/pipelineState';
import { CodeBlock } from '../CodeBlock';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '../ai-elements/reasoning';
import { Shimmer } from '../ai-elements/shimmer';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';

interface Props {
  iterations: DesignerSolverIteration[];
}

export function IterationStack({ iterations }: Props) {
  if (iterations.length === 0) return null;
  return (
    <div className="mt-4 space-y-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Designer ⇄ Solver-Validator · loop C→B
      </div>
      {iterations.map((iter, idx) => (
        <IterationCard key={iter.iter} iter={iter} isLast={idx === iterations.length - 1} />
      ))}
    </div>
  );
}

function IterationCard({ iter, isLast }: { iter: DesignerSolverIteration; isLast: boolean }) {
  const { state, problem, decision } = iter;

  const cardStyle =
    state === 'success'
      ? 'border-[#10B981] bg-emerald-50'
      : state === 'rejected'
        ? 'border-destructive bg-red-50'
        : 'border-amber-300 bg-amber-50';

  const stateBadge =
    state === 'success' ? (
      <Badge className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-[#10B981] text-white">
        accepted
      </Badge>
    ) : state === 'rejected' ? (
      <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-wider rounded-full">
        rejected
      </Badge>
    ) : (
      <Badge className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500 text-white animate-pulse">
        running
      </Badge>
    );

  return (
    <Card className={cn('rounded-xl border-2 p-4 transition-all duration-300 gap-2', cardStyle)}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-bold text-foreground">
          Iteración {iter.iter}{problem ? ` · ${problem.title}` : ''}
        </div>
        {stateBadge}
      </div>

      {!problem && state === 'running' && (
        <Shimmer as="div" className="text-xs font-mono">
          designer redactando enunciado…
        </Shimmer>
      )}

      {problem && (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-3 mt-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Spec
            </div>
            <CodeBlock code={problem.functionSignature} small />
            <div className="text-[11px] text-foreground/80 mt-2 leading-snug line-clamp-3">
              {problem.ioSpec}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              {decision?.solutionCode
                ? 'Solver intenta'
                : decision?.attemptedSolution
                  ? 'Intento (rechazado)'
                  : 'Solver pensando…'}
            </div>
            {(decision?.solutionCode || decision?.attemptedSolution) && (
              <CodeBlock code={(decision.solutionCode ?? decision.attemptedSolution) || ''} small />
            )}
          </div>
        </div>
      )}

      {decision?.execution && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <ExecBadge ok exec={decision.execution} testsCount={decision.tests?.length ?? 0} />
        </div>
      )}

      {decision?.failedExecution && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <ExecBadge ok={false} exec={decision.failedExecution} />
        </div>
      )}

      {state === 'rejected' && decision && (
        <Card className="mt-3 rounded-lg border border-destructive p-3 gap-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-destructive mb-2">
            ❌ {decision.rejectionReason ?? 'rechazado'}
          </div>
          <Reasoning defaultOpen className="text-[12px] text-foreground/80">
            <ReasoningTrigger className="text-[11px] text-muted-foreground">
              <span>🧠 feedback del Solver al Designer</span>
            </ReasoningTrigger>
            <ReasoningContent>
              {decision.feedbackForDesigner ?? '(sin feedback)'}
            </ReasoningContent>
          </Reasoning>
          {!isLast && (
            <div className="mt-2 text-[10px] text-destructive font-mono font-bold">↻ reintentando…</div>
          )}
        </Card>
      )}
    </Card>
  );
}

function ExecBadge({
  ok,
  exec,
  testsCount,
}: {
  ok: boolean;
  exec: { exitCode: number; durationMs: number };
  testsCount?: number;
}) {
  return (
    <Badge
      className={cn(
        'text-[11px] font-mono rounded-md px-2.5 py-1 inline-flex items-center gap-2',
        ok ? 'bg-foreground text-[#10B981]' : 'bg-foreground text-destructive',
      )}
    >
      <span className="font-bold">{ok ? '✓' : '✗'} sandbox</span>
      <span>exit {exec.exitCode}</span>
      <span>·</span>
      <span>{exec.durationMs}ms</span>
      {testsCount !== undefined && testsCount > 0 && (
        <>
          <span>·</span>
          <span>{testsCount} tests</span>
        </>
      )}
    </Badge>
  );
}
