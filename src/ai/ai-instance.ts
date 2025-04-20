// Import using require as a workaround
const genkit = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');

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
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
