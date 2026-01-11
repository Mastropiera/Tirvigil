import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no configurada');
  }
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No se proporciono archivo de audio' },
        { status: 400 }
      );
    }

    // Convertir File a formato que OpenAI acepta
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Crear un File object para la API de OpenAI
    const file = new File([buffer], audioFile.name, { type: audioFile.type });

    const openai = getOpenAIClient();
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'es',
      response_format: 'verbose_json',
      prompt: 'Transcripcion de informe anatomopatologico medico. Terminos medicos: biopsia, citologia, formalina, mucosa, epitelio, estroma, glandular, cervical, endometrial, lesion intraepitelial.',
    });

    return NextResponse.json({
      text: transcription.text,
      segments: transcription.segments,
      duration: transcription.duration,
    });
  } catch (error) {
    console.error('Error en transcripcion:', error);
    return NextResponse.json(
      { error: 'Error al transcribir el audio' },
      { status: 500 }
    );
  }
}
