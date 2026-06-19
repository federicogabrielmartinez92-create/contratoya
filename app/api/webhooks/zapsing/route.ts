import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { guardarArchivoPermanente } from '@/lib/zapsignStorage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doc = body.document ?? body;
    const { token, status, signed_file } = doc;

    if (!token) return NextResponse.json({ ok: true });

    if (status === 'completed' && signed_file) {
      // Descargamos y guardamos copia permanente (la de ZapSign expira en 60 min)
      const url_firmado_permanente = await guardarArchivoPermanente(
        signed_file,
        `firmados/${token}.pdf`
      );

      await supabase
        .from('contratos')
        .update({
          estado:      'firmado',
          url_firmado: url_firmado_permanente ?? signed_file,
        })
        .eq('zapsign_id', token);

      console.log(`Contrato ${token} firmado y guardado permanentemente`);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('ZapSign webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}