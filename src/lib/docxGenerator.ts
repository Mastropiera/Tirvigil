import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Packer,
} from 'docx';
import { saveAs } from 'file-saver';
import type { ProcessedReport } from './claude';

interface ReportData extends ProcessedReport {
  fecha?: string;
}

function parseFormattedText(text: string): TextRun[] {
  const runs: TextRun[] = [];

  // Regex para detectar **texto en negrita**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Texto en negrita
      runs.push(new TextRun({
        text: part.slice(2, -2),
        bold: true,
      }));
    } else if (part) {
      // Texto normal
      runs.push(new TextRun({ text: part }));
    }
  }

  return runs;
}

function createParagraphsFromText(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    if (line.trim()) {
      paragraphs.push(
        new Paragraph({
          children: parseFormattedText(line),
          spacing: { after: 120 },
        })
      );
    }
  }

  return paragraphs;
}

export function generateReportDocument(data: ReportData): Document {
  const fecha = data.fecha || new Date().toLocaleDateString('es-CL');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Titulo
          new Paragraph({
            children: [
              new TextRun({
                text: 'INFORME ANATOMOPATOLÓGICO',
                bold: true,
                size: 28,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Fecha
          new Paragraph({
            children: [
              new TextRun({
                text: `Fecha: ${fecha}`,
                size: 22,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Paciente
          new Paragraph({
            children: [
              new TextRun({
                text: 'Paciente: ',
                bold: true,
                size: 22,
              }),
              new TextRun({
                text: data.paciente || '[No especificado]',
                size: 22,
              }),
            ],
            spacing: { after: 400 },
            border: {
              bottom: {
                color: '000000',
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),

          // Examen Macroscopico
          new Paragraph({
            text: 'EXAMEN MACROSCÓPICO:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...createParagraphsFromText(data.examenMacroscopico || '[Sin datos]'),

          // Conclusion
          new Paragraph({
            text: 'CONCLUSIÓN:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          ...createParagraphsFromText(data.conclusion || '[Sin datos]'),

          // Comentarios (si existen)
          ...(data.comentarios ? [
            new Paragraph({
              text: 'COMENTARIOS:',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 200 },
            }),
            ...createParagraphsFromText(data.comentarios),
          ] : []),
        ],
      },
    ],
  });

  return doc;
}

export async function downloadReportAsDocx(data: ReportData, filename?: string): Promise<void> {
  const doc = generateReportDocument(data);
  const blob = await Packer.toBlob(doc);

  const defaultFilename = `informe-${data.paciente?.replace(/\s+/g, '-') || 'sin-nombre'}-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename || defaultFilename);
}

export async function getReportAsBlob(data: ReportData): Promise<Blob> {
  const doc = generateReportDocument(data);
  return Packer.toBlob(doc);
}
