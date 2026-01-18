'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/') ||
          selectedFile.name.endsWith('.m4a') ||
          selectedFile.name.endsWith('.mp3') ||
          selectedFile.name.endsWith('.wav') ||
          selectedFile.name.endsWith('.webm')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Por favor selecciona un archivo de audio valido');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Obtener duracion del audio
      const duration = await new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => resolve(Math.round(audio.duration));
        audio.onerror = () => resolve(0);
        audio.src = URL.createObjectURL(file);
      });

      // Convertir a base64 y guardar
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        sessionStorage.setItem('pendingAudio', JSON.stringify({
          data: base64Audio,
          duration,
          type: file.type,
          fileName: file.name,
          timestamp: Date.now(),
        }));
        router.push('/review');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al procesar el archivo');
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

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
        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {isProcessing ? (
          <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Procesando archivo...</p>
          </div>
        ) : (
          <>
            {/* Zona de drop */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                Haz clic para seleccionar un archivo de audio
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Formatos soportados: MP3, M4A, WAV, WebM
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.m4a,.mp3,.wav,.webm"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Archivo seleccionado */}
            {file && (
              <div className="mt-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-gray-200 font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleUpload}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow transition-colors"
                >
                  Continuar con transcripcion
                </button>
              </div>
            )}
          </>
        )}

        {/* Alternativa: grabar */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">o</p>
          <Link
            href="/record"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Grabar un nuevo audio
          </Link>
        </div>
      </main>
    </div>
  );
}
