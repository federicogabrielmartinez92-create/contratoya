import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role: bypasea RLS, solo para uso servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP manda varios tipos de notificación, solo nos interesan pagos
    if (body.type !== 'payment') return NextResponse.json({ ok: true });

    const paymentId = String(body.data?.id);
    if (!paymentId) return NextResponse.json({ ok: true });

    // ── Idempotencia: ¿ya procesamos este pago? ──
    const { data: yaExiste } = await supabase
      .from('pagos')
      .select('id')
      .eq('mp_payment_id', paymentId)
      .single();

    if (yaExiste) {
      console.log(`Pago ${paymentId} ya procesado, ignorando.`);
      return NextResponse.json({ ok: true });
    }

    // ── Verificar con MP API que el pago es real y aprobado ──
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    });

    if (!mpRes.ok) {
      console.error('Error consultando MP:', await mpRes.text());
      return NextResponse.json({ error: 'MP error' }, { status: 500 });
    }

    const pago = await mpRes.json();

    if (pago.status !== 'approved') {
      console.log(`Pago ${paymentId} no aprobado (status: ${pago.status}), ignorando.`);
      return NextResponse.json({ ok: true });
    }

    // ── Parsear external_reference: "express_uuid" o "pro_uuid" ──
    const ref = pago.external_reference as string;
    if (!ref) return NextResponse.json({ ok: true });

    const primerGuion = ref.indexOf('_');
    const plan   = ref.substring(0, primerGuion);          // "express" | "pro"
    const userId = ref.substring(primerGuion + 1);         // UUID del usuario

    if (!plan || !userId) return NextResponse.json({ ok: true });

    // ── Actualizar Supabase según el plan ──
    if (plan === 'express') {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('creditos_express')
        .eq('id', userId)
        .single();

      await supabase
        .from('usuarios')
        .update({ creditos_express: (usuario?.creditos_express ?? 0) + 1 })
        .eq('id', userId);

      console.log(`Express activado para usuario ${userId}`);

    } else if (plan === 'pro') {
      await supabase
        .from('usuarios')
        .update({ plan: 'pro', contratos_mes: 0 })
        .eq('id', userId);

      console.log(`Pro activado para usuario ${userId}`);
    }

    // ── Registrar pago procesado (evita reprocesar) ──
    await supabase.from('pagos').insert({
      mp_payment_id: paymentId,
      usuario_id:    userId,
      plan,
    });

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}