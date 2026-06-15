'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ExitoContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [mensaje, setMensaje] = useState('Procesando tu pago...');
  const [sub,     setSub]     = useState('Verificando con Mercado Pago...');

  useEffect(() => {
    const plan      = searchParams.get('plan');
    const userId    = searchParams.get('userId');
    const paymentId = searchParams.get('payment_id'); // MP lo agrega solo al redirigir

    if (!plan || !userId) return;

    const activar = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (paymentId) {
        // ── Chequear si el webhook ya procesó este pago ──
        const { data: yaExiste } = await supabase
          .from('pagos')
          .select('id')
          .eq('mp_payment_id', paymentId)
          .single();

        if (!yaExiste) {
          // Webhook no llegó aún → lo procesamos nosotros
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

          } else if (plan === 'pro') {
            await supabase
              .from('usuarios')
              .update({ plan: 'pro', contratos_mes: 0 })
              .eq('id', userId);
          }

          // Registrar para que el webhook no lo duplique
          await supabase.from('pagos').insert({
            mp_payment_id: paymentId,
            usuario_id:    userId,
            plan,
          });
        }
        // Si yaExiste → el webhook se adelantó, no hacemos nada
      }

      if (plan === 'express') {
        setMensaje('¡Pago Express exitoso!');
        setSub('Tu contrato con firma digital ya está disponible.');
      } else if (plan === 'pro') {
        setMensaje('¡Bienvenido al plan Pro!');
        setSub('Tus 15 contratos mensuales ya están activos.');
      }

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