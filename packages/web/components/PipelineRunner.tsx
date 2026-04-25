'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArchiveIcon, PlayIcon, AlertTriangleIcon, Loader2Icon } from 'lucide-react';

import { initialPipelineState, reducePipeline, type PipelineState } from '@/lib/pipelineState';
import { getPipeline } from '@/lib/pipelines/registry';
import { PipelineSummary, PipelineView } from '@/components/pipeline/PipelineView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/ui/empty-state';
import { IconBadge } from '@/components/ui/icon-badge';

type Phase = 'idle' | 'running' | 'done' | 'error';

export function PipelineRunner({ pipelineId }: { pipelineId: string }) {
  const config = getPipeline(pipelineId);

  if (!config) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">
          Pipeline desconocido: <code className="font-mono">{pipelineId}</code>
        </p>
      </Card>
    );
  }

  return <PipelineRunnerInner config={config} />;
}

function PipelineRunnerInner({
  config,
}: {
  config: NonNullable<ReturnType<typeof getPipeline>>;
}) {
  const [input, setInput] = useState<unknown>(config.defaultInput);
  const [phase, setPhase] = useState<Phase>('idle');
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipelineState);
  const [result, setResult] = useState<unknown>(null);
  const [savedRunId, setSavedRunId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [elapsed, setElapsed] = useState<number | undefined>();
  const startedAtRef = useRef<number | null>(null);

  const InputForm = config.InputForm;
  const ResultView = config.ResultView;
  const isRunning = phase === 'running';

  async function handleRun() {
    setPhase('running');
    setPipeline(initialPipelineState);
    setResult(null);
    setSavedRunId(null);
    setError('');
    setElapsed(undefined);
    startedAtRef.current = Date.now();

    try {
      const res = await fetch(`/api/generate/${config.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.buildBody(input)),
      });

      if (!res.body) throw new Error('no stream body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const evt of events) {
          const lines = evt.split('\n');
          let event = '';
          let data = '';
          for (const l of lines) {
            if (l.startsWith('event: ')) event = l.slice(7);
            else if (l.startsWith('data: ')) data = l.slice(6);
          }
          if (!event) continue;
          const parsed = data ? JSON.parse(data) : {};

          if (event === 'chunk') {
            setPipeline((prev) => reducePipeline(prev, parsed));
            const extracted = config.extractFinalResult(parsed);
            if (extracted) setResult(extracted);
          } else if (event === 'done') {
            if (parsed.teacherPackage) setResult(parsed.teacherPackage);
            else if (parsed.result) setResult(parsed.result);
            if (parsed.savedRunId) setSavedRunId(parsed.savedRunId);
            setPhase('done');
            const t = startedAtRef.current ? Date.now() - startedAtRef.current : undefined;
            setElapsed(t);
          } else if (event === 'error') {
            setError(parsed.message ?? 'error desconocido');
            setPhase('error');
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      {/* Input panel */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <Card className="flex flex-col gap-5 p-5">
          <header className="flex items-start gap-3">
            <IconBadge tone="primary" size="md">
              <PlayIcon />
            </IconBadge>
            <div className="flex flex-col gap-0.5">
              <h2 className="text-sm font-semibold">Entrada</h2>
              <p className="text-xs text-muted-foreground">
                Configura los parámetros y ejecuta.
              </p>
            </div>
          </header>

          <InputForm value={input} onChange={(next: unknown) => setInput(next)} disabled={isRunning} />

          <Button
            onClick={handleRun}
            disabled={isRunning || !config.enabled}
            size="lg"
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2Icon className="animate-spin" />
                Generando…
              </>
            ) : (
              <>
                <PlayIcon />
                Ejecutar pipeline
              </>
            )}
          </Button>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs"
            >
              <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0 text-destructive" />
              <p className="text-destructive">{error}</p>
            </div>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Pipeline
            </p>
            <ol className="flex flex-col gap-1 font-mono text-xs">
              {config.steps.map((s, i) => (
                <li key={s.id} className="flex items-baseline gap-2">
                  <span className="text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </aside>

      {/* Output panel */}
      <section className="flex min-w-0 flex-col gap-3">
        {phase === 'idle' && (
          <EmptyState
            icon={<PlayIcon />}
            title={`Listo para ejecutar ${config.label}`}
            description={config.description}
          />
        )}

        {(phase === 'running' || phase === 'done') && (
          <>
            {phase === 'done' && <PipelineSummary state={pipeline} elapsedMs={elapsed} />}
            {savedRunId && (
              <Card className="flex items-center justify-between gap-3 border-success/30 bg-success/5 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <ArchiveIcon className="size-4 text-success" />
                  <span>Guardado en library</span>
                </div>
                <Button asChild variant="link" size="sm" className="font-mono">
                  <Link href={`/library/${savedRunId}`}>
                    /library/{savedRunId.slice(0, 8)}
                    <Badge variant="outline" className="ml-1 text-[10px]">
                      ver
                    </Badge>
                  </Link>
                </Button>
              </Card>
            )}
            {phase === 'running' && (
              <PipelineView state={pipeline} topic={config.label} durationMinutes={0} demoMode={false} />
            )}
            {phase === 'done' && result !== null && <ResultView result={result} />}
          </>
        )}
      </section>
    </div>
  );
}
