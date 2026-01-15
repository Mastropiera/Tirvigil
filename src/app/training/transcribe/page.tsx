'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AudioPlayer from '@/components/AudioPlayer';
import TranscriptEditor from '@/components/TranscriptEditor';
import { useTrainingData } from '@/hooks/useTrainingData';
import type { TrainingPair } from '@/types/report';

export default function TranscribePage() {
  const { pairs, isLoaded, updatePair, getPendingPairs } = useTrainingData();
  const [pendingPairs, setPendingPairs] = useState<TrainingPair[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcripcion, setTranscripcion] = useState('');
  const [notas, setNotas] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      const pending = getPendingPairs();
      setPendingPairs(pending);
      if (pending.length > 0) {
        setTranscripcion(pending[0].transcripcion || '');
        setNotas(pending[0].notas || '');
      }
    }
  }, [isLoaded, pairs, getPendingPairs]);

  const currentPair = pendingPairs[currentIndex];

  const saveProgress = () => {
    if (!currentPair) return;
    updatePair(currentPair.id, {
      transcripcion,
      notas,
      status: 'en_progreso',
    });
  };

  const markAsComplete = () => {
    if (!currentPair) return;
    updatePair(currentPair.id, {
      transcripcion,
      notas,
      status: 'completado',
    });

    // Actualizar lista local
    const newPending = pendingPairs.filter(p => p.id !== currentPair.id);
    setPendingPairs(newPending);

    if (newPending.length > 0) {
      const nextIndex = Math.min(currentIndex, newPending.length - 1);
      setCurrentIndex(nextIndex);
      setTranscripcion(newPending[nextIndex]?.transcripcion || '');
      setNotas(newPending[nextIndex]?.notas || '');
    }
  };

  const goToNext = () => {
    saveProgress();
    if (currentIndex < pendingPairs.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTranscripcion(pendingPairs[nextIdx]?.transcripcion || '');
      setNotas(pendingPairs[nextIdx]?.notas || '');
    }
  };

  const goToPrevious = () => {
    saveProgress();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTranscripcion(pendingPairs[prevIdx]?.transcripcion || '');
      setNotas(pendingPairs[prevIdx]?.notas || '');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Empty state
  if (pendingPairs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <header className="bg-white py-4 px-4 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <img
              src="/tirvigil_header.png"
              alt="Tirvigil"
              className="flex-1 object-contain max-h-16"
            />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              No hay audios pendientes
            </p>
            <Link
              href="/training/upload"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Subir nuevos audios
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white py-4 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/" className="text-gray-500 hover:text-gray-700 flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <img
              src="/tirvigil_header.png"
              alt="Tirvigil"
              className="flex-1 object-contain max-h-16"
            />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-gray-500 text-sm">
              {currentIndex + 1}/{pendingPairs.length}
            </span>
            <button
              onClick={saveProgress}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full flex flex-col gap-4">
        {/* Info del audio */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow p-4 flex items-center justify-between">
          <div>
            <p className="text-gray-800 dark:text-gray-200 font-medium truncate">
              {currentPair?.audioFileName}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Duracion: {formatDuration(currentPair?.audioDuration || 0)}
            </p>
          </div>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`p-2 rounded-lg transition-colors ${
              showNotes
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            title="Notas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
        </div>

        {/* Reproductor de audio */}
        <AudioPlayer src={currentPair?.audioUrl || ''} />

        {/* Notas (colapsable) */}
        {showNotes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
            <label className="block text-yellow-800 dark:text-yellow-200 font-medium mb-2 text-sm">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agrega notas sobre este audio (dificultades, contexto, etc.)"
              className="w-full p-3 border border-yellow-300 dark:border-yellow-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none text-sm"
              rows={2}
            />
          </div>
        )}

        {/* Editor de transcripcion */}
        <div className="flex-1 flex flex-col">
          <label className="block text-gray-700 dark:text-gray-200 font-medium mb-2">
            Transcripcion
          </label>
          <TranscriptEditor
            value={transcripcion}
            onChange={setTranscripcion}
            placeholder="Escribe aqui la transcripcion del audio..."
            className="flex-1"
            autoFocus
          />
        </div>

        {/* Botones de navegacion */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={markAsComplete}
            disabled={!transcripcion.trim()}
            className="flex-[2] py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
          >
            Completar
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === pendingPairs.length - 1}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </main>
    </div>
  );
}
