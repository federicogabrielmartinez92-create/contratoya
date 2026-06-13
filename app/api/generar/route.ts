import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prestador, cuit_prestador, cliente, cuit_cliente, servicio, monto, moneda, plazo, ciudad, fecha, condiciones_pago } = body;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Generá un contrato profesional de prestación de servicios para freelancer argentino.

DATOS:
- Prestador: ${prestador} (CUIT: ${cuit_prestador})
- Cliente: ${cliente} (CUIT: ${cuit_cliente})
- Servicio: ${servicio}
- Monto: ${monto} ${moneda}
- Plazo de entrega: ${plazo}
- Ciudad: ${ciudad || 'Buenos Aires'}
- Fecha: ${fecha}
- Condiciones de pago: ${condiciones_pago}

INSTRUCCIONES:
- Español formal argentino
- Conforme al Código Civil y Comercial de la Nación Argentina
- Incluir: objeto, honorarios y forma de pago (${condiciones_pago}), plazo, propiedad intelectual, confidencialidad, mora (2% mensual), rescisión, jurisdicción en ${ciudad || 'Buenos Aires'}
- Espacios para firmas al final con nombre y aclaración
- Solo el texto del contrato, sin comentarios adicionales
- NO uses markdown: sin asteriscos, sin ##, sin ---. Títulos en MAYÚSCULAS.`,
      }],
    });

    const contrato = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ contrato });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al generar el contrato' }, { status: 500 });
  }
}