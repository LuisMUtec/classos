import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import type { StepState } from '../../lib/pipelineState';

interface Props {
  name: string;
  role: string;
  state: StepState;
  badge?: string;
  active?: boolean;
}

const STATE_STYLES: Record<
  StepState,
  { card: string; pillVariant: 'secondary' | 'default' | 'destructive'; pillClass: string; pillText: string }
> = {
  pending: {
    card: 'border-slate-200 bg-card',
    pillVariant: 'secondary',
    pillClass: '',
    pillText: 'pending',
  },
  running: {
    card: 'border-amber-400 bg-amber-50',
    pillVariant: 'default',
    pillClass: 'bg-amber-500 text-white animate-pulse',
    pillText: 'running',
  },
  success: {
    card: 'border-[#10B981] bg-emerald-50',
    pillVariant: 'default',
    pillClass: 'bg-[#10B981] text-white',
    pillText: 'ok',
  },
  rejected: {
    card: 'border-destructive bg-red-50',
    pillVariant: 'destructive',
    pillClass: 'bg-destructive text-white',
    pillText: 'reject',
  },
};

export function AgentCard({ name, role, state, badge, active }: Props) {
  const s = STATE_STYLES[state];
  return (
    <Card
      className={cn(
        'rounded-xl border-2 px-4 py-3 transition-all duration-300 gap-0',
        s.card,
        active ? 'shadow-lg scale-[1.02]' : 'shadow-sm',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-bold text-foreground truncate">{name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{role}</div>
        </div>
        <Badge
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider rounded-full',
            s.pillClass,
          )}
        >
          {badge ?? s.pillText}
        </Badge>
      </div>
    </Card>
  );
}

export function PipelineArrow({ active }: { active?: boolean }) {
  return (
    <div className="flex items-center justify-center px-1">
      <svg
        width="32"
        height="14"
        viewBox="0 0 32 14"
        className={active ? 'text-[#10B981]' : 'text-border'}
      >
        <path
          d="M0 7 H26 M20 1 L26 7 L20 13"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
