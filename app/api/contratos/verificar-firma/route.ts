import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getZapsignConfig } from '@/lib/zapsignConfig';
import { guardarArchivoPermanente } from '@/lib/zapsignStorage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { zapsign_id } = await request.json();
    if (!zapsign_id) return NextResponse.json({ error: 'Falta zapsign_id' }, { status: 400 });

    const { url, token } = getZapsignConfig();

    const res = await fetch(`${url}${zapsign_id}/`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!res.ok) throw new Error(`ZapSign error: ${await res.text()}`);

    const data = await res.json();

    if (data.status === 'signed' && data.signed_file) {
      const url_firmado_permanente = await guardarArchivoPermanente(
        data.signed_file,
        `firmados/${zapsign_id}.pdf`
      );

      await supabase
        .from('contratos')
        .update({ estado: 'firmado', url_firmado: url_firmado_permanente ?? data.signed_file })
        .eq('zapsign_id', zapsign_id);

      return NextResponse.json({ actualizado: true, estado: 'firmado' });
    }

    return NextResponse.json({ actualizado: false, estado: data.status });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al verificar estado' }, { status: 500 });
  }
}