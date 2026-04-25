import { Mastra } from '@mastra/core/mastra';

import { assistantAgent } from './agents/assistant.js';
import { researcherAgent } from './agents/researcher.js';
import { designerAgent } from './agents/designer.js';
import { solverValidatorAgent } from './agents/solverValidator.js';
import { reviewerAgent } from './agents/reviewer.js';
import { analyzerAgent } from './agents/analyzer.js';
import { conceptMapperAgent } from './agents/conceptMapper.js';
import { hinterAgent } from './agents/hinter.js';
import { verifierAgent } from './agents/verifier.js';

import { exerciseGeneratorWorkflow } from './workflows/exerciseGenerator.js';
import { debuggingTutorWorkflow } from './workflows/debuggingTutor.js';

export const mastra = new Mastra({
  agents: {
    assistant: assistantAgent,
    researcher: researcherAgent,
    designer: designerAgent,
    solverValidator: solverValidatorAgent,
    reviewer: reviewerAgent,
    analyzer: analyzerAgent,
    conceptMapper: conceptMapperAgent,
    hinter: hinterAgent,
    verifier: verifierAgent,
  },
  workflows: {
    exerciseGenerator: exerciseGeneratorWorkflow,
    debuggingTutor: debuggingTutorWorkflow,
  },
});
