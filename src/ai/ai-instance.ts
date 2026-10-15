// Use ESM import syntax with named imports
// import { genkit } from 'genkit';
const { genkit } = require('genkit');
import { googleAI } from '@genkit-ai/googleai';

/**
 * Logger function for Gemini API calls
 * Can be imported and used wherever Gemini API is being used
 */
export function logGeminiAPICall(context: string): void {
  console.log(`🌐 [GEMINI API] ${context}`);
}

// Create the AI instance
export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      // Genkit 1.0.x doesn't know newer models by default, so register it explicitly
      models: ['gemini-3.5-flash'],
    }),
  ],
  model: 'googleai/gemini-3.5-flash',
});
