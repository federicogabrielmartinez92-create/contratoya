import { NextRequest, NextResponse } from 'next/server';
import { guardarArchivoPermanente } from '@/lib/zapsignStorage';
import { getZapsignConfig } from '@/lib/zapsignConfig';
import { enviarEmailFirma } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { url_pdf, signers, nombre_doc } = await request.json();

    if (!url_pdf || !Array.isArray(signers) || signers.length === 0) {
      return NextResponse.json({ error: 'Faltan datos: PDF o firmantes' }, { status: 400 });
    }

    const { url, token, sandbox } = getZapsignConfig();

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nombre_doc || 'Contrato subido',
        url_pdf,
        signers: signers.map((s: { nombre: string; email: string }) => ({
          name:  s.nombre,
          email: s.email,
        })),
        sandbox,
        send_automatic_email: false, // ← lo mandamos nosotros con Resend
      }),
    });

    if (!res.ok) throw new Error(`ZapSign error: ${await res.text()}`);

    const data = await res.json();
    const links = (data.signers ?? []).map((s: { name: string; sign_url: string }) => ({
      nombre: s.name,
      url:    s.sign_url,
    }));

    const nombreDoc = nombre_doc || 'Contrato subido';
    await Promise.all(
      links.map((link) => {
        const firmanteOriginal = signers.find((s: { nombre: string; email: string }) => s.nombre === link.nombre);
        return enviarEmailFirma({
          destinatarioNombre: link.nombre,
          destinatarioEmail:  firmanteOriginal?.email ?? '',
          signUrl:            link.url,
          nombreDocumento:    nombreDoc,
        });
      })
    );

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