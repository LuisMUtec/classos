'use client';

import { getPipeline } from '../../lib/pipelines/registry';

interface Props {
  pipelineId: string;
  result: unknown;
  title: string | null;
}

/**
 * Client component wrapper around the pipeline's ResultView.
 * Lives client-side because the registry holds React component functions
 * which can't cross the RSC server→client boundary.
 */
export function LibraryRunView({ pipelineId, result }: Props) {
  const config = getPipeline(pipelineId);
  if (!config) {
    return (
      <div className="p-8 text-destructive">
        Pipeline desconocido: <code>{pipelineId}</code>
      </div>
    );
  }
  const ResultView = config.ResultView;
  return <ResultView result={result} />;
}
