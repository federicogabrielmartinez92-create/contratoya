import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLANES, PlanId } from '@/lib/planes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { paymentId, plan, userId } = await request.json();

    if (!paymentId || !plan || !userId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    const planInfo = PLANES[plan as PlanId];
    if (!planInfo) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
    }

    // Idempotencia: ¿ya procesamos este pago?
    const { data: yaExiste } = await supabase
      .from('pagos')
      .select('id')
      .eq('mp_payment_id', paymentId)
      .single();

    if (yaExiste) {
      return NextResponse.json({ status: 'approved', yaProcesado: true });
    }

    // Verificar con MP de verdad — nunca confiar ciegamente en el query param
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      return NextResponse.json({ error: 'Error al verificar con Mercado Pago' }, { status: 500 });
    }

    const pago = await mpRes.json();

    // El pago tiene que corresponder EXACTAMENTE a este plan y usuario
    if (pago.external_reference !== `${plan}_${userId}`) {
      return NextResponse.json({ error: 'El pago no corresponde a este plan/usuario' }, { status: 400 });
    }

    if (pago.status !== 'approved') {
      return NextResponse.json({ status: pago.status, yaProcesado: false });
    }

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('creditos_firma')
      .eq('id', userId)
      .single();

    await supabase
      .from('usuarios')
      .update({
        creditos_firma: (usuario?.creditos_firma ?? 0) + planInfo.creditos,
        plan,
      })
      .eq('id', userId);

    await supabase.from('pagos').insert({
      mp_payment_id: paymentId,
      usuario_id: userId,
      plan,
    });

    return NextResponse.json({ status: 'approved', yaProcesado: false, creditos: planInfo.creditos });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al verificar el pago' }, { status: 500 });
  }
}