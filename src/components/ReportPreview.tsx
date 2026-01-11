'use client';

import { useState } from 'react';
import type { ProcessedReport } from '@/lib/claude';
import { speakText, stopSpeaking, readReport } from '@/lib/textToSpeech';

interface ReportPreviewProps {
  report: ProcessedReport;
  onEdit?: (field: keyof ProcessedReport, value: string) => void;
  editable?: boolean;
  className?: string;
}

export default function ReportPreview({
  report,
  onEdit,
  editable = false,
  className = '',
}: ReportPreviewProps) {
  const [editingField, setEditingField] = useState<keyof ProcessedReport | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleEditStart = (field: keyof ProcessedReport) => {
    if (!editable || field === 'advertencias') return;
    setEditingField(field);
    setEditValue(report[field] as string);
  };

  const handleEditSave = () => {
    if (editingField && onEdit) {
      onEdit(editingField, editValue);
    }
    setEditingField(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleReadReport = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        await readReport(report);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const handleReadSection = async (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      try {
        await speakText(text);
      } finally {
        setIsSpeaking(false);
      }
    }
  };

  const renderField = (
    label: string,
    field: keyof ProcessedReport,
    content: string
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </h3>
          <div className="flex gap-1">
            {content && (
              <button
                onClick={() => handleReadSection(content)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Leer seccion"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
                </svg>
              </button>
            )}
            {editable && (
              <button
                onClick={() => handleEditStart(field)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleEditCancel}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[3rem] ${
              editable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
            }`}
            onClick={() => handleEditStart(field)}
          >
            {content ? (
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {content}
              </p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">
                Sin contenido
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-700 rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Vista Previa del Informe
        </h2>
        <button
          onClick={handleReadReport}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSpeaking
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          }`}
        >
          {isSpeaking ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
              Detener
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
              </svg>
              Leer informe
            </>
          )}
        </button>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {renderField('Paciente', 'paciente', report.paciente)}
        {renderField('Examen Macroscopico', 'examenMacroscopico', report.examenMacroscopico)}
        {renderField('Conclusion', 'conclusion', report.conclusion)}
        {renderField('Comentarios', 'comentarios', report.comentarios)}

        {/* Advertencias */}
        {report.advertencias && report.advertencias.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Advertencias
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              {report.advertencias.map((adv, idx) => (
                <li key={idx}>• {adv}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
