'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  initialPipelineState,
  reducePipeline,
  type PipelineState,
} from '../lib/pipelineState';
import { getPipeline } from '../lib/pipelines/registry';
import { PipelineSummary, PipelineView } from './pipeline/PipelineView';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

type Phase = 'idle' | 'running' | 'done' | 'error';

export function PipelineRunner({ pipelineId }: { pipelineId: string }) {
  const config = getPipeline(pipelineId);
  const [input, setInput] = useState(config?.defaultInput ?? {});
  const [phase, setPhase] = useState<Phase>('idle');
  const [pipeline, setPipeline] = useState<PipelineState>(initialPipelineState);
  const [result, setResult] = useState<unknown>(null);
  const [savedRunId, setSavedRunId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [elapsed, setElapsed] = useState<number | undefined>();
  const startedAtRef = useRef<number | null>(null);

  if (!config) {
    return <div className="p-8 text-destructive">pipeline desconocido: {pipelineId}</div>;
  }

  const InputForm = config.InputForm;
  const ResultView = config.ResultView;

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
            // server-side may also send a `done` with full result
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

      if (result || phase === 'running') {
        setPhase((p) => (p === 'running' ? 'done' : p));
        const t = startedAtRef.current ? Date.now() - startedAtRef.current : undefined;
        setElapsed(t);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }

  const isRunning = phase === 'running';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="border-b-4 px-10 py-5 flex items-center gap-6"
        style={{ borderBottomColor: config.accent }}
      >
        <Button asChild variant="ghost" size="sm" className="text-[12px] text-muted-foreground font-mono px-2">
          <Link href="/">← inicio</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">{config.label}</h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{config.description}</p>
        </div>
        <Badge
          className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded text-white"
          style={{ background: config.accent }}
        >
          {config.id}
        </Badge>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-[340px_1fr]">
        <aside className="border-r border-border px-7 py-7 space-y-5 bg-card">
          <InputForm value={input} onChange={setInput} disabled={isRunning} />

          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full font-bold py-3 text-[14px]"
            size="lg"
          >
            {isRunning ? 'Generando…' : 'Ejecutar pipeline'}
          </Button>

          {error && (
            <div className="border border-destructive bg-red-50 text-[#7F1D1D] px-3 py-2 rounded-md text-[12px]">
              {error}
            </div>
          )}

          <Separator />

          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <p className="font-bold text-foreground mb-1">Pipeline</p>
            <ol className="space-y-0.5 font-mono">
              {config.steps.map((s, i) => (
                <li key={s.id}>
                  {i + 1}. {s.label}
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <section className="min-h-[calc(100vh-90px)]">
          {phase === 'idle' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center">
              <div className="text-[11px] font-mono text-muted-foreground mb-3">esperando input</div>
              <h2 className="text-2xl font-bold text-foreground max-w-md leading-tight">
                {config.label}
              </h2>
              <p className="text-[14px] text-muted-foreground mt-3 max-w-md">{config.description}</p>
            </div>
          )}

          {phase === 'done' && (
            <>
              <PipelineSummary state={pipeline} elapsedMs={elapsed} />
              {savedRunId && (
                <div className="px-8 py-2 bg-emerald-50 border-b border-emerald-200 text-[12px] flex items-center gap-2">
                  <span>💾 guardado en banco ·</span>
                  <Button asChild variant="link" size="sm" className="font-mono text-[#10B981] h-auto p-0 text-[12px]">
                    <Link href={`/library/${savedRunId}`}>
                      /library/{savedRunId.slice(0, 8)}
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {isRunning && (
            <PipelineView
              state={pipeline}
              topic={config.label}
              durationMinutes={0}
              demoMode={false}
            />
          )}

          {result !== null && phase === 'done' ? <ResultView result={result} /> : null}
        </section>
      </main>
    </div>
  );
}
