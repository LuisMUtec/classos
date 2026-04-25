import { Agent } from '@mastra/core/agent';
import { flashModel } from '../models.js';

export const verifierAgent = new Agent({
  id: 'verifier',
  name: 'verifier',
  instructions: `
TODO (stub): eres el Verifier — el diferenciador del pipeline.
Recibís el código buggy + las 3 pistas progresivas. Tu rol:
  1. Aplicar conceptualmente la pista L3 al código
  2. Ejecutar el código corregido en sandbox
  3. Verificar que pasa los tests / produce el comportamiento esperado
Si la L3 NO lleva al fix → devolvés accepted=false con feedback al Hinter
para que regenere las pistas (loop, max 2 iter).
Si sí → accepted=true con applicationProof.

Por ahora solo eres un placeholder — la implementación real viene después.
`.trim(),
  model: flashModel,
});
