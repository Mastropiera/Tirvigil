'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AudioRecorder from '@/components/AudioRecorder';

export default function RecordPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Guardar el audio en sessionStorage para la pagina de revision
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        sessionStorage.setItem('pendingAudio', JSON.stringify({
          data: base64Audio,
          duration,
          type: audioBlob.type,
          timestamp: Date.now(),
        }));
        router.push('/review');
      };
      reader.readAsDataURL(audioBlob);
    } catch (err) {
      setError('Error al procesar la grabacion');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-blue-800 text-white py-4 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-blue-200 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Grabar Informe</h1>
            <p className="text-blue-200 text-sm">Dicta tu informe anatomopatologico</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Instrucciones */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <h2 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Comandos de voz disponibles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <div><strong>examen macroscopico</strong> - ir a seccion</div>
            <div><strong>conclusion</strong> - ir a seccion</div>
            <div><strong>comentarios</strong> - ir a seccion</div>
            <div><strong>punto, coma</strong> - puntuacion</div>
            <div><strong>nueva linea</strong> - salto</div>
            <div><strong>abrir/cerrar negritas</strong> - formato</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Grabador */}
        {isProcessing ? (
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Procesando grabacion...</p>
          </div>
        ) : (
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        )}

        {/* Alternativa: subir archivo */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">o</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Subir archivo de audio existente
          </Link>
        </div>
      </main>
    </div>
  );
}
