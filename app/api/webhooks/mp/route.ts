import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PLANES, PlanId } from '@/lib/planes';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.type !== 'payment') return NextResponse.json({ ok: true });

    const paymentId = String(body.data?.id);
    if (!paymentId) return NextResponse.json({ ok: true });

    const { data: yaExiste } = await supabase
      .from('pagos').select('id').eq('mp_payment_id', paymentId).single();
    if (yaExiste) return NextResponse.json({ ok: true });

    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });
    if (!mpRes.ok) return NextResponse.json({ error: 'MP error' }, { status: 500 });

    const pago = await mpRes.json();
    if (pago.status !== 'approved') return NextResponse.json({ ok: true });

    const ref = pago.external_reference as string;
    if (!ref) return NextResponse.json({ ok: true });

    const primerGuion = ref.indexOf('_');
    const plan   = ref.substring(0, primerGuion) as PlanId;
    const userId = ref.substring(primerGuion + 1);
    const planInfo = PLANES[plan];

    if (!planInfo || !userId) return NextResponse.json({ ok: true });

    const { data: usuario } = await supabase
      .from('usuarios').select('creditos_firma').eq('id', userId).single();

    await supabase
      .from('usuarios')
      .update({ creditos_firma: (usuario?.creditos_firma ?? 0) + planInfo.creditos, plan })
      .eq('id', userId);

    await supabase.from('pagos').insert({ mp_payment_id: paymentId, usuario_id: userId, plan });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}