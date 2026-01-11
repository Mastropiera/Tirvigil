import type { VoiceCommand, CommandMapping } from '@/types/report';

export const COMMAND_MAPPINGS: CommandMapping[] = [
  // Navegacion
  { phrases: ['identificar paciente', 'identificar al paciente'], command: 'identificar_paciente', action: 'navigate' },
  { phrases: ['examen macroscópico', 'examen macroscopico', 'macroscópico', 'macroscopico'], command: 'examen_macroscopico', action: 'navigate' },
  { phrases: ['conclusión', 'conclusion'], command: 'conclusion', action: 'navigate' },
  { phrases: ['comentarios', 'comentario'], command: 'comentarios', action: 'navigate' },

  // Formato mayusculas/negritas
  { phrases: ['abrir mayúsculas', 'abrir mayusculas', 'mayúsculas', 'mayusculas'], command: 'abrir_mayusculas', action: 'format' },
  { phrases: ['cerrar mayúsculas', 'cerrar mayusculas'], command: 'cerrar_mayusculas', action: 'format' },
  { phrases: ['abrir negritas', 'negritas', 'negrita'], command: 'abrir_negritas', action: 'format' },
  { phrases: ['cerrar negritas', 'cerrar negrita'], command: 'cerrar_negritas', action: 'format' },

  // Puntuacion
  { phrases: ['punto y coma'], command: 'punto_y_coma', action: 'punctuation' },
  { phrases: ['dos puntos'], command: 'dos_puntos', action: 'punctuation' },
  { phrases: ['punto'], command: 'punto', action: 'punctuation' },
  { phrases: ['coma'], command: 'coma', action: 'punctuation' },
  { phrases: ['abrir paréntesis', 'abrir parentesis', 'paréntesis abierto'], command: 'abrir_parentesis', action: 'punctuation' },
  { phrases: ['cerrar paréntesis', 'cerrar parentesis', 'paréntesis cerrado'], command: 'cerrar_parentesis', action: 'punctuation' },
  { phrases: ['guión', 'guion'], command: 'guion', action: 'punctuation' },

  // Saltos de linea
  { phrases: ['nueva línea', 'nueva linea', 'salto de línea', 'salto de linea'], command: 'nueva_linea', action: 'linebreak' },
  { phrases: ['nuevo párrafo', 'nuevo parrafo'], command: 'nuevo_parrafo', action: 'linebreak' },

  // Edicion
  { phrases: ['borrar eso', 'eliminar eso', 'quitar eso'], command: 'borrar_eso', action: 'edit' },
  { phrases: ['borrar palabra', 'eliminar palabra', 'quitar palabra'], command: 'borrar_palabra', action: 'edit' },
  { phrases: ['corregir', 'corrección', 'correccion'], command: 'corregir', action: 'edit' },
  { phrases: ['pausar', 'pausa', 'detener'], command: 'pausar', action: 'control' },

  // Control
  { phrases: ['leer informe', 'leer el informe', 'lee el informe'], command: 'leer_informe', action: 'control' },
  { phrases: ['guardar informe', 'guardar el informe', 'guarda el informe'], command: 'guardar_informe', action: 'control' },
  { phrases: ['descartar', 'cancelar', 'eliminar todo'], command: 'descartar', action: 'control' },
];

const PUNCTUATION_MAP: Record<string, string> = {
  punto: '.',
  coma: ',',
  punto_y_coma: ';',
  dos_puntos: ':',
  abrir_parentesis: '(',
  cerrar_parentesis: ')',
  guion: '-',
  nueva_linea: '\n',
  nuevo_parrafo: '\n\n',
};

export interface ParsedCommand {
  command: VoiceCommand;
  action: string;
  originalText: string;
  remainingText: string;
}

export function findCommand(text: string): ParsedCommand | null {
  const lowerText = text.toLowerCase().trim();

  for (const mapping of COMMAND_MAPPINGS) {
    for (const phrase of mapping.phrases) {
      const lowerPhrase = phrase.toLowerCase();
      const index = lowerText.indexOf(lowerPhrase);

      if (index !== -1) {
        return {
          command: mapping.command,
          action: mapping.action,
          originalText: phrase,
          remainingText: text.slice(0, index) + text.slice(index + phrase.length),
        };
      }
    }
  }

  return null;
}

export function applyCommand(text: string, command: VoiceCommand): string {
  // Aplicar puntuacion
  if (command in PUNCTUATION_MAP) {
    return text + PUNCTUATION_MAP[command as keyof typeof PUNCTUATION_MAP];
  }

  return text;
}

export function processTextWithCommands(rawText: string): {
  processedText: string;
  currentSection: string;
  isBold: boolean;
  isUppercase: boolean;
} {
  let result = '';
  let currentSection = 'paciente';
  let isBold = false;
  let isUppercase = false;
  let remaining = rawText;

  while (remaining.length > 0) {
    const command = findCommand(remaining);

    if (command) {
      // Agregar texto antes del comando
      const beforeCommand = remaining.slice(0, remaining.toLowerCase().indexOf(command.originalText.toLowerCase()));
      if (beforeCommand.trim()) {
        let textToAdd = beforeCommand.trim();
        if (isUppercase) textToAdd = textToAdd.toUpperCase();
        if (isBold) textToAdd = `**${textToAdd}**`;
        result += textToAdd + ' ';
      }

      // Procesar comando
      switch (command.command) {
        case 'examen_macroscopico':
          currentSection = 'examen';
          break;
        case 'conclusion':
          currentSection = 'conclusion';
          break;
        case 'comentarios':
          currentSection = 'comentarios';
          break;
        case 'abrir_mayusculas':
          isUppercase = true;
          break;
        case 'cerrar_mayusculas':
          isUppercase = false;
          break;
        case 'abrir_negritas':
          isBold = true;
          break;
        case 'cerrar_negritas':
          isBold = false;
          break;
        default:
          result = applyCommand(result.trim(), command.command) + ' ';
      }

      remaining = command.remainingText.trim();
    } else {
      // No hay mas comandos, agregar el resto del texto
      let textToAdd = remaining.trim();
      if (isUppercase) textToAdd = textToAdd.toUpperCase();
      if (isBold) textToAdd = `**${textToAdd}**`;
      result += textToAdd;
      break;
    }
  }

  return {
    processedText: result.trim(),
    currentSection,
    isBold,
    isUppercase,
  };
}

// Convertir numeros escritos a cifras
export function convertNumbersToDigits(text: string): string {
  const numberMap: Record<string, string> = {
    'cero': '0', 'uno': '1', 'una': '1', 'dos': '2', 'tres': '3',
    'cuatro': '4', 'cinco': '5', 'seis': '6', 'siete': '7',
    'ocho': '8', 'nueve': '9', 'diez': '10',
  };

  let result = text;

  // Patron para "X punto Y" (decimales)
  result = result.replace(
    /(\w+)\s+punto\s+(\w+)/gi,
    (_, before, after) => {
      const num1 = numberMap[before.toLowerCase()] || before;
      const num2 = numberMap[after.toLowerCase()] || after;
      return `${num1}.${num2}`;
    }
  );

  // Reemplazar numeros individuales
  for (const [word, digit] of Object.entries(numberMap)) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, digit);
  }

  return result;
}
