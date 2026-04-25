import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { researcherAgent } from '../agents/researcher.js';

const inputSchema = z.object({
  topic: z.string().min(1),
});

const outputSchema = z.object({
  topic: z.string(),
  summary: z.string(),
});

const researchStep = createStep({
  id: 'research',
  inputSchema,
  outputSchema,
  execute: async ({ inputData }) => {
    const response = await researcherAgent.generate(
      `Investiga el tema: "${inputData.topic}".`,
    );
    return {
      topic: inputData.topic,
      summary: response.text,
    };
  },
});

export const sampleWorkflow = createWorkflow({
  id: 'sample',
  description: 'Workflow ejemplo: toma un topic, lo pasa por el researcher.',
  inputSchema,
  outputSchema,
})
  .then(researchStep)
  .commit();
