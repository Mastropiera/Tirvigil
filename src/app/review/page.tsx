'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReportPreview from '@/components/ReportPreview';
import { transcribeAudio } from '@/lib/whisper';
import { processTranscription, type ProcessedReport } from '@/lib/claude';
import { downloadReportAsDocx } from '@/lib/docxGenerator';

type Step = 'loading' | 'transcribing' | 'processing' | 'review' | 'error';

export default function ReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('loading');
  const [error, setError] = useState<string | null>(null);
  const [rawTranscription, setRawTranscription] = useState('');
  const [report, setReport] = useState<ProcessedReport>({
    paciente: '',
    examenMacroscopico: '',
    conclusion: '',
    comentarios: '',
    advertencias: [],
  });
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const processAudio = async () => {
      try {
        // Recuperar audio de sessionStorage
        const pendingAudioStr = sessionStorage.getItem('pendingAudio');
        if (!pendingAudioStr) {
          router.push('/record');
          return;
        }

        const pendingAudio = JSON.parse(pendingAudioStr);
        const { data, type } = pendingAudio;

        // Convertir base64 a Blob
        const response = await fetch(data);
        const audioBlob = await response.blob();

        // Paso 1: Transcribir con Whisper
        setStep('transcribing');
        const transcriptionResult = await transcribeAudio(audioBlob, 'audio.webm');
        setRawTranscription(transcriptionResult.text);

        // Paso 2: Procesar con Claude
        setStep('processing');
        const processedReport = await processTranscription(transcriptionResult.text);
        setReport(processedReport);

        // Limpiar sessionStorage
        sessionStorage.removeItem('pendingAudio');

        setStep('review');
      } catch (err) {
        console.error('Error procesando audio:', err);
        setError(err instanceof Error ? err.message : 'Error al procesar el audio');
        setStep('error');
      }
    };

    processAudio();
  }, [router]);

  const handleEditReport = (field: keyof ProcessedReport, value: string) => {
    setReport(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadReportAsDocx(report);
    } catch (err) {
      console.error('Error descargando:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewReport = () => {
    router.push('/record');
  };

  // Estados de carga
  if (step === 'loading' || step === 'transcribing' || step === 'processing') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {step === 'loading' && 'Cargando audio...'}
            {step === 'transcribing' && 'Transcribiendo audio...'}
            {step === 'processing' && 'Procesando informe...'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {step === 'transcribing' && 'Usando Whisper AI para convertir voz a texto'}
            {step === 'processing' && 'Usando Claude AI para estructurar el informe'}
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (step === 'error') {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <svg className="w-20 h-20 mx-auto text-red-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Error al procesar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error || 'Ocurrio un error inesperado'}
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Volver al inicio
            </Link>
            <button
              onClick={() => router.push('/record')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista de revision
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="bg-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <img
            src="/tirvigil_header.png"
            alt="Tirvigil"
            className="flex-1 object-contain max-h-32"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Transcripcion original (colapsable) */}
        <details className="mb-6 bg-white dark:bg-gray-700 rounded-xl shadow">
          <summary className="px-6 py-4 cursor-pointer text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 rounded-xl">
            Ver transcripcion original
          </summary>
          <div className="px-6 pb-4">
            <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {rawTranscription || 'Sin transcripcion'}
            </p>
          </div>
        </details>

        {/* Vista previa del informe */}
        <ReportPreview
          report={report}
          onEdit={handleEditReport}
          editable={true}
          className="mb-6"
        />

        {/* Botones de accion */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Descargando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar Word
              </>
            )}
          </button>

          <button
            onClick={handleNewReport}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo informe
          </button>
        </div>
      </main>
    </div>
  );
}
