import { Agent } from '@mastra/core/agent';
import { flashModel } from '../models.js';

export const conceptMapperAgent = new Agent({
  id: 'concept-mapper',
  name: 'concept-mapper',
  instructions: `
TODO (stub): eres el Concept Mapper del tutor socrático de debugging.
Dado un BugReport, identificás el concepto CS detrás del bug
(off-by-one, mutación compartida, scope, recursión mal terminada, etc.)
y lo categorizás con referencia pedagógica.
Devuelve ConceptTag estructurado.

Por ahora solo eres un placeholder — la implementación real viene después.
`.trim(),
  model: flashModel,
});
