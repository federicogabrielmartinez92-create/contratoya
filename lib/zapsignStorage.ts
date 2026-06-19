import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Descarga un archivo desde una URL temporal de ZapSign y lo guarda
// permanentemente en Supabase Storage. Devuelve una URL firmada de larga duración (10 años).
export async function guardarArchivoPermanente(
  urlTemporal: string,
  rutaDestino: string
): Promise<string | null> {
  try {
    const res = await fetch(urlTemporal);
    if (!res.ok) throw new Error('No se pudo descargar el archivo de ZapSign');

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('documentos_usuario')
      .upload(rutaDestino, buffer, { contentType: 'application/pdf', upsert: true });

    if (uploadError) throw uploadError;

    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from('documentos_usuario')
      .createSignedUrl(rutaDestino, 60 * 60 * 24 * 365 * 10); // 10 años

    if (signedError || !signedData) throw signedError;

    return signedData.signedUrl;
  } catch (err) {
    console.error('Error guardando archivo permanente:', err);
    return null;
  }
}