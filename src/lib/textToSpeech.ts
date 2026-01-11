export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  lang?: string;
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isReady = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synthesis = window.speechSynthesis;
      this.isReady = true;
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  getSpanishVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(v => v.lang.startsWith('es'));
  }

  speak(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.isReady) {
        reject(new Error('Speech synthesis no disponible'));
        return;
      }

      // Cancelar cualquier speech anterior
      this.stop();

      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = options.rate ?? 1;
      this.utterance.pitch = options.pitch ?? 1;
      this.utterance.volume = options.volume ?? 1;
      this.utterance.lang = options.lang ?? 'es-ES';

      // Buscar voz en espanol si no se especifica
      if (options.voice) {
        this.utterance.voice = options.voice;
      } else {
        const spanishVoices = this.getSpanishVoices();
        if (spanishVoices.length > 0) {
          // Preferir voces de Chile o Mexico
          const preferredVoice = spanishVoices.find(v =>
            v.lang === 'es-CL' || v.lang === 'es-MX'
          ) || spanishVoices[0];
          this.utterance.voice = preferredVoice;
        }
      }

      this.utterance.onend = () => resolve();
      this.utterance.onerror = (event) => reject(event);

      this.synthesis.speak(this.utterance);
    });
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  get isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }

  get isPaused(): boolean {
    return this.synthesis?.paused ?? false;
  }
}

// Instancia singleton
let ttsInstance: TextToSpeechService | null = null;

export function getTextToSpeech(): TextToSpeechService {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeechService();
  }
  return ttsInstance;
}

export async function speakText(text: string, options?: SpeechOptions): Promise<void> {
  const tts = getTextToSpeech();
  return tts.speak(text, options);
}

export function stopSpeaking(): void {
  const tts = getTextToSpeech();
  tts.stop();
}

// Leer un informe completo
export async function readReport(report: {
  paciente?: string;
  examenMacroscopico?: string;
  conclusion?: string;
  comentarios?: string;
}): Promise<void> {
  const tts = getTextToSpeech();

  const sections: string[] = [];

  if (report.paciente) {
    sections.push(`Paciente: ${report.paciente}`);
  }

  if (report.examenMacroscopico) {
    sections.push(`Examen macroscópico: ${report.examenMacroscopico}`);
  }

  if (report.conclusion) {
    sections.push(`Conclusión: ${report.conclusion}`);
  }

  if (report.comentarios) {
    sections.push(`Comentarios: ${report.comentarios}`);
  }

  const fullText = sections.join('. . . ');
  return tts.speak(fullText, { rate: 0.9 });
}
