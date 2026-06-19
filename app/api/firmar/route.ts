import { NextRequest, NextResponse } from 'next/server';
import { guardarArchivoPermanente } from '@/lib/zapsignStorage';
import { getZapsignConfig } from '@/lib/zapsignConfig';
import { enviarEmailFirma } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const {
      base64_pdf,
      prestador, email_prestador,
      cliente,   email_cliente,
      firmantes_extra = [],
      nombre_doc,
    } = await request.json();

    const signers = [
      { name: prestador, email: email_prestador },
      { name: cliente,   email: email_cliente   },
      ...firmantes_extra
        .filter((f: { nombre: string; email: string }) => f.email)
        .map((f: { nombre: string; email: string }) => ({ name: f.nombre, email: f.email })),
    ];

    const { url, token, sandbox } = getZapsignConfig();

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nombre_doc ?? `Contrato ${prestador} / ${cliente}`,
        signers,
        base64_pdf,
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

    // Enviar los emails de firma con nuestra propia marca
    const nombreDoc = nombre_doc ?? `Contrato ${prestador} / ${cliente}`;
    await Promise.all(
      links.map((link) =>
        enviarEmailFirma({
          destinatarioNombre: link.nombre,
          destinatarioEmail:  signers.find(s => s.name === link.nombre)?.email ?? '',
          signUrl:            link.url,
          nombreDocumento:    nombreDoc,
        })
      )
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
    return NextResponse.json({ error: 'Error al enviar a ZapSign' }, { status: 500 });
  }
}