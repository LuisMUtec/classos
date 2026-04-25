import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { cn } from '@/lib/utils';
import type { ScenarioCandidate } from '../../lib/pipelineState';

interface Props {
  candidates: ScenarioCandidate[];
  selected?: ScenarioCandidate;
}

export function CandidateCarousel({ candidates, selected }: Props) {
  return (
    <div className="mt-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        Researcher · {candidates.length} contextos LatAm propuestos
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {candidates.map((c, i) => {
          const isSelected = selected && c.title === selected.title;
          return (
            <Card
              key={i}
              className={cn(
                'shrink-0 w-[260px] rounded-lg p-3 border-2 transition-all duration-300 gap-1',
                isSelected
                  ? 'border-destructive bg-card shadow-md'
                  : 'border-border bg-muted/40 opacity-60',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[12px] font-bold text-foreground leading-tight">{c.title}</div>
                {isSelected && (
                  <Badge variant="destructive" className="shrink-0 text-[9px] font-bold uppercase tracking-wider rounded-full px-1.5">
                    elegido
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground leading-snug line-clamp-3">
                {c.context}
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                ~{c.estimatedFitMinutes}min
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
