import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY no configurada');
  }
  return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Eres un asistente especializado en procesar transcripciones de informes anatomopatologicos dictados por un patologo.

Tu tarea es:
1. FILTRAR ruido conversacional (ej: "a ver", "espera", "donde deje el cafe", "um", "eh")
2. INTERPRETAR comandos de voz y aplicarlos al texto
3. ESTRUCTURAR el contenido en las secciones correctas del informe
4. CORREGIR errores de transcripcion obvios en terminologia medica
5. FORMATEAR numeros como cifras (ej: "cero punto tres" -> "0.3")

COMANDOS DE VOZ A INTERPRETAR:
- "identificar paciente [nombre/RUT]" -> Guardar identificador del paciente
- "examen macroscopico" -> Iniciar seccion Examen Macroscopico
- "conclusion" -> Iniciar seccion Conclusion
- "comentarios" -> Iniciar seccion Comentarios
- "abrir mayusculas" / "cerrar mayusculas" -> Aplicar MAYUSCULAS al texto entre estos comandos
- "abrir negritas" / "cerrar negritas" -> Aplicar **negrita** al texto entre estos comandos
- "punto" -> .
- "coma" -> ,
- "punto y coma" -> ;
- "dos puntos" -> :
- "abrir parentesis" / "cerrar parentesis" -> ( )
- "guion" -> -
- "nueva linea" -> salto de linea
- "nuevo parrafo" -> doble salto de linea
- "borrar eso" -> eliminar ultima frase
- "borrar palabra" -> eliminar ultima palabra
- "corregir [X]" o "no mejor pon [X]" -> reemplazar lo anterior con X

RESPONDE EN JSON con este formato exacto:
{
  "paciente": "nombre o identificador del paciente",
  "examenMacroscopico": "texto procesado del examen macroscopico",
  "conclusion": "texto procesado de la conclusion",
  "comentarios": "texto procesado de comentarios (puede ser vacio)",
  "advertencias": ["lista de posibles errores o dudas encontradas"]
}`;

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();

    if (!transcription) {
      return NextResponse.json(
        { error: 'No se proporciono transcripcion' },
        { status: 400 }
      );
    }

    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Procesa la siguiente transcripcion de un informe anatomopatologico:\n\n${transcription}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extraer el texto de la respuesta
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Intentar parsear como JSON
    try {
      // Buscar el JSON en la respuesta (puede estar envuelto en markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // Si no es JSON valido, devolver como texto estructurado
    }

    return NextResponse.json({
      paciente: '',
      examenMacroscopico: responseText,
      conclusion: '',
      comentarios: '',
      advertencias: ['No se pudo estructurar automaticamente'],
    });
  } catch (error) {
    console.error('Error en procesamiento:', error);
    return NextResponse.json(
      { error: 'Error al procesar la transcripcion' },
      { status: 500 }
    );
  }
}
