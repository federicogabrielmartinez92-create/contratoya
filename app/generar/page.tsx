'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

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

export default function GenerarPage() {
  const [form, setForm] = useState<Record<string, string>>({
    prestador: '', cliente: '', cuit_prestador: '', cuit_cliente: '',
    servicio: '', monto: '', plazo: '', ciudad: '',
    fecha: new Date().toLocaleDateString('es-AR'),
    condiciones_pago: '50% adelanto / 50% al entregar',
    moneda: 'ARS',
    email_prestador: '',
    email_cliente: '',
  });

  const [conFirma, setConFirma] = useState(false);
  const [contrato, setContrato] = useState('');
  const [links,    setLinks]    = useState<{ nombre: string; url: string }[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [tiempo,   setTiempo]   = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const crearPDF = (texto: string) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const W     = doc.internal.pageSize.getWidth();
  const H     = doc.internal.pageSize.getHeight();
  const mx    = 50;
  const lh    = 14;
  const lines = doc.splitTextToSize(texto, W - mx * 2) as string[];
  let y = mx + lh;
  lines.forEach((line) => {
    if (y > H - mx) { doc.addPage(); y = mx + lh; }
    doc.text(line, mx, y);
    y += lh;
  });
  return doc;
};

const generarPDFBase64 = (texto: string): string =>
  crearPDF(texto).output('datauristring').split(',')[1];

const handleDescargar = () =>
  crearPDF(contrato).save(`contrato-${form.cliente.replace(/\s+/g, '-').toLowerCase()}.pdf`);

  const handleGenerar = async () => {
    if (!form.prestador || !form.cliente || !form.servicio || !form.monto || !form.cuit_prestador) {
      setError('Completá los campos obligatorios (*)'); return;
    }
    if (conFirma && (!form.email_prestador || !form.email_cliente)) {
      setError('Para la firma digital necesitás ingresar ambos emails'); return;
    }
    setLoading(true); setError('');
    const inicio = Date.now();

    try {
      // Paso 1: generar contrato con IA
      const res1  = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data1 = await res1.json();
      if (data1.error) throw new Error(data1.error);
      setContrato(data1.contrato);

      // Paso 2: si eligió firma digital, generar PDF y enviarlo a ZapSign
      if (conFirma) {
        const base64_pdf = generarPDFBase64(data1.contrato);
        const res2  = await fetch('/api/firmar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64_pdf,
            prestador:       form.prestador,
            email_prestador: form.email_prestador,
            cliente:         form.cliente,
            email_cliente:   form.email_cliente,
          }),
        });
        const data2 = await res2.json();
        if (data2.error) throw new Error(data2.error);
        setLinks(data2.links ?? []);
      }

      setTiempo(Math.round((Date.now() - inicio) / 1000));
    } catch {
      setError('Hubo un error al generar el contrato. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

 

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' };
  const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' };

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <a href="/" style={{ color: '#6B7280', fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '32px' }}>← Volver al inicio</a>

        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>Generá tu contrato</h1>
        <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '32px' }}>Completá los datos y la IA genera tu contrato en segundos.</p>

        {!contrato ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              {[
                { val: false, label: '📄  Solo PDF',          desc: 'Gratis · Imprimís y firmás vos' },
                { val: true,  label: '✍️  Con firma digital', desc: '$3.50 USD · Ambas partes firman online' },
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
                  <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 12px', fontWeight: 500 }}>✓ Ambas partes recibirán un email para firmar digitalmente con validez legal.</p>
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

            <button onClick={handleGenerar} disabled={loading}
              style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '10px', background: loading ? '#9CA3AF' : '#F5A623', color: '#0A1628', border: 'none', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              {loading
                ? (conFirma ? '⏳  Generando y enviando a firmar...' : '⏳  Generando tu contrato...')
                : (conFirma ? '✍️  Generar y enviar a firmar — $3.50 USD' : '⚡  Generar contrato gratis')}
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
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803D', margin: '0 0 16px' }}>✍️ Links para firma digital — enviados por email</p>
                  {links.map((link) => (
                    <div key={link.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #BBF7D0' }}>
                      <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{link.nombre}</span>
                      <a href={link.url} target="_blank" rel="noreferrer"
                        style={{ fontSize: '13px', color: '#15803D', textDecoration: 'none', background: '#DCFCE7', padding: '6px 14px', borderRadius: '6px', fontWeight: 500 }}>
                        Firmar →
                      </a>
                    </div>
                  ))}
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: '12px 0 0' }}>Cada parte también recibió el link por email. El contrato quedará sellado cuando ambos firmen.</p>
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