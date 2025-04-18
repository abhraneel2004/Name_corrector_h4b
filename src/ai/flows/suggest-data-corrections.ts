'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting corrections to Indian names.
 *
 * - suggestDataCorrections - A function that initiates the name correction suggestion process.
 * - SuggestDataCorrectionsInput - The input type for the suggestDataCorrections function, including the array of names.
 * - SuggestDataCorrectionsOutput - The return type for the suggestDataCorrections function, providing suggestions for name corrections.
 */

import {ai, logGeminiAPICall} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the name correction type
interface NameCorrection {
  originalName: string;
  suggestedName: string;
  hasCorrection: boolean;
  reason?: string;
}

const SuggestDataCorrectionsInputSchema = z.object({
  names: z.array(z.string()).describe('An array of Indian names to be validated and corrected.'),
});
export type SuggestDataCorrectionsInput = z.infer<typeof SuggestDataCorrectionsInputSchema>;

const SuggestDataCorrectionsOutputSchema = z.object({
  correctionResults: z.array(
    z.object({
      originalName: z.string().describe('The original name.'),
      suggestedName: z.string().describe('The suggested correction or original name if no correction needed.'),
      hasCorrection: z.boolean().describe('Whether a correction was made.'),
      reason: z.string().optional().describe('The reason for the correction.'),
    })
  ).describe('An array of name corrections with detailed information.')
});
export type SuggestDataCorrectionsOutput = z.infer<typeof SuggestDataCorrectionsOutputSchema>;

export async function suggestDataCorrections(input: SuggestDataCorrectionsInput): Promise<SuggestDataCorrectionsOutput> {
  try {
    logGeminiAPICall(`Starting name correction flow for ${input.names.length} names`);
    
    // Print input names to console
    console.log('📥 INPUT NAMES:', JSON.stringify(input.names, null, 2));
    
    // Convert the input array to a JSON string for the prompt
    const namesObject = {
      names: input.names
    };
    const namesJson = JSON.stringify(namesObject, null, 2);
    
    const result = await suggestDataCorrectionsFlow({
      namesJson
    });
    
    // Print output corrections to console
    console.log('📤 OUTPUT CORRECTIONS:', JSON.stringify(result.correctionResults, null, 2));
    
    logGeminiAPICall(`Completed name correction flow with ${result.correctionResults.length} results`);
    return result;
  } catch (error) {
    // Log the error but don't try to call toast here
    console.error('Error in name correction flow:', error);
    
    // Return a valid response with empty corrections
    return {
      correctionResults: []
    };
  }
}

const prompt = ai.definePrompt({
  name: 'suggestIndianNameCorrectionsPrompt',
  input: {
    schema: z.object({
      namesJson: z.string().describe('JSON string containing an array of Indian names.'),
    }),
  },
  output: {
    schema: z.object({
      correctionResults: z.array(
        z.object({
          originalName: z.string(),
          suggestedName: z.string(),
          hasCorrection: z.boolean(),
          reason: z.string().optional(),
        })
      ),
    }),
  },
  prompt: `You are an AI assistant specialized in Indian name validation and correction.

You are provided with a JSON string containing an array of Indian names. Your task is to:
1. Parse the JSON string into an object
2. For each name in the array, check if there are any spelling mistakes or formatting issues
3. Generate a correction if needed, keeping the cultural context of Indian names intact
4. Provide the reason for any correction made

Common issues with Indian names include:
- Incorrect capitalization (e.g., "rahul sharma" should be "Rahul Sharma")
- Missing spaces between first and last names
- Misspelled common Indian names
- Incorrect placement of syllables

IMPORTANT RULES:
- If the name is already correct, suggest the same name and set hasCorrection to false
- Always respect the cultural integrity of the name
- Look for common Indian first and last names as reference
- Maintain the same general structure of the name unless there's a clear error
- Do not change naming conventions across regions (South Indian vs North Indian naming patterns)

Input JSON:
{{{namesJson}}}

Please provide your analysis and corrections in the following JSON format:
{
  "correctionResults": [
    {
      "originalName": "original name",
      "suggestedName": "corrected name",
      "hasCorrection": true/false,
      "reason": "explanation for correction (if applicable)"
    },
    ...
  ]
}
`,
});

const suggestDataCorrectionsFlowSchema = z.object({
  namesJson: z.string().describe('JSON string containing an array of Indian names.'),
});

const suggestDataCorrectionsFlow = ai.defineFlow<
  typeof suggestDataCorrectionsFlowSchema,
  typeof SuggestDataCorrectionsOutputSchema
>(
  {
    name: 'suggestDataCorrectionsFlow',
    inputSchema: suggestDataCorrectionsFlowSchema,
    outputSchema: SuggestDataCorrectionsOutputSchema,
  },
  async input => {
    logGeminiAPICall(`Processing names through Gemini API`);
    console.log('🔄 PROCESSING: Sending input to Gemini API:', input.namesJson);
    
    const {output} = await prompt(input);
    
    console.log('✅ RECEIVED: Response from Gemini API:', JSON.stringify(output, null, 2));
    return output!;
  }
);
