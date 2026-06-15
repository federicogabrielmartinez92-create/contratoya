'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ExitoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mensaje, setMensaje] = useState('¡Pago exitoso!');
  const [sub,     setSub]     = useState('En segundos te redirigimos al generador.');

  useEffect(() => {
    const plan = searchParams.get('plan');

    if (plan === 'express') {
      setMensaje('¡Pago Express exitoso!');
      setSub('Tu contrato con firma digital ya está disponible.');
    } else if (plan === 'pro') {
      setMensaje('¡Bienvenido al plan Pro!');
      setSub('Tus 15 contratos mensuales ya están activos.');
    }

    // El webhook ya actualizó Supabase, solo redirigimos
    setTimeout(() => router.push('/generar'), 3000);
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