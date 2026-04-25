import Link from 'next/link';
import { ArrowRightIcon, BookOpenIcon, BugIcon, type LucideIcon } from 'lucide-react';

import { PIPELINE_LIST } from '@/lib/pipelines/registry';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { IconBadge } from '@/components/ui/icon-badge';
import { cn } from '@/lib/utils';

const PIPELINE_ICONS: Record<string, LucideIcon> = {
  exerciseGenerator: BookOpenIcon,
  debuggingTutor: BugIcon,
};

export function PipelinePicker() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {PIPELINE_LIST.map((p) => {
        const Icon = PIPELINE_ICONS[p.id] ?? BookOpenIcon;
        const card = (
          <Card
            className={cn(
              'group/pp relative flex flex-col gap-4 p-5 transition-colors',
              p.enabled
                ? 'cursor-pointer hover:border-primary/30'
                : 'cursor-not-allowed opacity-60',
            )}
          >
            <header className="flex items-start justify-between gap-3">
              <IconBadge tone="primary" size="md">
                <Icon />
              </IconBadge>
              {p.enabled ? (
                <Badge variant="success" className="h-5 text-[10px] uppercase tracking-wide">
                  ready
                </Badge>
              ) : (
                <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-wide">
                  pronto
                </Badge>
              )}
            </header>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-semibold tracking-tight">{p.label}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 border-t pt-3 font-mono text-[10px] text-muted-foreground">
              {p.steps.map((s, i) => (
                <span key={s.id} className="flex items-center gap-1.5">
                  <span>{s.label}</span>
                  {i < p.steps.length - 1 && <span className="text-border">→</span>}
                </span>
              ))}
            </div>

            {p.enabled && (
              <ArrowRightIcon className="absolute right-5 bottom-5 size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover/pp:translate-x-0 group-hover/pp:opacity-100" />
            )}
          </Card>
        );

        return p.enabled ? (
          <Link
            key={p.id}
            href={`/pipelines/${p.id}`}
            className="block no-underline text-inherit"
          >
            {card}
          </Link>
        ) : (
          <div key={p.id}>{card}</div>
        );
      })}
    </div>
  );
}
