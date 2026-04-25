import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
});

// gemini-2.5-flash es barato (~$0.10/1M tokens entrada) y confiable.
// Default a flash en todo para no quemar créditos. Cambia a un modelo pago
// puntual (claude-3-5-sonnet, gpt-4o, etc.) por agent cuando lo necesites.
export const flashModel = openrouter('google/gemini-2.5-flash');
export const proModel = openrouter('google/gemini-2.5-flash');

// Aliases para compatibilidad con el assistant agent del dashboard.
export const fastModel = flashModel;
export const reasoningModel = proModel;

// Tokens de salida máxima para cada llamada al modelo.
// 400 cabe en el budget del key gratuito. Súbelo a 1200+ cuando tengas créditos
// (los pasos del exerciseGenerator funcionan mejor con ~1200).
export const MAX_OUTPUT_TOKENS = 400;
