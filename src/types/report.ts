// Tipos para el sistema PathologyTranscriber

export type ReportType = 'biopsia' | 'citologia' | 'autopsia';

export interface PatientInfo {
  nombre: string;
  rut: string;
  edad?: string;
  medicoSolicitante?: string;
  organoLocalizacion?: string;
  antecedentes?: string;
  diagnosticoClinico?: string;
  procedimientoQuirurgico?: string;
  procedencia?: string;
  fichaClinica?: string;
  fechaTomaMuestra?: string;
  fechaRecepcionMuestra?: string;
}

export interface Report {
  id: string;
  tipo: ReportType;
  paciente: PatientInfo;
  examenMacroscopico: string;
  conclusion: string;
  comentarios?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tipos para la Fase 1 - Herramienta de Entrenamiento
export interface TrainingPair {
  id: string;
  audioFileName: string;
  audioUrl: string;
  audioDuration: number; // en segundos
  transcripcion: string;
  transcripcionCorregida?: string;
  notas?: string;
  status: 'pendiente' | 'en_progreso' | 'completado' | 'revisado';
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingSession {
  id: string;
  fecha: Date;
  pares: TrainingPair[];
  totalAudios: number;
  completados: number;
}

// Tipos para comandos de voz
export type VoiceCommand =
  | 'identificar_paciente'
  | 'examen_macroscopico'
  | 'conclusion'
  | 'comentarios'
  | 'abrir_mayusculas'
  | 'cerrar_mayusculas'
  | 'abrir_negritas'
  | 'cerrar_negritas'
  | 'punto'
  | 'coma'
  | 'punto_y_coma'
  | 'dos_puntos'
  | 'abrir_parentesis'
  | 'cerrar_parentesis'
  | 'guion'
  | 'nueva_linea'
  | 'nuevo_parrafo'
  | 'borrar_eso'
  | 'borrar_palabra'
  | 'corregir'
  | 'pausar'
  | 'leer_informe'
  | 'guardar_informe'
  | 'descartar';

export interface CommandMapping {
  phrases: string[];
  command: VoiceCommand;
  action: string;
}

// Estado del editor de transcripción
export interface EditorState {
  currentField: 'paciente' | 'examen' | 'conclusion' | 'comentarios';
  isBold: boolean;
  isUppercase: boolean;
  content: string;
}
