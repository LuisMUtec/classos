import type { CommonError } from '../../../lib/markdown';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { SubLabel } from './StudentSection';

export function CommonErrorsList({ errors }: { errors: CommonError[] }) {
  return (
    <div>
      <SubLabel>Errores comunes esperados ({errors.length})</SubLabel>
      <div className="space-y-2.5">
        {errors.map((e, i) => (
          <Card key={i} className="rounded-md border border-border bg-card p-3 gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="destructive"
                className="text-[10px] font-bold rounded-full w-5 h-5 inline-flex items-center justify-center p-0"
              >
                {i + 1}
              </Badge>
              <div className="text-[13px] font-bold text-foreground">{e.error}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Por qué pasa
                </div>
                <div className="text-foreground/80 leading-snug">{e.whyHappens}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Cómo guiar
                </div>
                <div className="text-foreground/80 leading-snug">{e.howToGuide}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
