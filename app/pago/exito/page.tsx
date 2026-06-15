'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function ExitoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mensaje, setMensaje] = useState('Procesando tu pago...');

  useEffect(() => {
    const plan   = searchParams.get('plan');
    const userId = searchParams.get('userId');

    if (!plan || !userId) return;

    const activar = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

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

        setMensaje('¡Pago exitoso! Tenés 1 contrato Express con firma disponible.');

      } else if (plan === 'pro') {
        await supabase
          .from('usuarios')
          .update({ plan: 'pro', contratos_mes: 0 })
          .eq('id', userId);

        setMensaje('¡Pago exitoso! Tu plan Pro fue activado.');
      }

      setTimeout(() => router.push('/generar'), 2500);
    };

    activar();
  }, [searchParams, router]);

  return (
    <main style={{ minHeight:'100vh', background:'#0A1628', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'48px 40px', maxWidth:'420px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>🎉</div>
        <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'24px', fontWeight:700, color:'#111827', marginBottom:'8px' }}>
          {mensaje}
        </h1>
        <p style={{ fontSize:'14px', color:'#6B7280' }}>
          En segundos te redirigimos al generador.
        </p>
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