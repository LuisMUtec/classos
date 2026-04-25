import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
});

export const flashModel = openrouter('google/gemini-2.5-flash');
// Pro is more accurate but expensive. Default to flash for everything to stay within credit budget.
export const proModel = openrouter('google/gemini-2.5-flash');

export const MAX_OUTPUT_TOKENS = 1200;
