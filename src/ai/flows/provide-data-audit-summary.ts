'use server';
/**
 * @fileOverview Summarizes potential data quality issues after an audit.
 *
 * - provideDataAuditSummary - A function that provides a textual summary of potential data issues.
 * - ProvideDataAuditSummaryInput - The input type for the provideDataAuditSummary function.
 * - ProvideDataAuditSummaryOutput - The return type for the provideDataAuditSummary function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'zod';

const ProvideDataAuditSummaryInputSchema = z.object({
  auditResults: z.string().describe('The detailed results from the data audit.'),
});
export type ProvideDataAuditSummaryInput = z.infer<typeof ProvideDataAuditSummaryInputSchema>;

const ProvideDataAuditSummaryOutputSchema = z.object({
  summary: z.string().describe('A textual summary of the potential data quality issues.'),
});
export type ProvideDataAuditSummaryOutput = z.infer<typeof ProvideDataAuditSummaryOutputSchema>;

export async function provideDataAuditSummary(input: ProvideDataAuditSummaryInput): Promise<ProvideDataAuditSummaryOutput> {
  return provideDataAuditSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideDataAuditSummaryPrompt',
  input: {
    schema: z.object({
      auditResults: z.string().describe('The detailed results from the data audit.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('A textual summary of the potential data quality issues.'),
    }),
  },
  prompt: `You are an AI assistant who summarizes data audit results.

  Given the following data audit results, provide a concise textual summary of the potential data quality issues identified. Focus on the key findings and potential implications for data accuracy and reliability.
  \n  Audit Results: {{{auditResults}}}
  \n  Summary: `,
});

const provideDataAuditSummaryFlow = ai.defineFlow(
  {
    name: 'provideDataAuditSummaryFlow',
    inputSchema: ProvideDataAuditSummaryInputSchema,
    outputSchema: ProvideDataAuditSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
