import Link from 'next/link';
import { PIPELINE_LIST } from '../lib/pipelines/registry';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

export function PipelinePicker() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b-4 border-foreground px-10 py-6 flex items-center gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight">edhack</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pipelines multi-agente para educación de CS · Mastra + OpenRouter + Gemini · sandbox Python
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="font-mono text-[12px]">
          <Link href="/library">📚 Banco</Link>
        </Button>
      </header>

      <main className="px-10 py-10 max-w-[1100px] mx-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Elegí un pipeline
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PIPELINE_LIST.map((p) => {
            const card = (
              <Card
                className={cn(
                  'rounded-xl border-2 p-5 transition-all gap-2',
                  p.enabled
                    ? 'border-border hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                    : 'border-border opacity-60 cursor-not-allowed',
                )}
                style={{
                  borderTopColor: p.enabled ? p.accent : '#CBD5E1',
                  borderTopWidth: '6pt',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-foreground">{p.label}</h2>
                  {!p.enabled && (
                    <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider rounded-full">
                      próximamente
                    </Badge>
                  )}
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{p.description}</p>
                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 flex-wrap text-[10px] font-mono text-muted-foreground">
                  {p.steps.map((s, i) => (
                    <span key={s.id} className="flex items-center gap-2">
                      <span>{s.label}</span>
                      {i < p.steps.length - 1 && <span className="text-border">→</span>}
                    </span>
                  ))}
                </div>
              </Card>
            );
            return p.enabled ? (
              <Link key={p.id} href={`/run/${p.id}`} className="block no-underline text-inherit">
                {card}
              </Link>
            ) : (
              <div key={p.id}>{card}</div>
            );
          })}
        </div>

        <div className="mt-12 text-[11px] text-muted-foreground/70 font-mono leading-relaxed">
          <p>
            Patrón compartido: 4 agentes en cascada, último agente con loop de validación por
            ejecución (re-invoca al anterior con feedback si rechaza, max 2 iter).
          </p>
        </div>
      </main>
    </div>
  );
}
