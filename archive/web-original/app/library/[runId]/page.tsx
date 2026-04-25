import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRun } from '../../../lib/runs';
import { LibraryRunView } from '../../../components/library/LibraryRunView';
import { Button } from '../../../components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function LibraryRunPage({ params }: Props) {
  const { runId } = await params;
  const run = await getRun(runId);
  if (!run) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-10 py-4 flex items-center gap-4 text-[12px]">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground font-mono px-2">
          <Link href="/library">← banco</Link>
        </Button>
        <span className="text-border">/</span>
        <span className="text-muted-foreground font-mono">{run.pipeline_id}</span>
        <span className="text-border">/</span>
        <span className="text-muted-foreground font-mono truncate flex-1">{run.id.slice(0, 8)}</span>
        <span className="text-muted-foreground/70 font-mono">
          {new Date(run.created_at).toLocaleString('es-PE')}
        </span>
        {run.elapsed_ms && (
          <>
            <span className="text-border">·</span>
            <span className="text-muted-foreground/70 font-mono">⏱ {(run.elapsed_ms / 1000).toFixed(1)}s</span>
          </>
        )}
      </header>

      <LibraryRunView pipelineId={run.pipeline_id} result={run.result} title={run.title} />
    </div>
  );
}
