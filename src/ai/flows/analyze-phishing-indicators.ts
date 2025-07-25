'use server';

/**
 * @fileOverview Analyzes email or message content and images for potential phishing indicators.
 *
 * - analyzePhishingIndicators - A function that analyzes text and images for phishing indicators.
 * - AnalyzePhishingIndicatorsInput - The input type for the analyzePhishingIndicators function.
 * - AnalyzePhishingIndicatorsOutput - The return type for the AnalyzePhishingIndicators function.
 */

import {ai} from '@/ai/ai-instance';
import {scanURL} from '@/services/urlscan';
import {z} from 'genkit';
import {readEmlFile} from '@/services/emlReader';
import {extractTextFromImage} from '@/services/ocrService';

const AnalyzePhishingIndicatorsInputSchema = z.object({
  text: z.string().describe('The email or message content to analyze.').optional(),
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .nullable()
    .optional(),
  emlFileDataUri: z
    .string()
    .describe(
      "An .eml email file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .nullable()
    .optional(),
});

export type AnalyzePhishingIndicatorsInput = z.infer<
  typeof AnalyzePhishingIndicatorsInputSchema
>;

const AnalyzePhishingIndicatorsOutputSchema = z.object({
  isPhishing: z.boolean().describe('Whether the content is likely a phishing attempt.'),
  indicators: z
    .array(z.string())
    .describe('Specific indicators found in the content, such as urgency cues, suspicious domains, emotional language, and spoof indicators.'),
  safetyScore: z
    .number()
    .describe('A score from 0 to 1 indicating the safety of the content.'),
  explanation: z.string().describe('An explanation of why the content is phishing.'),
  threatLevel: z
    .enum(['Safe', 'Suspicious', 'Dangerous'])
    .describe('A threat level indicating the overall risk associated with the content.'),
  riskFactors: z
    .array(z.string())
    .describe('Specific risk factors detected in the content, such as urgency words, suspicious domains, emotional language, and spoof indicators.'),
});

export type AnalyzePhishingIndicatorsOutput = z.infer<
  typeof AnalyzePhishingIndicatorsOutputSchema
>;

export async function analyzePhishingIndicators(
  input: AnalyzePhishingIndicatorsInput
): Promise<AnalyzePhishingIndicatorsOutput> {
  try {
    // Check if all content inputs are empty
    if (!input.text && !input.photoDataUri && !input.emlFileDataUri) {
      return {
        isPhishing: false,
        indicators: [],
        safetyScore: 1,
        explanation: 'No content provided for analysis.',
        threatLevel: 'Safe',
        riskFactors: [],
      };
    }

    let extractedText = input.text || '';

    // If an image is provided, extract text using OCR
    if (input.photoDataUri) {
      const ocrText = await extractTextFromImage(input.photoDataUri);
      extractedText += `\nImage Text: ${ocrText}`;
    }

    // If an EML file is provided, parse it and scan the body + headers
    if (input.emlFileDataUri) {
      const emlContent = await readEmlFile(input.emlFileDataUri);
      extractedText += `\nEmail Content: ${emlContent}`;
    }

    // Enrich the input with extracted text
    const enrichedInput = { ...input, text: extractedText };

    const result = await analyzePhishingIndicatorsFlow(enrichedInput);

    // Ensure default values are set if the LLM doesn't provide them
    return {
      isPhishing: result.isPhishing ?? false,
      indicators: result.indicators ?? [],
      safetyScore: result.safetyScore ?? 1,
      explanation: result.explanation ?? 'No explanation provided.',
      threatLevel: result.threatLevel ?? 'Safe',
      riskFactors: result.riskFactors ?? [],
    };
  } catch (error: any) {
    console.error('Error in analyzePhishingIndicators:', error);
    let errorMessage = 'Failed to analyze content. Please try again.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new Error(errorMessage);
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
        .nullable()
        .optional(),
      emlFileDataUri: z
        .string()
        .describe(
          "An .eml email file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
        .nullable()
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
        .describe('Specific indicators found in the content, such as urgency cues, suspicious domains, emotional language, and spoof indicators.'),
      safetyScore: z
        .number()
        .describe('A score from 0 to 1 indicating the safety of the content.'),
      explanation: z.string().describe('An explanation of why the content is phishing.'),
      threatLevel: z
        .enum(['Safe', 'Suspicious', 'Dangerous'])
        .describe('A threat level indicating the overall risk associated with the content.'),
      riskFactors: z
        .array(z.string())
        .describe('Specific risk factors detected in the content, such as urgency words, suspicious domains, emotional language, and spoof indicators.'),
    }),
  },
  prompt: `You are an AI assistant specializing in detecting phishing attempts and social engineering tactics.

Analyze the following content for potential phishing indicators. Identify and list specific risk factors such as:
- Urgency cues (e.g., "act immediately", "urgent action required")
- Suspicious domains (e.g., unusual or misspelled URLs)
- Emotional language (e.g., threats, promises of reward, appeals to fear or sympathy)
- Spoof indicators (e.g., mismatched sender information, generic greetings)
- Unusual requests (e.g., requests for personal information, financial details, or account credentials)
- Grammatical errors or typos (which are common in phishing attempts)

For any URLs found, use the scanURL tool to determine if they are safe. Always check the URL safety before determining if the content is phishing.

Based on your analysis, determine if the content is likely a phishing attempt and provide a safety score between 0 and 1, where 0 is definitely phishing and 1 is definitely safe. Also, provide a threat level as Safe, Suspicious, or Dangerous. Explain your reasoning in detail.

Pay close attention to requests for account information, passwords, or financial transactions. These are strong indicators of phishing.

{{#if text}}
Text: {{{text}}}
{{else}}
No text provided.
{{/if}}

{{#if photoDataUri}}
Image: {{media url=photoDataUri}}
{{else}}
No image provided.
{{/if}}

{{#if emlFileDataUri}}
Email File: {{emlFileDataUri}}
{{else}}
No email file provided.
{{/if}}

Output the isPhishing boolean, a list of indicators, the safetyScore, threatLevel, riskFactors, and the explanation.
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
      if (!output) {
        return {
          isPhishing: true, // Treat as phishing if no analysis could be performed
          indicators: ['No analysis performed'],
          safetyScore: 0.2, // Low safety score
          explanation: 'No analysis could be performed, possibly due to technical issues. Treat with extreme caution.',
          threatLevel: 'Dangerous',
          riskFactors: ['Technical failure'],
        };
      }
      return output!;
    } catch (error: any) {
      console.error('Error in analyzePhishingIndicatorsFlow:', error);
      return {
        isPhishing: true, // Treat as phishing on error
        indicators: ['Analysis failed'],
        safetyScore: 0.1, // Very low safety score
        explanation: 'Failed to analyze content in flow. Please treat as potentially dangerous.',
        threatLevel: 'Dangerous',
        riskFactors: ['Technical failure'],
      };
    }
  }
);
