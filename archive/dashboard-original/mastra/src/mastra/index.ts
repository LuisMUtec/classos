import { Mastra } from '@mastra/core/mastra';
import { assistantAgent } from './agents/assistant.js';
import { researcherAgent } from './agents/researcher.js';
import { sampleWorkflow } from './workflows/sample.js';

export const mastra = new Mastra({
  agents: {
    assistant: assistantAgent,
    researcher: researcherAgent,
  },
  workflows: {
    sample: sampleWorkflow,
  },
  server: {
    port: Number(process.env.MASTRA_PORT ?? 4112),
  },
});
