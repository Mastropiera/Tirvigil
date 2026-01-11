'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTrainingData } from '@/hooks/useTrainingData';

export default function ExportPage() {
  const { isLoaded, getStats, getCompletedPairs, clearCompleted } = useTrainingData();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  const stats = getStats();
  const completedPairs = getCompletedPairs();

  const generateJSON = () => {
    const exportData = completedPairs.map(pair => ({
      id: pair.id,
      audioFileName: pair.audioFileName,
      audioDuration: pair.audioDuration,
      transcripcion: pair.transcripcion,
      transcripcionCorregida: pair.transcripcionCorregida,
      notas: pair.notas,
      createdAt: pair.createdAt,
      updatedAt: pair.updatedAt,
    }));

    return JSON.stringify(exportData, null, 2);
  };

  const generateCSV = () => {
    const headers = ['id', 'audioFileName', 'audioDuration', 'transcripcion', 'notas', 'createdAt'];
    const rows = completedPairs.map(pair => [
      pair.id,
      `"${pair.audioFileName.replace(/"/g, '""')}"`,
      pair.audioDuration,
      `"${(pair.transcripcion || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(pair.notas || '').replace(/"/g, '""')}"`,
      new Date(pair.createdAt).toISOString(),
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const handleExport = () => {
    const content = exportFormat === 'json' ? generateJSON() : generateCSV();
    const mimeType = exportFormat === 'json' ? 'application/json' : 'text/csv';
    const extension = exportFormat;

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pathology-training-data-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCompleted = () => {
    if (confirm('Estas seguro de eliminar todas las transcripciones completadas? Esta accion no se puede deshacer.')) {
      clearCompleted();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando...</div>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold">Exportar Dataset</h1>
            <p className="text-blue-200 text-sm">Descargar datos de entrenamiento</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Estadisticas */}
        <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Resumen del Dataset
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.completados}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Completadas
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Total audios
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-600 rounded-lg">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalMinutos}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Minutos
              </p>
            </div>
          </div>
        </div>

        {completedPairs.length === 0 ? (
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No hay transcripciones completadas para exportar.
            </p>
            <Link
              href="/training/transcribe"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Ir a transcribir
            </Link>
          </div>
        ) : (
          <>
            {/* Formato de exportacion */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Formato de exportacion
              </h2>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={() => setExportFormat('json')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-200">JSON</span>
                  <span className="text-xs text-gray-500">(recomendado)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={() => setExportFormat('csv')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-200">CSV</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Vista previa ({completedPairs.length} transcripciones)
              </h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono">
                  {exportFormat === 'json'
                    ? generateJSON().slice(0, 1500) + (generateJSON().length > 1500 ? '\n...' : '')
                    : generateCSV().slice(0, 1500) + (generateCSV().length > 1500 ? '\n...' : '')}
                </pre>
              </div>
            </div>

            {/* Botones de accion */}
            <div className="space-y-4">
              <button
                onClick={handleExport}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar {exportFormat.toUpperCase()}
              </button>

              <button
                onClick={handleClearCompleted}
                className="w-full border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 px-6 rounded-xl transition-colors"
              >
                Limpiar transcripciones completadas
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
