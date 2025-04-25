'use server';

/**
 * @fileOverview Analyzes email or message content and images for potential phishing indicators.
 *
 * - analyzePhishingIndicators - A function that analyzes text and images for phishing indicators.
 * - AnalyzePhishingIndicatorsInput - The input type for the analyzePhishingIndicators function.
 * - AnalyzePhishingIndicatorsOutput - The return type for the analyzePhishingIndicators function.
 */

import {ai} from '@/ai/ai-instance';
import {scanURL} from '@/services/urlscan';
import {z} from 'genkit';

const AnalyzePhishingIndicatorsInputSchema = z.object({
  text: z.string().describe('The email or message content to analyze.').optional(),
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .optional(),
});

export type AnalyzePhishingIndicatorsInput = z.infer<
  typeof AnalyzePhishingIndicatorsInputSchema
>;

const AnalyzePhishingIndicatorsOutputSchema = z.object({
  isPhishing: z.boolean().describe('Whether the content is likely a phishing attempt.'),
  indicators: z
    .array(z.string())
    .describe('Specific indicators found in the content.'),
  safetyScore: z
    .number()
    .describe('A score from 0 to 1 indicating the safety of the content.'),
  explanation: z.string().describe('An explanation of why the content is phishing.'),
});

export type AnalyzePhishingIndicatorsOutput = z.infer<
  typeof AnalyzePhishingIndicatorsOutputSchema
>;

export async function analyzePhishingIndicators(
  input: AnalyzePhishingIndicatorsInput
): Promise<AnalyzePhishingIndicatorsOutput> {
  try {
    return await analyzePhishingIndicatorsFlow(input);
  } catch (error) {
    console.error("Error in analyzePhishingIndicators:", error);
    throw new Error("Failed to analyze content. Please try again.");
  }
}

const analyzeURLTool = ai.defineTool({
  name: 'scanURL',
  description:
    'Scans a URL to determine if it is safe. Use this to determine if any URLs found in the text are malicious.',
  inputSchema: z.object({
    url: z.string().describe('The URL to scan.'),
  }),
  outputSchema: z.object({
    isSafe: z.boolean().describe('Whether the URL is considered safe.'),
    message: z.string().describe('A message providing more details about the scan result.'),
  }),
});

const prompt = ai.definePrompt({
  name: 'analyzePhishingIndicatorsPrompt',
  input: {
    schema: z.object({
      text: z.string().describe('The email or message content to analyze.').optional(),
      photoDataUri: z
        .string()
        .describe(
          "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
        .optional(),
    }),
  },
  output: {
    schema: z.object({
      isPhishing: z
        .boolean()
        .describe('Whether the content is likely a phishing attempt.'),
      indicators: z
        .array(z.string())
        .describe('Specific indicators found in the content.'),
      safetyScore: z
        .number()
        .describe('A score from 0 to 1 indicating the safety of the content.'),
      explanation: z.string().describe('An explanation of why the content is phishing.'),
    }),
  },
  prompt: `You are an AI assistant specializing in detecting phishing attempts.

Analyze the following text and image (if available) for potential phishing indicators, such as suspicious keywords, urgency cues, unusual formatting, and deceptive imagery. Also, if there are any URLs, use the scanURL tool to determine if the URLs are safe.

Text: {{{text}}}
{{#if photoDataUri}}
Image: {{media url=photoDataUri}}
{{/if}}

Based on your analysis, determine if the content is likely a phishing attempt. Provide a safety score between 0 and 1, where 0 is definitely phishing and 1 is definitely safe. Explain your reasoning.

Output the isPhishing boolean, a list of indicators, the safetyScore and the explanation.
`,
  tools: [analyzeURLTool],
});

const analyzePhishingIndicatorsFlow = ai.defineFlow<
  typeof AnalyzePhishingIndicatorsInputSchema,
  typeof AnalyzePhishingIndicatorsOutputSchema
>(
  {
    name: 'analyzePhishingIndicatorsFlow',
    inputSchema: AnalyzePhishingIndicatorsInputSchema,
    outputSchema: AnalyzePhishingIndicatorsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Error in analyzePhishingIndicatorsFlow:", error);
      throw new Error("Failed to analyze content in flow. Please try again.");
    }
  }
);
