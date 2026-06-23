'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { PLANES, PlanId } from '@/lib/planes';

function ExitoContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [mensaje, setMensaje] = useState('Procesando tu pago...');
  const [sub,     setSub]     = useState('Verificando con Mercado Pago...');

  useEffect(() => {
    const plan      = searchParams.get('plan') as PlanId | null;
    const userId    = searchParams.get('userId');
    const paymentId = searchParams.get('payment_id');

    if (!plan || !userId || !PLANES[plan]) return;

    const activar = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const planInfo = PLANES[plan];

      if (paymentId) {
        const { data: yaExiste } = await supabase
          .from('pagos')
          .select('id')
          .eq('mp_payment_id', paymentId)
          .single();

        if (!yaExiste) {
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
            usuario_id:    userId,
            plan,
          });
        }
      }

      setMensaje(`¡Pago ${planInfo.nombre} exitoso!`);
      setSub(`Sumaste ${planInfo.creditos} contrato${planInfo.creditos !== 1 ? 's' : ''} con firma digital a tu cuenta.`);

      setTimeout(() => router.push('/generar'), 2500);
    };

    activar();
  }, [searchParams, router]);

  return (
    <main style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          {mensaje}
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>{sub}</p>
      </div>
    </main>
  );
}

export default function ExitoPage() {
  return (
    <Suspense>
      <ExitoContent />
    </Suspense>
  );
}