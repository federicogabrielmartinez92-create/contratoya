'use client';

import { useState } from 'react';
import { useIsMobile } from '@/lib/useIsMobile';

const faqs = [
  {
    q: '¿La otra persona necesita tener una cuenta en ContratoYa?',
    a: 'No. Cada firmante recibe un email con su link personal de firma. No necesita registrarse, descargar nada ni crear una cuenta — entra, revisa el documento y firma desde el celular o la computadora.',
  },
  {
    q: '¿Es legalmente válida la firma electrónica?',
    a: 'Sí. Está reconocida por la Ley 25.506 y el artículo 288 del Código Civil y Comercial de la Nación. Cada firma queda respaldada por un registro de auditoría completo (dirección IP, fecha, hora y verificación por email de cada firmante), que sirve como prueba si el contrato se cuestiona en algún momento.',
  },
  {
    q: '¿Los créditos que compro vencen?',
    a: 'No. Comprás un paquete de créditos una sola vez y los usás cuando quieras, sin fecha límite. No es una suscripción mensual.',
  },
  {
    q: '¿Puedo usar mi propio contrato en vez de una plantilla?',
    a: 'Sí. Si ya tenés un PDF redactado, lo subís directamente y lo enviás a firmar digitalmente igual que si lo hubieras generado con nuestras plantillas.',
  },
];

export default function LandingPage() {
  const isMobile = useIsMobile();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const sec: React.CSSProperties = { padding: isMobile ? '56px 20px' : '88px 20px' };
  const wrap: React.CSSProperties = { maxWidth: '1080px', margin: '0 auto' };
  const h2: React.CSSProperties = { fontFamily: 'Space Grotesk, sans-serif', fontSize: isMobile ? '28px' : '38px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: '16px' };
  const pSub: React.CSSProperties = { fontSize: isMobile ? '15px' : '17px', color: '#6B7280', lineHeight: 1.6 };

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', color: '#111827' }}>

      {/* Nav */}
      <div style={{ background: '#0A1628', padding: isMobile ? '14px 16px' : '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: '#fff' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '24px' }}>
          {!isMobile && <a href="/precios" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Precios</a>}
          <a href="/auth/login" style={{ padding: '8px 18px', borderRadius: '8px', background: '#F5A623', color: '#0A1628', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            Ingresar
          </a>
        </div>
      </div>

      {/* ── 1. HERO ── */}
      <div style={{ background: '#0A1628', padding: isMobile ? '56px 20px 64px' : '100px 20px 110px', textAlign: 'center' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Contratos + Firma digital · Argentina
          </p>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: isMobile ? '34px' : '54px', fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '20px' }}>
            Generá o subí tu contrato.<br />Envialo a firmar. Listo.
          </h1>
          <p style={{ fontSize: isMobile ? '15px' : '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: '32px' }}>
            ContratoYa combina IA y firma electrónica para que freelancers, inmobiliarias y PYMES en Argentina cierren acuerdos sin abogados, sin papeles y sin vueltas.
          </p>
          <a href="/auth/login" style={{ display: 'inline-block', padding: isMobile ? '14px 28px' : '16px 36px', borderRadius: '10px', background: '#F5A623', color: '#0A1628', fontSize: isMobile ? '15px' : '16px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>
            Crear mi primer contrato gratis →
          </a>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '16px' }}>
            Sin tarjeta de crédito · 1 contrato gratis de por vida
          </p>
        </div>
      </div>

      {/* ── 2. CONFIANZA ── */}
      <div style={{ background: '#111827', padding: isMobile ? '20px 20px' : '24px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: isMobile ? '13px' : '14px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
          ⚖️ Contratos actualizados al Código Civil y Comercial y al DNU 70/2023 — sin cláusulas derogadas, sin sorpresas legales.
        </p>
      </div>

      {/* ── 3. CÓMO FUNCIONA ── */}
      <div style={{ ...sec, background: '#F8F9FB' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '64px' }}>
            <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Cómo funciona
            </p>
            <h2 style={h2}>De la idea al contrato firmado, en 3 pasos</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { n: '1', t: 'Generá con IA o subí tu PDF', d: 'Elegí una plantilla (servicios o alquiler) y completá los datos, o subí un contrato que ya tengas redactado.' },
              { n: '2', t: 'Enviá a firmar digitalmente', d: 'Cada parte recibe un email con su link personal. Firman desde el celular o la compu, sin imprimir nada.' },
              { n: '3', t: 'Descargá el contrato firmado', d: 'Desde tu panel privado, accedé al PDF original y al firmado cuando quieras — sin vencimiento.' },
            ].map(s => (
              <div key={s.n} style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFFBF0', color: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '16px', marginBottom: '16px' }}>
                  {s.n}
                </div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>{s.t}</h3>
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. BENEFICIOS ── */}
      <div style={{ ...sec, background: '#fff' }}>
        <div style={wrap}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '64px' }}>
            <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Por qué ContratoYa
            </p>
            <h2 style={h2}>Todo lo que necesitás, en un solo lugar</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
            {[
              { i: '📊', t: 'Tu panel de control', d: 'Mis contratos te muestra el estado de cada uno en tiempo real — generado, enviado a firmar o ya firmado — con descarga histórica disponible siempre.' },
              { i: '⚡', t: 'Dos formas de empezar', d: 'Usá nuestras plantillas legales con IA (servicios o alquiler), o subí un PDF que ya tengas redactado y mandalo a firmar igual.' },
              { i: '💰', t: 'Ahorrás tiempo y dinero', d: 'Lo que te cobraría armar un contrato a medida con un estudio jurídico, acá lo tenés listo en minutos, a una fracción del costo.' },
              { i: '🇦🇷', t: 'Pensado para Argentina', d: 'Cláusulas de mora, depósito, índices de actualización, garantías y jurisdicción — todo conforme a la normativa vigente, no a la derogada.' },
            ].map(b => (
              <div key={b.t} style={{ display: 'flex', gap: '16px', padding: '20px', borderRadius: '14px', background: '#F8F9FB' }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>{b.i}</div>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>{b.t}</h3>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.55, margin: 0 }}>{b.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. VALIDEZ LEGAL ── */}
      <div style={{ ...sec, background: '#0A1628' }}>
        <div style={{ ...wrap, maxWidth: '720px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Validez legal
          </p>
          <h2 style={{ ...h2, color: '#fff' }}>¿Es legal firmar un contrato así?</h2>
          <p style={{ fontSize: isMobile ? '15px' : '17px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '32px' }}>
            Sí. La firma electrónica está reconocida por la <strong style={{ color: '#fff' }}>Ley 25.506</strong> y el <strong style={{ color: '#fff' }}>artículo 288 del Código Civil y Comercial de la Nación</strong>. Cada firma queda respaldada por un registro de auditoría completo — dirección IP, fecha, hora y verificación por email de cada firmante — que funciona como prueba ante cualquier reclamo. Es la misma tecnología que usan miles de empresas en toda Latinoamérica para cerrar acuerdos sin papel.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px', textAlign: 'left' }}>
            {[
              { i: '📍', t: 'Registro de IP' },
              { i: '🕐', t: 'Fecha y hora exacta' },
              { i: '✉️', t: 'Verificación por email' },
            ].map(x => (
              <div key={x.t} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{x.i}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{x.t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 6. PRECIOS (teaser) ── */}
      <div style={{ ...sec, background: '#F8F9FB' }}>
        <div style={{ ...wrap, textAlign: 'center' }}>
          <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Precios
          </p>
          <h2 style={h2}>Comprás créditos, no te suscribís</h2>
          <p style={{ ...pSub, marginBottom: '40px' }}>
            Probá gratis. Después, elegí el paquete que te conviene — los créditos no vencen nunca.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '14px', marginBottom: '32px' }}>
            {[
              { t: 'Gratis', d: '1 contrato de prueba' },
              { t: 'Express', d: 'Comprá 1 cuando lo necesites' },
              { t: 'Pro', d: 'Paquete para varios clientes' },
              { t: 'Business', d: 'El mejor precio por contrato' },
            ].map(p => (
              <div key={p.t} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #EEF0F3' }}>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{p.t}</p>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{p.d}</p>
              </div>
            ))}
          </div>
          <a href="/precios" style={{ display: 'inline-block', padding: '13px 28px', borderRadius: '10px', background: '#0A1628', color: '#F5A623', fontSize: '14px', fontWeight: 600, textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>
            Ver todos los planes →
          </a>
        </div>
      </div>

      {/* ── 7. FAQ ── */}
      <div style={{ ...sec, background: '#fff' }}>
        <div style={{ ...wrap, maxWidth: '720px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <p style={{ fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#F5A623', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Preguntas frecuentes
            </p>
            <h2 style={h2}>Lo que la gente nos pregunta</h2>
          </div>
          {faqs.map((f, i) => (
            <div key={f.q} style={{ borderBottom: '1px solid #EEF0F3' }}>
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                style={{ width: '100%', textAlign: 'left', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827', fontFamily: 'Space Grotesk, sans-serif' }}>{f.q}</span>
                <span style={{ fontSize: '18px', color: '#F5A623', flexShrink: 0 }}>{faqOpen === i ? '−' : '+'}</span>
              </button>
              {faqOpen === i && (
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, margin: '0 0 20px' }}>{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. CTA FINAL + FOOTER ── */}
      <div style={{ background: '#0A1628', padding: isMobile ? '56px 20px' : '88px 20px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: isMobile ? '26px' : '36px', fontWeight: 700, color: '#fff', marginBottom: '16px', letterSpacing: '-0.5px' }}>
          Tu próximo contrato, listo en minutos.
        </h2>
        <a href="/auth/login" style={{ display: 'inline-block', padding: isMobile ? '14px 28px' : '16px 36px', borderRadius: '10px', background: '#F5A623', color: '#0A1628', fontSize: '15px', fontWeight: 700, textDecoration: 'none', fontFamily: 'Space Grotesk, sans-serif' }}>
          Empezar gratis →
        </a>
      </div>

      <div style={{ background: '#0A1628', borderTop: '1px solid rgba(255,255,255,0.08)', padding: isMobile ? '24px 20px' : '28px 5%', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '16px' : 0 }}>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: '#fff' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </span>
        <div style={{ display: 'flex', gap: isMobile ? '16px' : '20px', flexWrap: 'wrap' }}>
          <a href="/precios" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Precios</a>
          <a href="/auth/login" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Ingresar</a>
          <a href="mailto:soporte@contratoya.app" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>soporte@contratoya.app</a>
        </div>
      </div>
    </main>
  );
}