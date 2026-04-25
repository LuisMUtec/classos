import type { ProblemStatement } from '../../../lib/markdown';
import { CodeBlock } from '../../CodeBlock';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';

export function StudentSection({ problem }: { problem: ProblemStatement }) {
  return (
    <section className="mb-10">
      <SectionHeader label="Para el alumno" tag="ALUMNO" />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="space-y-5">
          <div>
            <SubLabel>Contexto</SubLabel>
            <p className="text-[14px] text-foreground/80 leading-relaxed">{problem.story}</p>
          </div>
          <div>
            <SubLabel>Especificación</SubLabel>
            <p className="text-[13px] text-foreground/80 leading-relaxed whitespace-pre-line">
              {problem.ioSpec}
            </p>
          </div>
          <div>
            <SubLabel>Firma de la función</SubLabel>
            <CodeBlock code={problem.functionSignature} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <SubLabel>Restricciones</SubLabel>
            <ul className="space-y-1.5">
              {problem.constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-foreground/80">
                  <span className="text-destructive font-bold mt-0.5">·</span>
                  <span className="font-mono">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubLabel>Ejemplos</SubLabel>
            <div className="space-y-2">
              {problem.examples.map((e, i) => (
                <Card key={i} className="rounded-md border border-border bg-card p-3 text-[12px] gap-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Ejemplo {i + 1}
                  </div>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
                    <span className="text-muted-foreground">in</span>
                    <span className="text-foreground">{e.input}</span>
                    <span className="text-muted-foreground">out</span>
                    <span className="text-[#10B981] font-bold">{e.output}</span>
                  </div>
                  {e.explanation && (
                    <div className="text-[11px] text-muted-foreground mt-2 italic">
                      {e.explanation}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ label, tag }: { label: string; tag: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <Badge className="text-[10px] font-bold uppercase tracking-[0.15em] bg-foreground text-background px-2 py-1 rounded">
        {tag}
      </Badge>
      <h2 className="text-lg font-bold text-foreground">{label}</h2>
    </div>
  );
}

export function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </div>
  );
}
