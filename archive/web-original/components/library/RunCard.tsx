import Link from 'next/link';
import type { RunRow } from '../../lib/runs';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';

const PIPELINE_ACCENTS: Record<string, string> = {
  exerciseGenerator: '#DC2626',
  debuggingTutor: '#0EA5E9',
};

const PIPELINE_LABELS: Record<string, string> = {
  exerciseGenerator: 'Generador',
  debuggingTutor: 'Debug Tutor',
};

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'recién';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function RunCard({ run }: { run: RunRow }) {
  const accent = PIPELINE_ACCENTS[run.pipeline_id] ?? '#64748B';
  const label = PIPELINE_LABELS[run.pipeline_id] ?? run.pipeline_id;
  return (
    <Link href={`/library/${run.id}`} className="block no-underline text-inherit">
      <Card
        className="rounded-xl border-2 border-border bg-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all gap-2"
        style={{ borderTopColor: accent, borderTopWidth: '5pt' }}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-bold text-foreground leading-tight line-clamp-2">
            {run.title ?? '(sin título)'}
          </h3>
          <Badge
            className="shrink-0 text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 text-white"
            style={{ background: accent }}
          >
            {label}
          </Badge>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2 flex-wrap">
          {run.topic && <span>{run.topic}</span>}
          {run.topic && <span className="text-border">·</span>}
          <span>{run.iteration_count} iter</span>
          {run.exec_exit_code !== null && (
            <>
              <span className="text-border">·</span>
              <span className="text-[#10B981]">
                exit {run.exec_exit_code} · {run.exec_duration_ms}ms
              </span>
            </>
          )}
          <span className="ml-auto text-muted-foreground/70">{relativeTime(run.created_at)}</span>
        </div>
      </Card>
    </Link>
  );
}
