'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting corrections to Indian names.
 *
 * - suggestDataCorrections - A function that initiates the name correction suggestion process.
 * - SuggestDataCorrectionsInput - The input type for the suggestDataCorrections function, including the array of names.
 * - SuggestDataCorrectionsOutput - The return type for the suggestDataCorrections function, providing suggestions for name corrections.
 */

import {ai, logGeminiAPICall} from '@/ai/ai-instance';
import {z} from 'zod';

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

Wrong Names Example:
    "Mohammed Shiv", // Mixing Muslim and Hindu names
    "Mohammed Singh", // Mixing Muslim and Sikh names
    "Arjun Patel-Singh", // Mixing Gujarati and Sikh surnames
    "Mohammed Sharma", // Muslim first name with Hindu Brahmin surname
    "Lakshmi Khan", // Hindu goddess name with Muslim surname
    "Gurpreet Iyer", // Sikh first name with South Indian surname
    "Raj O'Malley", // Indian first name with Irish surname
    "Samir Nakamura", // Arab/Indian first name with Japanese surname
    "Indira Zhang", // Indian first name with Chinese surname
    "Vikram Cohen", // Indian first name with Jewish surname
    "Sanjay McDonald", // Indian first name with Scottish surname
    "Ananya Kowalski", // Indian first name with Polish surname
    "Nikhil Suzuki", // Indian first name with Japanese surname
    "Priya Rossi", // Indian first name with Italian surname
    "Rahul von Schmidt", // Indian first name with German surname
    "Deepika Papadopoulos", // Indian first name with Greek surname
    "Amit Rodriguez", // Indian first name with Hispanic surname
    "Kiran O'Brien", // Indian first name with Irish surname
    "Aditya Kim", // Indian first name with Korean surname
    "Simran Dubois", // Sikh first name with French surname
    "Rohan Svensson", // Indian first name with Swedish surname
    "Neha Kowalczyk", // Indian first name with Polish surname
    "Sikh Brahmin", // Religious identity used as name with caste as surname
    "Hindu Muslim", // Religious identities used as name and surname
    "South North", // Directional terms used as names
    "Punjabi Bengali", // Regional identities used as names
    "Rajesh McGupta", // Mixed Western-Indian surname with prefix
    "Abdul Chatterjee", // Muslim first name with Bengali Hindu surname
    "Krishna Qureshi", // Hindu deity name with Muslim surname
    "Sikh Iyer", // Religious identity with South Indian Brahmin surname
    "Fatima Joshi", // Muslim first name with Hindu surname
    "Jesus Singh", // Christian first name with Sikh surname
    "Gurpreet Mukherjee", // Sikh first name with Bengali Hindu surname
    "Buddha Patel", // Religious figure with Gujarati surname
    "Maharashtra Karnataka", // Indian states used as names
    "Sundar Gandhi-Nehru", // Hyphenated historically significant surnames
    "Tamil Telugu", // Language groups used as names
    "Parvati Muhammad", // Hindu goddess name with Muslim male name as surname
    "Bismillah Rao", // Islamic phrase with South Indian Hindu suffix
    "Aryan Dravidian", // Ancient racial classifications used as names
    "Jain Buddhist", // Religious identities used as names
    "Veda Quran", // Religious texts used as names
    "Ganesh Christ", // Religious figures used as names
    "Delhi Mumbai", // City names used as names
    "Chapati Biryani", // Food items used as names
    "Himalaya Rajput", // Geographical feature with caste name
    "Sari Kurta", // Clothing items used as names
    "Rupee Dollar", // Currency names used as names
    "Brahma Mohammed", // Hindu god with Muslim prophet name
    "Punjabi Sharma", // Regional identity with caste surname
    "Navratri Ramadan", // Festival names used as names
    "Yoga Namaz", // Religious practices used as names
    "Om Allah", // Religious symbols/terms from different religions
    "Shiva Jesus", // Religious figures from different religions
    "Ganga Thames", // River names from different countries
    "Bollywood Hollywood", // Film industries used as names
    "Taj Mahal Empire", // Monument with political term
    "Sitar Guitar", // Musical instruments used as names
    "Karma Hajj", // Religious concepts from different traditions
    "Ayurvedic Halal", // Medical system with religious dietary term
    "Sati Jihad", // Religious practices from different traditions
    "Pandit Sheikh", // Religious titles from different traditions
    "Swami Rabbi", // Religious titles from different traditions
    "Dharma Sharia", // Religious concepts from different traditions
    "Vishnu Mohammad", // Hindu god with Muslim name
    "Krishna Pastor", // Hindu deity with Christian religious title
    "Ravi Abdullah", // Hindu name with Muslim name
    "Suresh Ben Patel", // Hindu name with Jewish prefix
    "Manu Darwin", // Hindu lawgiver with Western scientist surname
    "Vedic Einstein", // Religious adjective with Western surname
    "Ramayan Bible", // Religious texts used as names
    "Mosque Temple", // Religious buildings used as names
    "Ganesha Cardinal", // Hindu deity with Catholic religious title
    "Prasad Communion", // Hindu religious offering with Christian sacrament
    "Bharat America", // Country names used as names
    "Gurmeet von Chatterjee", // Sikh name with German nobility prefix and Bengali surname
    "Fatima O'Sharma", // Muslim first name with Irish-Hindu hybrid surname
    "Abdullah Das Gupta", // Muslim name with Bengali Hindu surname
    "Pope Shankaracharya", // Catholic and Hindu religious titles
    "Ayatollah Swami", // Shia Muslim and Hindu religious titles
    "Zakir Nataraj", // Muslim name with Hindu god of dance
    "Rishi Mullah", // Hindu sage title with Muslim religious title
    "Vande Mataram Khan", // Indian national song with Muslim surname
    "Jihad Ahimsa", // Islamic struggle concept with Hindu non-violence concept
    "Namaste Salaam", // Hindu and Muslim greetings used as names
    "Shakti Power", // Sanskrit word with English translation as surname
    "Madrasa Gurukul", // Islamic and Hindu educational institutions
    "Bhagavad Quran", // Hindu text with part of Islamic text title
    "Mohammed Brahmaputra", // Muslim name with Indian river
    "Abdul Ganga", // Muslim name with Hindu sacred river
    "Ali Hanuman", // Muslim name with Hindu deity
    "Guru Mecca", // Sikh religious title with Islamic holy city
    "Varanasi Jeddah", // Hindu and Muslim holy cities
    "Bajrangi Sultan", // Hindu deity epithet with Muslim royal title
    "Lotus Crescent", // Hindu and Muslim religious symbols
    "Amrit Zamzam", // Sikh holy water with Islamic holy water
    "Bhindranwale Gandhi", // Controversial Sikh figure with iconic Indian surname
    "Jinnah Nehru", // Pakistani and Indian political leaders
    "Ram Rahim Khan", // Hindu deity with Muslim prophet and surname
    "Nanak Mohammed", // Sikh guru with Muslim prophet name
    "Bharat Pakistan", // Country names used as name and surname
    "Modi Bhutto" 

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

const suggestDataCorrectionsFlow = ai.defineFlow(
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
