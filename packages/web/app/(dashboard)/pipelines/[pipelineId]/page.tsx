import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { PageHeader } from "@/components/dashboard/PageHeader";
import { PipelineRunner } from "@/components/PipelineRunner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPipeline } from "@/lib/pipelines/registry";

interface PageProps {
  params: Promise<{ pipelineId: string }>;
}

export default async function PipelineRunPage({ params }: PageProps) {
  const { pipelineId } = await params;
  const config = getPipeline(pipelineId);

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title={config?.label ?? pipelineId}
        description={config?.description ?? "Pipeline desconocido."}
        actions={
          <>
            <Badge variant="outline" className="font-mono text-[11px]">
              {pipelineId}
            </Badge>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/pipelines">
                <ArrowLeftIcon /> Volver
              </Link>
            </Button>
          </>
        }
      />
      <PipelineRunner pipelineId={pipelineId} />
    </>
  );
}
