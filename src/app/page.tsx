'use client';

import Link from 'next/link';
import { useTrainingData } from '@/hooks/useTrainingData';

export default function Home() {
  const { pairs, isLoaded, getStats } = useTrainingData();
  const stats = getStats();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 pt-6 px-4">
        <div className="max-w-4xl mx-auto">
          <img
            src="/tirvigil_header.png"
            alt="Tirvigil"
            className="w-full object-contain max-h-32"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Seccion principal: Crear informe */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Crear nuevo informe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/record"
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-8 shadow-lg transition-all hover:scale-[1.02]"
            >
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-lg font-semibold">Grabar Dictado</span>
              <span className="text-blue-200 text-sm mt-1 text-center">
                Dicta tu informe en tiempo real
              </span>
            </Link>

            <Link
              href="/upload"
              className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl p-8 shadow-lg transition-all hover:scale-[1.02]"
            >
              <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-lg font-semibold">Subir Audio</span>
              <span className="text-purple-200 text-sm mt-1 text-center">
                Sube un archivo de audio existente
              </span>
            </Link>
          </div>
        </section>

        {/* Seccion de entrenamiento */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Herramientas de entrenamiento
            </h2>
            {stats.total > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {stats.completados}/{stats.total} completados
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/training/upload"
              className="flex items-center gap-4 bg-white dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Subir audios</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Para entrenamiento</p>
              </div>
            </Link>

            <Link
              href="/training/transcribe"
              className="flex items-center gap-4 bg-white dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Transcribir</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.pendientes + stats.enProgreso > 0
                    ? `${stats.pendientes + stats.enProgreso} pendientes`
                    : 'Sin pendientes'}
                </p>
              </div>
            </Link>

            <Link
              href="/training/export"
              className="flex items-center gap-4 bg-white dark:bg-gray-700 rounded-xl p-4 shadow hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">Exportar</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stats.completados > 0 ? `${stats.completados} listos` : 'Dataset vacio'}
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Audios recientes */}
        {pairs.length > 0 && (
          <section className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Audios recientes
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-600">
              {pairs.slice(0, 5).map((pair) => (
                <li key={pair.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      pair.status === 'completado' || pair.status === 'revisado'
                        ? 'bg-green-500'
                        : pair.status === 'en_progreso'
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`} />
                    <span className="text-gray-800 dark:text-gray-200 truncate max-w-xs">
                      {pair.audioFileName}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.floor(pair.audioDuration / 60)}:{String(Math.floor(pair.audioDuration % 60)).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Info de configuracion */}
        <section className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Configuracion requerida
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Para usar las funciones de transcripcion automatica, configura las variables de entorno:
          </p>
          <ul className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 space-y-1">
            <li><code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">OPENAI_API_KEY</code> - Para Whisper (transcripcion)</li>
            <li><code className="bg-yellow-100 dark:bg-yellow-900/50 px-1 rounded">ANTHROPIC_API_KEY</code> - Para Claude (procesamiento)</li>
          </ul>
        </section>
      </main>

      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        PathologyTranscriber v2.0
      </footer>
    </div>
  );
}
