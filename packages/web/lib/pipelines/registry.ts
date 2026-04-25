import type { ComponentType } from 'react';

export interface PipelineConfig<TInput = unknown, TOutput = unknown> {
  /** Matches the Mastra workflow id (used by route handler to dispatch) */
  id: string;
  /** User-facing label (picker card) */
  label: string;
  /** Short pitch (picker card body) */
  description: string;
  /** Whether this pipeline is wired up end-to-end yet */
  enabled: boolean;
  /** Hex color used for accents (border, badges) — keeps each pipeline visually distinct */
  accent: string;
  /** Initial input value passed to InputForm */
  defaultInput: TInput;
  /** Sidebar form for collecting input */
  InputForm: ComponentType<{
    value: TInput;
    onChange: (next: TInput) => void;
    disabled: boolean;
  }>;
  /** Final-artifact view rendered after the pipeline finishes */
  ResultView: ComponentType<{ result: TOutput }>;
  /** Convert form input → request body for the route handler */
  buildBody: (input: TInput) => Record<string, unknown>;
  /** Pull the final structured result out of the stream chunks (matches the workflow's terminal step output) */
  extractFinalResult: (chunk: unknown) => TOutput | null;
  /** Step ids in display order, for the visual pipeline */
  steps: Array<{ id: string; label: string; role: string }>;
}

import { exerciseGeneratorPipeline } from './exercise-generator';
import { debuggingTutorPipeline } from './debugging-tutor';

export const PIPELINES: Record<string, PipelineConfig> = {
  [exerciseGeneratorPipeline.id]: exerciseGeneratorPipeline as PipelineConfig,
  [debuggingTutorPipeline.id]: debuggingTutorPipeline as PipelineConfig,
};

export const PIPELINE_LIST = Object.values(PIPELINES);

export function getPipeline(id: string): PipelineConfig | null {
  return PIPELINES[id] ?? null;
}
