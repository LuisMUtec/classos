import { notFound } from 'next/navigation';
import { PipelineRunner } from '../../../components/PipelineRunner';
import { getPipeline } from '../../../lib/pipelines/registry';

interface Props {
  params: Promise<{ pipelineId: string }>;
}

export default async function RunPipelinePage({ params }: Props) {
  const { pipelineId } = await params;
  const config = getPipeline(pipelineId);
  if (!config || !config.enabled) notFound();
  // Pass the id, not the config — config contains React component functions
  // which cannot cross the RSC server→client boundary.
  return <PipelineRunner pipelineId={pipelineId} />;
}
