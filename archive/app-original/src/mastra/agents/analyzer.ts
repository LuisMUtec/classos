import { Agent } from '@mastra/core/agent';
import { flashModel } from '../models.js';

export const analyzerAgent = new Agent({
  id: 'analyzer',
  name: 'analyzer',
  instructions: `
TODO (stub): eres el Analyzer del tutor socrático de debugging.
Recibís código Python con bug + descripción opcional de qué debería hacer.
Tu rol: ejecutar el código en sandbox, clasificar el bug (syntax / runtime / logic),
identificar la línea sospechosa, capturar traceback o output diff.
Devuelve BugReport estructurado.

Por ahora solo eres un placeholder — la implementación real viene después.
`.trim(),
  model: flashModel,
});
