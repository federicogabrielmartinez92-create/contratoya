'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PendienteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan      = searchParams.get('plan');
  const userId    = searchParams.get('userId');
  const paymentId = searchParams.get('payment_id');

  const [estado, setEstado] = useState<'pendiente' | 'aprobado'>('pendiente');
  const [verificando, setVerificando] = useState(false);

  const verificar = async () => {
    if (!plan || !userId || !paymentId) return;
    setVerificando(true);
    try {
      const res = await fetch('/api/pagar/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, plan, userId }),
      });
      const data = await res.json();
      if (data.status === 'approved') {
        setEstado('aprobado');
        setTimeout(() => router.push('/generar'), 2000);
      }
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    if (plan && userId && paymentId) verificar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '48px 40px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        {estado === 'aprobado' ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              ¡Tu pago se confirmó!
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>Te llevamos al generador...</p>
          </>
        ) : (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Pago pendiente
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              Tu pago está siendo procesado por Mercado Pago. Puede tardar algunas horas según el método elegido.
            </p>
            {plan && userId && paymentId && (
              <div style={{ marginBottom: '16px' }}>
                <button onClick={verificar} disabled={verificando}
                  style={{ padding: '10px 20px', borderRadius: '10px', background: '#F3E8FF', color: '#6B21A8', border: 'none', fontSize: '14px', fontWeight: 600, cursor: verificando ? 'wait' : 'pointer' }}>
                  {verificando ? '⏳ Revisando...' : '🔄 Verificar pago'}
                </button>
              </div>
            )}
            <button onClick={() => router.push('/generar')}
              style={{ padding: '12px 24px', borderRadius: '10px', background: '#F5A623', color: '#0A1628', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              Ir al generador
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function PendientePage() {
  return (
    <Suspense>
      <PendienteContent />
    </Suspense>
  );
}