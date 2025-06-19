import { useRef, useState } from 'react';

export function useSpeechRecognition(onResult: (text: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const getRecognition = () => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SpeechRecognition) return null;
    return new SpeechRecognition();
  };

  const start = () => {
    if (isRecording) return;
    const recognition = getRecognition();
    if (!recognition) {
      alert('Ваш браузер не поддерживает распознавание речи (Web Speech API)');
      return;
    }
    recognition.lang = 'ru-RU';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stop = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return { isRecording, start, stop };
} 