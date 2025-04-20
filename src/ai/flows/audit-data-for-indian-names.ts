// Audit Indian names in a dataset.

'use server';

import {ai, logGeminiAPICall} from '@/ai/ai-instance';
import {validateIndianName, batchValidateIndianNames} from '@/services/indian-name-validator-server';
import {z} from 'zod';

const AuditDataForIndianNamesInputSchema = z.object({
  data: z
    .array(z.record(z.string()))
    .describe('An array of data records, where each record is a map of string to string.'),
});
export type AuditDataForIndianNamesInput = z.infer<typeof AuditDataForIndianNamesInputSchema>;

const AuditDataForIndianNamesOutputSchema = z.object({
  anomalies: z.array(
    z.object({
      row: z.number().describe('The row number where the anomaly was found.'),
      column: z.string().describe('The column name where the anomaly was found.'),
      value: z.string().describe('The value that was flagged as an anomaly.'),
      message: z.string().describe('The reason why the value was flagged as an anomaly.'),
      suggestion: z.string().optional().describe('A suggested correction for the anomaly.'),
    })
  ),
});
export type AuditDataForIndianNamesOutput = z.infer<typeof AuditDataForIndianNamesOutputSchema>;

export async function auditDataForIndianNames(
  input: AuditDataForIndianNamesInput
): Promise<AuditDataForIndianNamesOutput> {
  console.log("[SERVER] 🤖 Calling Gemini API for auditDataForIndianNames flow");
  logGeminiAPICall(`Starting auditDataForIndianNames flow with ${input.data.length} records`);
  
  const result = await auditDataForIndianNamesFlow(input);
  
  console.log("[SERVER] 🤖 Gemini API call completed for auditDataForIndianNames flow");
  logGeminiAPICall(`Completed auditDataForIndianNames flow with ${result.anomalies.length} anomalies`);
  
  return result;
}

const auditDataForIndianNamesFlow = ai.defineFlow(
  {
    name: 'auditDataForIndianNamesFlow',
    inputSchema: AuditDataForIndianNamesInputSchema,
    outputSchema: AuditDataForIndianNamesOutputSchema,
  },
  async input => {
    console.log("[SERVER] 🤖 Starting Gemini API flow execution");
    logGeminiAPICall(`Executing AI flow for data auditing - processing data`);
    
    const anomalies: AuditDataForIndianNamesOutput['anomalies'] = [];

    // Define the name columns to check
    const firstNameColumn = 'Accused First Name';
    const lastNameColumn = 'Accused Last Name';
    const inspectorColumn = 'Inspector In charge';
    
    // Extract all names from each column
    const firstNames: string[] = [];
    const lastNames: string[] = [];
    const inspectorNames: string[] = [];
    
    // Map row indices to keep track of original positions
    const firstNameIndices: number[] = [];
    const lastNameIndices: number[] = [];
    const inspectorIndices: number[] = [];
    
    // Collect all names and their row indices
    for (let i = 0; i < input.data.length; i++) {
      const row = input.data[i];
      
      if (row[firstNameColumn]?.trim()) {
        firstNames.push(row[firstNameColumn]);
        firstNameIndices.push(i);
      }
      
      if (row[lastNameColumn]?.trim()) {
        lastNames.push(row[lastNameColumn]);
        lastNameIndices.push(i);
      }
      
      if (row[inspectorColumn]?.trim()) {
        inspectorNames.push(row[inspectorColumn]);
        inspectorIndices.push(i);
      }
    }
    
    // Process first names and last names in batches
    try {
      console.log(`Processing ${firstNames.length} first names and ${lastNames.length} last names`);
      logGeminiAPICall(`Validating ${firstNames.length} first names and ${lastNames.length} last names`);
      
      const nameValidationResults = await batchValidateIndianNames(
        firstNames, 
        lastNames
      );
      
      const { firstNameCorrections, lastNameCorrections } = nameValidationResults;
      
      // Process first name corrections
      for (let i = 0; i < firstNameCorrections.length; i++) {
        const correction = firstNameCorrections[i];
        if (correction.needsCorrection) {
          anomalies.push({
            row: firstNameIndices[i] + 1, // Convert to 1-indexed
            column: firstNameColumn,
            value: correction.original,
            message: correction.reason || 'Name requires correction',
            suggestion: correction.corrected,
          });
        }
      }
      
      // Process last name corrections
      for (let i = 0; i < lastNameCorrections.length; i++) {
        const correction = lastNameCorrections[i];
        if (correction.needsCorrection) {
          anomalies.push({
            row: lastNameIndices[i] + 1, // Convert to 1-indexed
            column: lastNameColumn,
            value: correction.original,
            message: correction.reason || 'Name requires correction',
            suggestion: correction.corrected,
          });
        }
      }
      
      // Process inspector names separately (not in batch)
      for (let i = 0; i < inspectorNames.length; i++) {
        const value = inspectorNames[i];
        console.log("value", value);
        const nameInfo = await validateIndianName(value);
        
        if (!nameInfo.isValid) {
          anomalies.push({
            row: inspectorIndices[i] + 1, // Convert to 1-indexed
            column: inspectorColumn,
            value: value,
            message: nameInfo.message || 'The value is potentially not a valid Indian name.',
            suggestion: nameInfo.suggestions && nameInfo.suggestions.length > 0 ? nameInfo.suggestions[0] : '',
          });
        }
      }
    } catch (error) {
      console.error("Error in batch name validation:", error);
      logGeminiAPICall(`Error during name validation: ${error instanceof Error ? error.message : String(error)}`);
      
      // Fallback to individual validation in case of batch error
      console.log("Falling back to individual name validation");
      for (let i = 0; i < input.data.length; i++) {
        const row = input.data[i];
        
        // Only check name columns
        const nameColumns = [firstNameColumn, lastNameColumn, inspectorColumn];
        
        for (const column of nameColumns) {
          if (Object.prototype.hasOwnProperty.call(row, column)) {
            const value = row[column];
            
            // Skip empty values
            if (!value || value.trim() === '') continue;
            
            console.log("value", value);
            const nameInfo = await validateIndianName(value);
            
            if (!nameInfo.isValid) {
              anomalies.push({
                row: i + 1,
                column: column,
                value: value,
                message: nameInfo.message || 'The value is potentially not a valid Indian name.',
                suggestion: nameInfo.suggestions && nameInfo.suggestions.length > 0 ? nameInfo.suggestions[0] : '',
              });
            }
          }
        }
      }
    }

    logGeminiAPICall(`AI flow completed - found ${anomalies.length} anomalies`);
    return {anomalies};
  }
);
