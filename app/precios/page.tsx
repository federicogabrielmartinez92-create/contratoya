'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function PreciosPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<{ id: string; email: string; plan: string } | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single();
      if (data) setUsuario(data);
    };
    init();
  }, []);

  const handlePago = async (plan: 'express' | 'pro') => {
    if (!usuario) { router.push('/auth/login'); return; }
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: usuario.id, userEmail: usuario.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert('Error al procesar el pago. Intentá de nuevo.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const planActual = usuario?.plan ?? null;

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <div style={{ background: '#0A1628', padding: '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </a>
        {usuario && (
          <a href="/generar" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            ← Volver al generador
          </a>
        )}
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Precios
          </p>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 700, color: '#111827', letterSpacing: '-1px', marginBottom: '12px' }}>
            Simple y transparente
          </h1>
          <p style={{ fontSize: '17px', color: '#6B7280' }}>
            Empezá gratis. Pagá solo cuando lo necesites.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' }}>

          {/* Plan Gratis */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', minHeight: '480px', display: 'flex', flexDirection: 'column', border: planActual === 'gratis' ? '2px solid #F5A623' : '1.5px solid #EEF0F3', position: 'relative' }}>
            {planActual === 'gratis' && (
              <div style={{ position: 'absolute', top: '-12px', left: '24px', background: '#F5A623', color: '#0A1628', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px' }}>
                TU PLAN ACTUAL
              </div>
            )}
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>Gratis</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              $0 <span style={{ fontSize: '16px', fontWeight: 400, color: '#9CA3AF' }}>/ siempre</span>
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Para que pruebes el producto.</p>
            <ul style={{ listStyle: 'none', marginBottom: '28px', flex: 1 }}>
              {['1 contrato de por vida', 'Descarga en PDF', 'Cláusulas esenciales', 'Sin tarjeta de crédito'].map(f => (
                <li key={f} style={{ fontSize: '13px', color: '#111827', padding: '6px 0', borderBottom: '1px solid #EEF0F3', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button disabled style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: '#EEF0F3', color: '#9CA3AF', border: 'none', cursor: 'not-allowed' }}>
              {planActual === 'gratis' ? 'Plan actual' : 'Gratis siempre'}
            </button>
          </div>

          {/* Plan Express */}
          <div style={{ background: '#0A1628', borderRadius: '20px', padding: '32px', minHeight: '480px', display: 'flex', flexDirection: 'column', border: planActual === 'express' ? '2px solid #F5A623' : '2px solid #0A1628', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '24px', background: '#F5A623', color: '#0A1628', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px' }}>
              {planActual === 'express' ? 'TU PLAN ACTUAL' : 'MÁS POPULAR'}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>Express</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
              $3.99 <span style={{ fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>USD / doc</span>
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>Pagás solo cuando generás.</p>
            <ul style={{ listStyle: 'none', marginBottom: '28px', flex: 1 }}>
              {['Contrato completo en PDF', 'Firma digital incluida', 'Válido legalmente en Argentina', 'Audit trail y certificado'].map(f => (
                <li key={f} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePago('express')}
              disabled={loadingPlan === 'express'}
              style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: '#F5A623', color: '#0A1628', border: 'none', cursor: 'pointer' }}>
              {loadingPlan === 'express' ? 'Procesando...' : 'Comprar → $3.99 USD'}
            </button>
          </div>

          {/* Plan Pro */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', minHeight: '480px', display: 'flex', flexDirection: 'column', border: planActual === 'pro' ? '2px solid #7C3AED' : '1.5px solid #EEF0F3', position: 'relative' }}>
            {planActual === 'pro' && (
              <div style={{ position: 'absolute', top: '-12px', left: '24px', background: '#7C3AED', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px' }}>
                TU PLAN ACTUAL
              </div>
            )}
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>Pro</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              $19.90 <span style={{ fontSize: '16px', fontWeight: 400, color: '#9CA3AF' }}>USD / mes</span>
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '24px' }}>Para freelancers con múltiples clientes.</p>
            <ul style={{ listStyle: 'none', marginBottom: '28px', flex: 1 }}>
              {['Contratos ilimitados', 'Hasta 15 firmas digitales/mes', 'Historial de contratos', 'Todos los rubros', 'Soporte prioritario'].map(f => (
                <li key={f} style={{ fontSize: '13px', color: '#111827', padding: '6px 0', borderBottom: '1px solid #EEF0F3', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handlePago('pro')}
              disabled={loadingPlan === 'pro' || planActual === 'pro'}
              style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: planActual === 'pro' ? '#EEF0F3' : '#7C3AED', color: planActual === 'pro' ? '#9CA3AF' : '#fff', border: 'none', cursor: planActual === 'pro' ? 'not-allowed' : 'pointer' }}>
              {loadingPlan === 'pro' ? 'Procesando...' : planActual === 'pro' ? 'Plan actual' : 'Suscribirme → $19.90 USD'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}