import { useState, useCallback } from 'react';
import { processCall} from '@/services/client-api.service';
import {FeedbackResponse} from "@/types/analysis";

interface UseProcessCallReturn {
  results: FeedbackResponse | null;
  isProcessing: boolean;
  error: string | null;
  executeProcess: () => Promise<void>;
}

export const useProcessCall = (audioFile: File | null): UseProcessCallReturn => {
  const [results, setResults] = useState<FeedbackResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeProcess = useCallback(async () => {
    // 1. Validation check
    if (!audioFile) {
      setError("Please select an audio file to begin the process.");
      setResults(null);
      return;
    }

    const acceptedTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav'];
    if (!acceptedTypes.includes(audioFile.type)) {
      setError(`Invalid file type. Please select a .mp3 or .wav file. (Detected: ${audioFile.type})`);
      setResults(null);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResults(null);

    try {
      const data = await processCall(audioFile);
      setResults(data);
    } catch (err) {
      console.error("API Call Error:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(`Processing failed: ${errorMessage}`);
      setResults(null);
    } finally {
      setIsProcessing(false);
    }
  }, [audioFile]);

  return { results, isProcessing, error, executeProcess };
};