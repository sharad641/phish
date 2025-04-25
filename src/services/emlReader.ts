/**
 * @fileOverview Service for reading and extracting content from .eml files.
 */

/**
 * Asynchronously reads and extracts content from an .eml file provided as a data URI.
 *
 * @param emlFileDataUri The .eml file as a data URI that must include a MIME type and use Base64 encoding.
 * @returns A promise that resolves to the text content of the email.
 * @throws Error if the file format is invalid or if reading the file fails.
 */
export async function readEmlFile(emlFileDataUri: string): Promise<string> {
  try {
    // Basic validation of the data URI format
    if (!emlFileDataUri.startsWith('data:') || !emlFileDataUri.includes(';base64,')) {
      throw new Error('Invalid data URI format for the .eml file.');
    }

    // Extract the base64 encoded data
    const base64String = emlFileDataUri.split(';base64,')[1];
    if (!base64String) {
      throw new Error('No base64 data found in the data URI.');
    }

    // Decode the base64 string to a UTF-8 string
    const decodedString = atob(base64String);

    // Further parsing of the email content can be added here
    // to extract specific parts like body, headers, etc.

    return decodedString;
  } catch (error: any) {
    console.error('Error reading .eml file:', error);
    throw new Error(`Failed to read .eml file: ${error.message}`);
  }
}
