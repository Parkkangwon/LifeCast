import { useState, useRef, useCallback } from 'react';
import { handleError } from '@/lib/utils';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal?: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export const useSpeechRecognition = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      const errorMsg = '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해 주세요.';
      setError(errorMsg);
      handleError(errorMsg, 'Speech Recognition', true);
      return false;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'ko-KR';

      recognition.onstart = () => {
        setIsRecording(true);
        setError(null);
        console.log('음성 인식이 시작되었습니다.');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setTranscript(transcript);
        console.log('음성 인식 결과:', transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('음성 인식 오류:', event.error);
        setIsRecording(false);
        
        let errorMessage = '음성 인식 중 오류가 발생했습니다.';
        if (event.error === 'no-speech') {
          errorMessage = '음성이 감지되지 않았습니다. 다시 시도해주세요.';
        }
        
        setError(errorMessage);
        handleError(errorMessage, 'Speech Recognition', true);
      };

      recognition.onend = () => {
        setIsRecording(false);
        console.log('음성 인식이 종료되었습니다.');
      };

      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      const errorMsg = '음성 인식을 초기화할 수 없습니다.';
      setError(errorMsg);
      handleError(error, 'Speech Recognition Initialization', true);
      return false;
    }
  }, []);

  const startRecording = useCallback((onResult?: (transcript: string) => void) => {
    if (!recognitionRef.current) {
      if (!initializeSpeechRecognition()) {
        return false;
      }
    }

    try {
      if (onResult) {
        recognitionRef.current!.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setTranscript(transcript);
          onResult(transcript);
        };
      }

      recognitionRef.current!.start();
      return true;
    } catch (error) {
      const errorMsg = '음성 인식을 시작할 수 없습니다. 다시 시도해 주세요.';
      setError(errorMsg);
      handleError(error, 'Speech Recognition Start', true);
      return false;
    }
  }, [initializeSpeechRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    resetTranscript,
    initializeSpeechRecognition
  };
}; 