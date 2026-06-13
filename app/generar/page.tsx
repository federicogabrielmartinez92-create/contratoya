'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const campos = [
  { name: 'prestador',      label: 'Tu nombre completo *',   placeholder: 'Ej: Martín González',            span: 1 },
  { name: 'cliente',        label: 'Nombre del cliente *',   placeholder: 'Ej: Empresa XYZ SRL',            span: 1 },
  { name: 'cuit_prestador', label: 'Tu CUIT *',              placeholder: 'Ej: 20-12345678-9',              span: 1 },
  { name: 'cuit_cliente',   label: 'CUIT del cliente',       placeholder: 'Ej: 30-98765432-1',              span: 1 },
  { name: 'servicio',       label: 'Servicio contratado *',  placeholder: 'Ej: Diseño de identidad visual', span: 2 },
  { name: 'monto',          label: 'Monto acordado *',       placeholder: 'Ej: $280.000',                   span: 1 },
  { name: 'plazo',          label: 'Plazo de entrega',       placeholder: 'Ej: 30 días corridos',           span: 1 },
  { name: 'ciudad',         label: 'Ciudad',                 placeholder: 'Ej: Buenos Aires',               span: 1 },
  { name: 'fecha',          label: 'Fecha',                  placeholder: 'Ej: 10/06/2026',                 span: 1 },
];

interface Usuario {
  id: string;
  email: string;
  plan: string;
  contratos_usados: number;
  contratos_mes: number;
}

export default function GenerarPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const [form, setForm] = useState<Record<string, string>>({
    prestador: '', cliente: '', cuit_prestador: '', cuit_cliente: '',
    servicio: '', monto: '', plazo: '', ciudad: '',
    fecha: new Date().toLocaleDateString('es-AR'),
    condiciones_pago: '50% adelanto / 50% al entregar',
    moneda: 'ARS', email_prestador: '', email_cliente: '',
  });

  const [conFirma, setConFirma] = useState(false);
  const [contrato, setContrato] = useState('');
  const [links,    setLinks]    = useState<{ nombre: string; url: string }[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [tiempo,   setTiempo]   = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setUsuario(data);
      } else {
        // Si no existe el usuario en la tabla, lo creamos
        await supabase.from('usuarios').insert({ id: user.id, email: user.email });
        setUsuario({ id: user.id, email: user.email!, plan: 'gratis', contratos_usados: 0, contratos_mes: 0 });
      }
      setCargando(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const crearPDF = (texto: string) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const mx = 50; const lh = 14;
    const lines = doc.splitTextToSize(texto, W - mx * 2) as string[];
    let y = mx + lh;
    lines.forEach((line) => {
      if (y > H - mx) { doc.addPage(); y = mx + lh; }
      doc.text(line, mx, y); y += lh;
    });
    return doc;
  };

  const generarPDFBase64 = (texto: string) =>
    crearPDF(texto).output('datauristring').split(',')[1];

  const handleDescargar = () =>
    crearPDF(contrato).save(`contrato-${form.cliente.replace(/\s+/g, '-').toLowerCase()}.pdf`);

  const handleGenerar = async () => {
    if (!usuario) return;

    // Verificar límites del plan
    if (usuario.plan === 'gratis' && usuario.contratos_usados >= 1) {
      setError('Ya usaste tu contrato gratuito. Elegí un plan para continuar.');
      return;
    }
    if (usuario.plan === 'pro' && usuario.contratos_mes >= 15) {
      setError('Llegaste al límite de 15 contratos del plan Pro este mes.');
      return;
    }
    if (conFirma && usuario.plan === 'gratis') {
      setError('La firma digital no está disponible en el plan gratuito.');
      return;
    }

    if (!form.prestador || !form.cliente || !form.servicio || !form.monto || !form.cuit_prestador) {
      setError('Completá los campos obligatorios (*)'); return;
    }
    if (conFirma && (!form.email_prestador || !form.email_cliente)) {
      setError('Para la firma digital necesitás ingresar ambos emails'); return;
    }

    setLoading(true); setError('');
    const inicio = Date.now();

    try {
      const res1 = await fetch('/api/generar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data1 = await res1.json();
      if (data1.error) throw new Error(data1.error);
      setContrato(data1.contrato);

      if (conFirma) {
        const base64_pdf = generarPDFBase64(data1.contrato);
        const res2 = await fetch('/api/firmar', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64_pdf, prestador: form.prestador, email_prestador: form.email_prestador, cliente: form.cliente, email_cliente: form.email_cliente }),
        });
        const data2 = await res2.json();
        if (data2.error) throw new Error(data2.error);
        setLinks(data2.links ?? []);
      }

      // Incrementar contador
      await supabase.from('usuarios').update({
        contratos_usados: usuario.contratos_usados + 1,
        contratos_mes: usuario.contratos_mes + 1,
      }).eq('id', usuario.id);
      setUsuario({ ...usuario, contratos_usados: usuario.contratos_usados + 1, contratos_mes: usuario.contratos_mes + 1 });

      setTiempo(Math.round((Date.now() - inicio) / 1000));
    } catch {
      setError('Hubo un error al generar el contrato. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' };
  const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' };

  if (cargando) return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#6B7280' }}>Cargando...</p>
    </main>
  );

  const planColor = usuario?.plan === 'pro' ? '#7C3AED' : usuario?.plan === 'express' ? '#0EA5E9' : '#6B7280';
  const planLabel = usuario?.plan === 'pro' ? 'Pro' : usuario?.plan === 'express' ? 'Express' : 'Gratis';

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', padding: '0', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0A1628', padding: '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '100px', background: planColor, color: '#fff' }}>
            Plan {planLabel}
          </span>
          {usuario?.plan === 'gratis' && (
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              {usuario.contratos_usados}/1 contratos
            </span>
          )}
          {usuario?.plan === 'pro' && (
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              {usuario.contratos_mes}/15 este mes
            </span>
          )}
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{usuario?.email}</span>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>

        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Generá tu contrato
        </h1>
        <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '32px' }}>
          Completá los datos y la IA genera tu contrato en segundos.
        </p>

        {/* Banner límite gratis */}
        {usuario?.plan === 'gratis' && usuario.contratos_usados >= 1 && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', margin: '0 0 2px' }}>Ya usaste tu contrato gratuito</p>
              <p style={{ fontSize: '13px', color: '#B45309', margin: 0 }}>Elegí un plan para seguir generando contratos</p>
            </div>
            <a href="#planes" style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', background: '#FDE68A', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>
              Ver planes →
            </a>
          </div>
        )}

        {!contrato ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              {[
                { val: false, label: '📄  Solo PDF', desc: usuario?.plan === 'gratis' ? 'Plan gratuito' : 'Descarga directa' },
                { val: true,  label: '✍️  Con firma digital', desc: usuario?.plan === 'gratis' ? 'Requiere plan Express o Pro' : '$3.99 USD · Ambas partes firman online' },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => setConFirma(opt.val)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: conFirma === opt.val ? '2px solid #F5A623' : '1.5px solid #E5E7EB', background: conFirma === opt.val ? '#FFFBF0' : '#fff', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{opt.label}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {campos.map((c) => (
                <div key={c.name} style={{ gridColumn: c.span === 2 ? 'span 2' : 'span 1' }}>
                  <label style={lbl}>{c.label}</label>
                  <input name={c.name} value={form[c.name]} onChange={handleChange} placeholder={c.placeholder} style={inp} />
                </div>
              ))}

              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>Condiciones de pago</label>
                <input name="condiciones_pago" value={form.condiciones_pago} onChange={handleChange} placeholder="Ej: 50% adelanto / 50% al entregar" style={inp} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={lbl}>Moneda del contrato</label>
                <select name="moneda" value={form.moneda} onChange={handleChange} style={{ ...inp, background: 'white' }}>
                  <option value="ARS">Pesos argentinos (ARS)</option>
                  <option value="USD">Dólares estadounidenses (USD)</option>
                  <option value="USDT">Dólares digitales (USDT)</option>
                </select>
              </div>

              {conFirma && (
                <div style={{ gridColumn: 'span 2', background: '#F0FDF4', borderRadius: '10px', padding: '16px', border: '1px solid #BBF7D0' }}>
                  <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 12px', fontWeight: 500 }}>✓ Ambas partes recibirán un email para firmar digitalmente.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={lbl}>Tu email *</label>
                      <input name="email_prestador" value={form.email_prestador} onChange={handleChange} placeholder="tu@email.com" type="email" style={inp} />
                    </div>
                    <div>
                      <label style={lbl}>Email del cliente *</label>
                      <input name="email_cliente" value={form.email_cliente} onChange={handleChange} placeholder="cliente@empresa.com" type="email" style={inp} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '16px' }}>{error}</p>}

            <button onClick={handleGenerar} disabled={loading || (usuario?.plan === 'gratis' && usuario.contratos_usados >= 1)}
              style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '10px', background: (loading || (usuario?.plan === 'gratis' && usuario.contratos_usados >= 1)) ? '#9CA3AF' : '#F5A623', color: '#0A1628', border: 'none', fontSize: '16px', fontWeight: 600, cursor: (loading || (usuario?.plan === 'gratis' && usuario.contratos_usados >= 1)) ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              {loading ? '⏳  Generando...' : conFirma ? '✍️  Generar y enviar a firmar' : '⚡  Generar contrato'}
            </button>
          </div>

        ) : (
          <div>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 600, color: '#111827', margin: 0 }}>✅ Contrato generado</h2>
                  <p style={{ color: '#16A34A', fontSize: '13px', marginTop: '4px' }}>Generado en {tiempo}s · Conforme a la ley argentina</p>
                </div>
                <button onClick={handleDescargar}
                  style={{ padding: '10px 22px', borderRadius: '8px', background: '#0A1628', color: '#F5A623', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
                  ↓ Descargar PDF
                </button>
              </div>

              {links.length > 0 && (
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803D', margin: '0 0 16px' }}>✍️ Links para firma digital</p>
                  {links.map((link) => (
                    <div key={link.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #BBF7D0' }}>
                      <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{link.nombre}</span>
                      <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#15803D', textDecoration: 'none', background: '#DCFCE7', padding: '6px 14px', borderRadius: '6px', fontWeight: 500 }}>Firmar →</a>
                    </div>
                  ))}
                </div>
              )}

              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.9', color: '#374151', fontFamily: 'Georgia, serif', borderTop: '1px solid #F3F4F6', paddingTop: '24px', margin: 0 }}>
                {contrato}
              </pre>
            </div>
            <button onClick={() => { setContrato(''); setLinks([]); }}
              style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
              ← Generar otro contrato
            </button>
          </div>
        )}
      </div>
    </main>
  );
}