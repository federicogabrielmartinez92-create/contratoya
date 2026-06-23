'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { PLANES, PlanId } from '@/lib/planes';
import { useIsMobile } from '@/lib/useIsMobile';

export default function PreciosPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [usuario, setUsuario] = useState<{ id: string; email: string; plan: string; creditos_firma: number } | null>(null);
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

  const handlePago = async (plan: PlanId) => {
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

  const creditosActuales = usuario?.creditos_firma ?? 0;
  const esGratis = !usuario || creditosActuales === 0;

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>

      {/* Nav */}
      <div style={{ background: '#0A1628', padding: isMobile ? '12px 16px' : '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </a>
        {usuario && (
          <a href="/generar" style={{ fontSize: isMobile ? '12px' : '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>
            ← Volver
          </a>
        )}
      </div>

      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: isMobile ? '32px 16px' : '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '56px' }}>
          <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Precios
          </p>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: isMobile ? '28px' : '40px', fontWeight: 700, color: '#111827', letterSpacing: '-1px', marginBottom: '12px' }}>
            Simple y transparente
          </h1>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#6B7280' }}>
            Empezá gratis. Comprá créditos cuando los necesites — nunca vencen.
          </p>
          {usuario && creditosActuales > 0 && (
            <p style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 600, marginTop: '12px' }}>
              Hoy tenés {creditosActuales} crédito{creditosActuales !== 1 ? 's' : ''} disponible{creditosActuales !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px', alignItems: 'start' }}>

          {/* Plan Gratis */}
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', minHeight: isMobile ? 'auto' : '460px', display: 'flex', flexDirection: 'column', border: esGratis ? '2px solid #F5A623' : '1.5px solid #EEF0F3', position: 'relative' }}>
            {esGratis && (
              <div style={{ position: 'absolute', top: '-12px', left: '20px', background: '#F5A623', color: '#0A1628', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px' }}>
                TU PLAN ACTUAL
              </div>
            )}
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>Gratis</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '34px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>$0</p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Para que pruebes el producto.</p>
            <ul style={{ listStyle: 'none', marginBottom: '24px', flex: 1, padding: 0 }}>
              {['1 contrato de por vida', 'Descarga en PDF', 'Cláusulas esenciales', 'Sin tarjeta de crédito'].map(f => (
                <li key={f} style={{ fontSize: '13px', color: '#111827', padding: '6px 0', borderBottom: '1px solid #EEF0F3', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <button disabled style={{ display: 'block', width: '100%', textAlign: 'center', padding: '13px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: '#EEF0F3', color: '#9CA3AF', border: 'none', cursor: 'not-allowed' }}>
              Gratis siempre
            </button>
          </div>

          {/* Planes pagos */}
          {Object.entries(PLANES).map(([id, info]) => {
            const esOscuro = info.destacado;
            return (
              <div key={id} style={{
                background: esOscuro ? '#0A1628' : '#fff',
                borderRadius: '20px', padding: '28px', minHeight: isMobile ? 'auto' : '460px',
                display: 'flex', flexDirection: 'column',
                border: `2px solid ${esOscuro ? '#0A1628' : info.color}`,
                position: 'relative',
              }}>
                {info.destacado && (
                  <div style={{ position: 'absolute', top: '-12px', left: '20px', background: '#F5A623', color: '#0A1628', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px' }}>
                    MÁS POPULAR
                  </div>
                )}
                <p style={{ fontSize: '13px', fontWeight: 600, color: esOscuro ? 'rgba(255,255,255,0.5)' : '#6B7280', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: '12px' }}>
                  {info.nombre}
                </p>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '34px', fontWeight: 700, color: esOscuro ? '#fff' : '#111827', marginBottom: '4px' }}>
                  ${info.precio}
                </p>
                <p style={{ fontSize: '12px', color: esOscuro ? 'rgba(255,255,255,0.5)' : '#9CA3AF', marginBottom: '4px' }}>
                  {info.creditos} contrato{info.creditos !== 1 ? 's' : ''} con firma
                </p>
                <p style={{ fontSize: '13px', color: esOscuro ? 'rgba(255,255,255,0.6)' : '#6B7280', marginBottom: '20px' }}>
                  {info.descripcion}
                </p>
                <ul style={{ listStyle: 'none', marginBottom: '24px', flex: 1, padding: 0 }}>
                  {info.features.map(f => (
                    <li key={f} style={{ fontSize: '13px', color: esOscuro ? 'rgba(255,255,255,0.85)' : '#111827', padding: '6px 0', borderBottom: esOscuro ? '1px solid rgba(255,255,255,0.1)' : '1px solid #EEF0F3', display: 'flex', gap: '8px' }}>
                      <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePago(id as PlanId)}
                  disabled={loadingPlan === id}
                  style={{
                    display: 'block', width: '100%', textAlign: 'center', padding: '13px', borderRadius: '10px',
                    fontSize: '14px', fontWeight: 600,
                    background: esOscuro ? '#F5A623' : info.color,
                    color: esOscuro ? '#0A1628' : '#fff',
                    border: 'none', cursor: 'pointer',
                  }}>
                  {loadingPlan === id ? 'Procesando...' : `Comprar → $${info.precio} USD`}
                </button>
              </div>
            );
          })}

        </div>
      </div>
    </main>
  );
}