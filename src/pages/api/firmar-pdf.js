// Ruta API en Next.js para insertar firma en PDF
import { PDFDocument, rgb } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sdkgzrmowipezgjrqouo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNka2d6cm1vd2lwZXpnanJxb3VvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzU3OTA0MCwiZXhwIjoyMDYzMTU1MDQwfQ.BkNd9dCxsCink1B5bPpjKzJNBYCk_4h61iTQc227xMo'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { pdfUrl, firmaBase64, empleadoId, nominaId } = req.body;

  try {
    // Descargar PDF original con fetch nativo
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) throw new Error("No se pudo descargar el PDF original");
    const pdfBytes = await pdfResponse.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfBytes);

    const firmaImage = await pdfDoc.embedPng(firmaBase64);
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width, height } = lastPage.getSize();

    lastPage.drawImage(firmaImage, {
      x: width - 180,
      y: 50,
      width: 150,
      height: 60,
    });

    lastPage.drawText('Recibí conforme', {
      x: width - 180,
      y: 115,
      size: 10,
      color: rgb(0, 0, 0),
    });

    const pdfFinal = await pdfDoc.save();
    const buffer = Buffer.from(pdfFinal);

    const nombreArchivo = `firmadas/nomina_${nominaId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('archivos')
      .upload(nombreArchivo, buffer, {
        upsert: true,
        contentType: 'application/pdf',
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('archivos')
      .getPublicUrl(nombreArchivo);

    await supabase.from('nominas').update({
      estado: 'firmada',
      fecha_firma: new Date().toISOString(),
      archivo_url: publicUrl,
    }).eq('id', nominaId);

    res.status(200).json({ message: 'PDF firmado y subido', url: publicUrl });
  } catch (err) {
    console.error('ERROR EN LA FIRMA', err);
    res.status(500).json({ error: JSON.stringify(err) || 'Error al firmar PDF' });
  }
}
