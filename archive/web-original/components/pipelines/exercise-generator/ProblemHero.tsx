import { Badge } from '../../ui/badge';

interface Props {
  title: string;
  iterationCount: number;
  topic: string;
}

export function ProblemHero({ title, iterationCount, topic }: Props) {
  return (
    <div className="border-b border-border pb-6 mb-6">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        <span>Paquete docente generado</span>
        <span className="text-border">·</span>
        <span className="font-mono text-destructive">{topic}</span>
      </div>
      <h1 className="text-3xl font-extrabold text-foreground leading-tight">{title}</h1>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <Badge className="text-[11px] font-mono bg-emerald-100 text-emerald-700 rounded-full px-2.5 py-1 font-bold">
          ✓ validado por ejecución
        </Badge>
        <Badge className="text-[11px] font-mono bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 font-normal">
          {iterationCount} iter del loop C→B
        </Badge>
      </div>
    </div>
  );
}
