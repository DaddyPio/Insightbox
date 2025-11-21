'use client';

import { useState, useRef, useEffect } from 'react';
import { getStoredLanguage } from '@/lib/utils/languageContext';
import { getTranslation, type AppLanguage } from '@/lib/utils/translations';

interface SpeechToTextButtonProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export default function SpeechToTextButton({ onTranscription, disabled }: SpeechToTextButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage() || 'en');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const t = getTranslation(language);

  useEffect(() => {
    const onLang = () => setLanguage(getStoredLanguage() || 'en');
    window.addEventListener('languageChanged', onLang);
    return () => window.removeEventListener('languageChanged', onLang);
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setTranscriptionComplete(false);
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
      };

      mediaRecorder.start();
      setIsRecording(true);
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
      setTranscriptionComplete(true);
      setTimeout(() => setTranscriptionComplete(false), 5000);
    } catch (err) {
      console.error('Error transcribing audio:', err);
      setError(language === 'zh-TW' ? '語音轉文字失敗，請重試。' : language === 'ja' ? '音声の文字変換に失敗しました。もう一度お試しください。' : 'Failed to transcribe audio. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {isRecording && (
        <p className="text-sm text-wood-600">{t.recordingHint}</p>
      )}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-accent hover:bg-accent-dark'
          }
          text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center space-x-2
        `}
      >
        {isRecording ? (
          <>
            <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
            <span>{t.stopRecording}</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>{t.recordVoice}</span>
          </>
        )}
      </button>
      {transcriptionComplete && (
        <p className="text-sm text-green-600">{t.transcriptionComplete}</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
