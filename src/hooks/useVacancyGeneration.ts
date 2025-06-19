import { useState } from 'react';
import { generateVacancyDescription } from '@/lib/openai';

export function useVacancyGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const generate = async (answers: string[]) => {
    setLoading(true);
    setError("");
    const { text, error } = await generateVacancyDescription(answers);
    setResult(text);
    if (error) setError(error);
    setLoading(false);
  };

  return { generate, loading, error, result };
} 