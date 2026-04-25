import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
});

// gemini-2.5-flash es barato (~$0.10/1M tokens entrada) y confiable.
// Para 100% gratis, usa cualquier id terminado en `:free` de https://openrouter.ai/api/v1/models —
// pero los free models tienen rate limits compartidos y suelen devolver 429 en horas pico.
export const fastModel = openrouter('google/gemini-2.5-flash');
export const reasoningModel = openrouter('google/gemini-2.5-flash');

// Bajo por default para no chocar con el budget del key gratuito (~471 tokens disponibles).
// Súbelo cuando tengas créditos: gemini-2.5-flash soporta hasta 65535.
export const MAX_OUTPUT_TOKENS = 400;
