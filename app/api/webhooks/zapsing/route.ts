import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ZapSign envía el documento en body.document
    const doc = body.document ?? body;
    const { token, status, signed_file } = doc;

    if (!token) return NextResponse.json({ ok: true });

    if (status === 'completed' && signed_file) {
      await supabase
        .from('contratos')
        .update({
          estado:      'firmado',
          url_firmado: signed_file,
        })
        .eq('zapsign_id', token);

      console.log(`Contrato ${token} firmado — URL: ${signed_file}`);
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('ZapSign webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}