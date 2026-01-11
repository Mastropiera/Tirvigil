'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  className?: string;
}

export default function AudioRecorder({
  onRecordingComplete,
  onRecordingStart,
  className = '',
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Analizar nivel de audio
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setAudioLevel(average / 255);

    if (isRecording && !isPaused) {
      animationRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Configurar analizador de audio
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Configurar grabador
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        onRecordingComplete(audioBlob, duration);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Guardar datos cada segundo

      setIsRecording(true);
      setIsPaused(false);
      setPermissionDenied(false);
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      // Iniciar timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current - pausedDurationRef.current;
        setDuration(Math.floor(elapsed / 1000));
      }, 100);

      // Iniciar analisis de audio
      analyzeAudio();

      onRecordingStart?.();
    } catch (error) {
      console.error('Error al acceder al microfono:', error);
      setPermissionDenied(true);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimeRef.current = Date.now() - (duration * 1000);
        analyzeAudio();
      } else {
        mediaRecorderRef.current.pause();
        pausedDurationRef.current += Date.now() - startTimeRef.current - (duration * 1000);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
  };

  const cancelRecording = () => {
    audioChunksRef.current = [];
    stopRecording();
    setDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center ${className}`}>
        <svg className="w-12 h-12 mx-auto text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-700 dark:text-red-300 mb-3">
          No se pudo acceder al microfono
        </p>
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 ${className}`}>
      {/* Visualizador de audio */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          {/* Circulo de fondo */}
          <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-600" />

          {/* Indicador de nivel */}
          {isRecording && (
            <div
              className="absolute inset-0 rounded-full bg-red-500/20 transition-transform duration-75"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
            />
          )}

          {/* Boton central */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`absolute inset-4 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white shadow-lg`}
          >
            {isRecording ? (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Duracion */}
      <div className="text-center mb-4">
        <span className={`text-3xl font-mono ${isRecording ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
          {formatTime(duration)}
        </span>
        {isRecording && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-500">
              {isPaused ? 'Pausado' : 'Grabando'}
            </span>
          </div>
        )}
      </div>

      {/* Controles adicionales */}
      {isRecording && (
        <div className="flex justify-center gap-4">
          <button
            onClick={pauseRecording}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors flex items-center gap-2"
          >
            {isPaused ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Continuar
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pausar
              </>
            )}
          </button>
          <button
            onClick={cancelRecording}
            className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
        </div>
      )}

      {/* Instrucciones */}
      {!isRecording && (
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
          Presiona el boton para comenzar a grabar
        </p>
      )}
    </div>
  );
}
