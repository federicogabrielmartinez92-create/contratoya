import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, userEmail } = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://contratoya.app';

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const preference = new Preference(client);

    if (plan === 'express') {
      const response = await preference.create({
        body: {
          items: [{
            id: 'express',
            title: 'ContratoYa Express — Contrato con firma digital',
            quantity: 1,
            unit_price: 3.99,
            currency_id: 'USD',
          }],
          payer: { email: userEmail },
          back_urls: {
            success: `${baseUrl}/pago/exito?plan=express&userId=${userId}`,
            failure: `${baseUrl}/pago/error`,
            pending: `${baseUrl}/pago/pendiente`,
          },
          back_urls: {
            success: `${baseUrl}/pago/exito?plan=express&userId=${userId}`,
            failure: `${baseUrl}/pago/error`,
            pending: `${baseUrl}/pago/pendiente`,
                        },
            ...(baseUrl.includes('localhost') ? {} : { auto_return: 'approved' }),
            external_reference: `express_${userId}`,
        },
      });
      return NextResponse.json({ url: response.init_point });
    }

    if (plan === 'pro') {
      const response = await preference.create({
        body: {
          items: [{
            id: 'pro',
            title: 'ContratoYa Pro — Suscripción mensual',
            quantity: 1,
            unit_price: 19.90,
            currency_id: 'USD',
          }],
          payer: { email: userEmail },
          back_urls: {
            success: `${baseUrl}/pago/exito?plan=pro&userId=${userId}`,
            failure: `${baseUrl}/pago/error`,
            pending: `${baseUrl}/pago/pendiente`,
          },
          back_urls: {
            success: `${baseUrl}/pago/exito?plan=pro&userId=${userId}`,
            failure: `${baseUrl}/pago/error`,
            pending: `${baseUrl}/pago/pendiente`,
            },
            ...(baseUrl.includes('localhost') ? {} : { auto_return: 'approved' }),
            external_reference: `pro_${userId}`,
        },
      });
      return NextResponse.json({ url: response.init_point });
    }

    return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 });
  }
}