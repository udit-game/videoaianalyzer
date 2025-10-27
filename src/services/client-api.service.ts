import { FeedbackResponse } from '@/types/analysis';

/**
 * Executes the client-side API call to the Next.js Route Handler.
 * This abstracts away the fetch details from the component.
 */
export async function processCall(audioFile: File): Promise<FeedbackResponse> {
  const formData = new FormData();
  formData.append('audioFile', audioFile);

  // 1. Execute the fetch/network call
  const response = await fetch('/api/analyze-call', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    // 2. Custom error handling logic
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.error || `HTTP error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  // 3. Parse and return structured data
  const data: FeedbackResponse = await response.json();
  return data;
}