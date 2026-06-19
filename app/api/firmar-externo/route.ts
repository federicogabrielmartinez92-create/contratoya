import { NextRequest, NextResponse } from 'next/server';
import { guardarArchivoPermanente } from '@/lib/zapsignStorage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { url_pdf, signers, nombre_doc } = await request.json();

    if (!url_pdf || !Array.isArray(signers) || signers.length === 0) {
      return NextResponse.json({ error: 'Faltan datos: PDF o firmantes' }, { status: 400 });
    }

    const res = await fetch('https://api.zapsign.com.br/api/v1/docs/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZAPSIGN_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nombre_doc || 'Contrato subido',
        url_pdf,
        signers: signers.map((s: { nombre: string; email: string }) => ({
          name:  s.nombre,
          email: s.email,
        })),
        sandbox: true,
        send_automatic_email: true,
        lang: 'es',                  
        brand_name: 'ContratoYa'
      }),
    });

    if (!res.ok) throw new Error(`ZapSign error: ${await res.text()}`);

    const data = await res.json();
    const links = (data.signers ?? []).map((s: { name: string; sign_url: string }) => ({
      nombre: s.name,
      url:    s.sign_url,
    }));

    const url_original_permanente = data.original_file
      ? await guardarArchivoPermanente(data.original_file, `originales/${data.token}.pdf`)
      : null;

    return NextResponse.json({
      links,
      zapsign_token: data.token,
      url_original:  url_original_permanente ?? data.original_file,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al enviar el documento a firmar' }, { status: 500 });
  }
}