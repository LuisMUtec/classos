import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { runPython } from '../sandbox/pythonRunner.js';
import { ExecutionResultSchema } from '../schemas/index.js';

export const executePythonTool = createTool({
  id: 'execute-python',
  description:
    'Ejecuta código Python en sandbox aislado (timeout 5s, sin acceso a filesystem/red). ' +
    'Devuelve stdout, stderr, exitCode y si timed out. Útil para validar que una solución y sus tests corren correctamente.',
  inputSchema: z.object({
    code: z
      .string()
      .describe('Código Python completo a ejecutar. Debe incluir la solución y los asserts/tests.'),
  }),
  outputSchema: ExecutionResultSchema,
  execute: async ({ code }) => {
    return await runPython(code, { timeoutMs: 5000 });
  },
});
