'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TrainingPair } from '@/types/report';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const audioFiles = selectedFiles.filter(f =>
      f.type.startsWith('audio/') ||
      f.name.endsWith('.m4a') ||
      f.name.endsWith('.mp3') ||
      f.name.endsWith('.wav') ||
      f.name.endsWith('.webm')
    );
    setFiles(prev => [...prev, ...audioFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    const existingData = localStorage.getItem('trainingPairs');
    const existingPairs: TrainingPair[] = existingData ? JSON.parse(existingData) : [];

    const newPairs: TrainingPair[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const duration = await getAudioDuration(file);

      // Convertir archivo a base64 para almacenar en localStorage
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const pair: TrainingPair = {
        id: `audio_${Date.now()}_${i}`,
        audioFileName: file.name,
        audioUrl: base64,
        audioDuration: duration,
        transcripcion: '',
        status: 'pendiente',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      newPairs.push(pair);
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    const allPairs = [...existingPairs, ...newPairs];
    localStorage.setItem('trainingPairs', JSON.stringify(allPairs));

    setUploading(false);
    router.push('/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Zona de drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-16 h-16 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
            Haz clic para seleccionar archivos de audio
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Formatos soportados: MP3, M4A, WAV, WebM
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.m4a,.mp3,.wav,.webm"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Lista de archivos */}
        {files.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Archivos seleccionados ({files.length})
            </h2>
            <ul className="divide-y divide-gray-200 dark:divide-gray-600 max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <li key={index} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-gray-400 text-xs">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Barra de progreso */}
        {uploading && (
          <div className="mt-6">
            <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
              Procesando... {progress}%
            </p>
          </div>
        )}

        {/* Boton de subir */}
        {files.length > 0 && !uploading && (
          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            Subir {files.length} archivo{files.length > 1 ? 's' : ''}
          </button>
        )}
      </main>
    </div>
  );
}
