import Link from 'next/link';
import { ArrowRightIcon, BookOpenIcon, BugIcon, type LucideIcon } from 'lucide-react';

import type { RunRow } from '@/lib/runs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';

const PIPELINE_ICONS: Record<string, LucideIcon> = {
  exerciseGenerator: BookOpenIcon,
  debuggingTutor: BugIcon,
};

const PIPELINE_LABELS: Record<string, string> = {
  exerciseGenerator: 'Generator',
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
  const Icon = PIPELINE_ICONS[run.pipeline_id] ?? BookOpenIcon;
  const label = PIPELINE_LABELS[run.pipeline_id] ?? run.pipeline_id;

  return (
    <Link href={`/library/${run.id}`} className="block no-underline text-inherit">
      <Card className="group/run flex flex-col gap-3 p-4 transition-colors hover:border-primary/30">
        <header className="flex items-start gap-3">
          <IconBadge tone="primary" size="md">
            <Icon />
          </IconBadge>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
              {run.title ?? '(sin título)'}
            </h3>
            <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wide">
              {label}
            </Badge>
          </div>
        </header>

        <footer className="flex items-center gap-2 border-t pt-3 font-mono text-[11px] text-muted-foreground">
          {run.topic && (
            <>
              <span>{run.topic}</span>
              <span className="text-border">·</span>
            </>
          )}
          <span>{run.iteration_count} iter</span>
          {run.exec_exit_code !== null && (
            <>
              <span className="text-border">·</span>
              <span className="text-success">
                exit {run.exec_exit_code} · {run.exec_duration_ms}ms
              </span>
            </>
          )}
          <span className="ml-auto flex items-center gap-1 text-muted-foreground/70">
            {relativeTime(run.created_at)}
            <ArrowRightIcon className="size-3 -translate-x-0.5 opacity-0 transition-all group-hover/run:translate-x-0 group-hover/run:opacity-100" />
          </span>
        </footer>
      </Card>
    </Link>
  );
}
