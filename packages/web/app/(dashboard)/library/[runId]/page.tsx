import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ClockIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { LibraryRunView } from "@/components/library/LibraryRunView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRun } from "@/lib/runs";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function LibraryRunPage({ params }: Props) {
  const { runId } = await params;
  const run = await getRun(runId);
  if (!run) notFound();

  const elapsedSec = run.elapsed_ms ? (run.elapsed_ms / 1000).toFixed(1) : null;

  return (
    <>
      <PageHeader
        eyebrow={`Library · ${run.pipeline_id}`}
        title={run.title ?? "(sin título)"}
        description={`Run guardado ${new Date(run.created_at).toLocaleString("es-PE")}`}
        actions={
          <>
            {elapsedSec && (
              <Badge variant="outline" className="gap-1">
                <ClockIcon className="size-3" />
                {elapsedSec}s
              </Badge>
            )}
            <Badge variant="outline" className="font-mono text-[11px]">
              {run.id.slice(0, 8)}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/library">
                <ArrowLeftIcon /> Volver
              </Link>
            </Button>
          </>
        }
      />
      <LibraryRunView pipelineId={run.pipeline_id} result={run.result} title={run.title} />
    </>
  );
}
