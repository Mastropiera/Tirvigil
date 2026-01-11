export interface ProcessedReport {
  paciente: string;
  examenMacroscopico: string;
  conclusion: string;
  comentarios: string;
  advertencias: string[];
}

export async function processTranscription(transcription: string): Promise<ProcessedReport> {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcription }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al procesar');
  }

  return response.json();
}
