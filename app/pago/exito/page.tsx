'use client';

import { useEffect, useState } from 'react';
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
      const planInfo = PLANES[plan];

      if (paymentId) {
        try {
          const res = await fetch('/api/pagar/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId, plan, userId }),
          });
          const data = await res.json();

          if (data.status === 'approved') {
            setMensaje(`¡Pago ${planInfo.nombre} exitoso!`);
            setSub(`Sumaste ${planInfo.creditos} contrato${planInfo.creditos !== 1 ? 's' : ''} con firma digital a tu cuenta.`);
          } else {
            setMensaje('Tu pago está en revisión');
            setSub('Te avisamos apenas se confirme.');
          }
        } catch {
          setMensaje('Hubo un problema al verificar el pago');
          setSub('Si ya pagaste, contactanos y lo resolvemos.');
        }
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