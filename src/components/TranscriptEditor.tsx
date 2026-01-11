'use client';

import { useState, useRef, useEffect } from 'react';

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function TranscriptEditor({
  value,
  onChange,
  placeholder = 'Escribe aqui la transcripcion...',
  className = '',
  autoFocus = false,
}: TranscriptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    // Contar palabras y caracteres
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(value.length);
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Insertar texto en la posicion del cursor
  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);
    onChange(newValue);

    // Restaurar posicion del cursor
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  };

  // Botones de formato rapido
  const formatButtons = [
    { label: '.', action: () => insertAtCursor('.'), title: 'Punto' },
    { label: ',', action: () => insertAtCursor(','), title: 'Coma' },
    { label: ';', action: () => insertAtCursor(';'), title: 'Punto y coma' },
    { label: ':', action: () => insertAtCursor(':'), title: 'Dos puntos' },
    { label: '-', action: () => insertAtCursor('-'), title: 'Guion' },
    { label: '( )', action: () => insertAtCursor('()'), title: 'Parentesis' },
    { label: '↵', action: () => insertAtCursor('\n'), title: 'Nueva linea' },
    { label: '¶', action: () => insertAtCursor('\n\n'), title: 'Nuevo parrafo' },
  ];

  // Terminos medicos comunes
  const medicalTerms = [
    'formalina',
    'fragmento',
    'tejido',
    'mucosa',
    'epitelio',
    'estroma',
    'glandular',
    'cervical',
    'endometrial',
    'biopsia',
  ];

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Barra de herramientas */}
      <div className="flex flex-wrap gap-1 mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-600">
        {formatButtons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-500 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            title={btn.title}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Area de texto */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full p-4 border border-gray-200 dark:border-gray-600 rounded-b-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm leading-relaxed"
        style={{ minHeight: '250px' }}
      />

      {/* Barra de estado */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex gap-4">
          <span>{wordCount} palabras</span>
          <span>{charCount} caracteres</span>
        </div>
        <div className="flex gap-1">
          {medicalTerms.slice(0, 5).map((term) => (
            <button
              key={term}
              onClick={() => insertAtCursor(term)}
              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
