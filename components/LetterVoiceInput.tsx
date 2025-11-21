'use client';

import { useState, useRef, useEffect } from 'react';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

interface LetterVoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function LetterVoiceInput({ onTranscription, disabled }: LetterVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const t = getTranslation(language);

  useEffect(() => {
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingTime(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(language === 'zh-TW' ? '無法開始錄音。請檢查麥克風權限。' : language === 'ja' ? '録音を開始できません。マイクの権限を確認してください。' : 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      onTranscription(data.text);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError(language === 'zh-TW' ? '語音轉文字失敗，請重試。' : language === 'ja' ? '音声の文字変換に失敗しました。もう一度お試しください。' : 'Failed to transcribe audio. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={disabled || isRecording}
        className={`
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-accent hover:bg-accent-dark'
          }
          text-white font-medium py-4 px-8 rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-3 text-lg
          shadow-lg
        `}
      >
        {isRecording ? (
          <>
            <span className="w-4 h-4 bg-white rounded-full animate-pulse"></span>
            <span>{t.recording} {formatTime(recordingTime)}</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>{t.holdToSpeak}</span>
          </>
        )}
      </button>
      {isRecording && (
        <p className="text-sm text-wood-600">{t.releaseToStop}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

