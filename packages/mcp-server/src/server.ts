import { MCPServer } from '@mastra/mcp';

import { getLessonContextTool } from './tools/getLessonContext.js';
import { generateExerciseTool } from './tools/generateExercise.js';
import { evaluateAnswerTool } from './tools/evaluateAnswer.js';
import { getHintTool } from './tools/getHint.js';
import { trackEventTool } from './tools/trackEvent.js';

export { verifierRegistry } from './verifierRegistry.js';

/**
 * Builds the ClassOS MCP server. Transports (stdio, http, openai-adapter)
 * import this and call `.startStdio()`, `.startHTTP()`, etc.
 *
 * Verifiers must be registered via `verifierRegistry.register()` BEFORE the
 * server starts handling requests, or `evaluate_answer` returns a
 * "no verifier registered" feedback.
 */
export function buildServer(): MCPServer {
  return new MCPServer({
    id: 'classos',
    name: 'ClassOS',
    version: '0.1.0',
    description:
      'Connects an LLM to a teacher-authored course: pulls lesson context, ' +
      'generates exercises, and verifies student answers via real execution ' +
      '(Python sandbox for code, SymPy for math).',
    instructions:
      'You are connected to a specific course. When the student asks about a topic, ' +
      "ALWAYS call `get_lesson_context` first to ground your response in what the teacher taught. " +
      "When the student practices, call `generate_exercise` then `evaluate_answer` — " +
      "never judge their answer yourself, the verifier is the source of truth. " +
      'Use `track_event` proactively to log when the student understands or struggles with concepts.',
    tools: {
      get_lesson_context: getLessonContextTool,
      generate_exercise: generateExerciseTool,
      evaluate_answer: evaluateAnswerTool,
      get_hint: getHintTool,
      track_event: trackEventTool,
    },
  });
}
