import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const {
      base64_pdf,
      prestador, email_prestador,
      cliente,   email_cliente,
      firmantes_extra = [], // ← garantes adicionales
      nombre_doc,
    } = await request.json();

    // Signers base: siempre locador/prestador + locatario/cliente
    const signers = [
      { name: prestador, email: email_prestador },
      { name: cliente,   email: email_cliente   },
      // Garantes con email cargado
      ...firmantes_extra
        .filter((f: { nombre: string; email: string }) => f.email)
        .map((f: { nombre: string; email: string }) => ({ name: f.nombre, email: f.email })),
    ];

    const res = await fetch('https://api.zapsign.com.br/api/v1/docs/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZAPSIGN_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: nombre_doc ?? `Contrato ${prestador} / ${cliente}`,
        signers,
        base64_pdf,
        sandbox: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ZapSign error: ${err}`);
    }

    const data = await res.json();
    const links = (data.signers ?? []).map((s: { name: string; sign_url: string }) => ({
      nombre: s.name,
      url:    s.sign_url,
    }));

    return NextResponse.json({ links });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al enviar a ZapSign' }, { status: 500 });
  }
}