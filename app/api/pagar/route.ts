import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { PLANES, PlanId } from '@/lib/planes';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, userEmail } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://contratoya.app';

    const planInfo = PLANES[plan as PlanId];
    if (!planInfo) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [{
          id: plan,
          title: planInfo.titulo,
          quantity: 1,
          unit_price: planInfo.precio,
          currency_id: 'USD',
        }],
        payer: { email: userEmail },
        notification_url: 'https://contratoya.app/api/webhooks/mp',
        back_urls: {
          success: `${baseUrl}/pago/exito?plan=${plan}&userId=${userId}`,
          failure: `${baseUrl}/pago/error`,
          pending: `${baseUrl}/pago/pendiente?plan=${plan}&userId=${userId}`,
        },
        ...(baseUrl.includes('localhost') ? {} : { auto_return: 'approved' }),
        external_reference: `${plan}_${userId}`,
      },
    });

    return NextResponse.json({ url: response.init_point });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 });
  }
}