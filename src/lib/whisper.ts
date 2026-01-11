export interface TranscriptionResult {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  duration?: number;
}

export async function transcribeAudio(audioBlob: Blob, fileName: string = 'audio.webm'): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('audio', audioBlob, fileName);

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al transcribir');
  }

  return response.json();
}

export async function transcribeAudioFile(file: File): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('audio', file);

  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al transcribir');
  }

  return response.json();
}
