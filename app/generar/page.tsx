'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

const campos = [
  { name: 'prestador', label: 'Tu nombre completo *', placeholder: 'Ej: Martín González', span: 1 },
  { name: 'cliente',   label: 'Nombre del cliente *', placeholder: 'Ej: Empresa XYZ SRL',  span: 1 },
  { name: 'cuit_prestador', label: 'Tu CUIT *', placeholder: 'Ej: 20-12345678-9', span: 1 },
  { name: 'cuit_cliente',   label: 'CUIT del cliente', placeholder: 'Ej: 30-98765432-1', span: 1 },
  { name: 'servicio',  label: 'Servicio contratado *', placeholder: 'Ej: Diseño de identidad visual', span: 2 },
  { name: 'monto',     label: 'Monto acordado *',      placeholder: 'Ej: $280.000 ARS',    span: 1 },
  { name: 'plazo',     label: 'Plazo de entrega',      placeholder: 'Ej: 30 días corridos', span: 1 },
  { name: 'ciudad',    label: 'Ciudad',                placeholder: 'Ej: Buenos Aires',     span: 1 },
  { name: 'condiciones_pago', label: 'Condiciones de pago', placeholder: 'Ej: 50% adelanto, 50% al entregar', span: 2 },
  { name: 'fecha',     label: 'Fecha',                 placeholder: 'Ej: 10/06/2025',       span: 1 },
];

export default function GenerarPage() {
  const [form, setForm] = useState<Record<string, string>>({
    prestador: '', cliente: '', servicio: '', cuit_prestador: '', cuit_cliente: '', moneda: 'ARS',
    monto: '', plazo: '', ciudad: '',
    condiciones_pago: '50% adelanto / 50% al entregar',
    fecha: new Date().toLocaleDateString('es-AR'),
  });
  const [contrato, setContrato]   = useState('');
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const [tiempo,   setTiempo]     = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerar = async () => {
    if (!form.prestador || !form.cliente || !form.servicio || !form.monto) {
      setError('Completá los campos obligatorios (*)');
      return;
    }
    setLoading(true);
    setError('');
    const inicio = Date.now();

    try {
      const res  = await fetch('/api/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setContrato(data.contrato);
      setTiempo(Math.round((Date.now() - inicio) / 1000));
    } catch {
      setError('Hubo un error al generar el contrato. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = () => {
    const doc   = new jsPDF();
    const lines = doc.splitTextToSize(contrato, 170) as string[];
    let y = 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    lines.forEach((line) => {
      if (y > 280) { doc.addPage(); y = 20; }
      doc.text(line, 20, y);
      y += 6;
    });
    doc.save(`contrato-${form.cliente.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  return (
    <main style={{ minHeight:'100vh', background:'#F8F9FB', padding:'40px 20px', fontFamily:'Inter, sans-serif' }}>
      <div style={{ maxWidth:'720px', margin:'0 auto' }}>

        <a href="/" style={{ color:'#6B7280', fontSize:'14px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px', marginBottom:'32px' }}>
          ← Volver al inicio
        </a>

        <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'32px', fontWeight:700, color:'#111827', marginBottom:'8px', letterSpacing:'-0.5px' }}>
          Generá tu contrato
        </h1>
        <p style={{ color:'#6B7280', fontSize:'16px', marginBottom:'40px' }}>
          Completá los datos y la IA genera tu contrato en segundos.
        </p>

        {!contrato ? (
          <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              {campos.map((c) => (
                <div key={c.name} style={{ gridColumn: c.span === 2 ? 'span 2' : 'span 1' }}>
                  <label style={{ fontSize:'13px', fontWeight:500, color:'#374151', display:'block', marginBottom:'6px' }}>
                    {c.label}
                  </label>
                  <input
                    name={c.name}
                    value={form[c.name]}
                    onChange={handleChange}
                    placeholder={c.placeholder}
                    style={{ width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:'8px', fontSize:'14px', color:'#111827', outline:'none', boxSizing:'border-box', fontFamily:'Inter, sans-serif' }}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2' }}>
  <label style={{ fontSize:'13px', fontWeight:500, color:'#374151', display:'block', marginBottom:'6px' }}>
    Moneda del contrato
  </label>
  <select
    name="moneda"
    value={form.moneda}
    onChange={(e) => setForm({ ...form, moneda: e.target.value })}
    style={{ width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:'8px', fontSize:'14px', color:'#111827', fontFamily:'Inter, sans-serif', background:'white' }}
  >
    <option value="ARS">Pesos argentinos (ARS)</option>
    <option value="USD">Dólares estadounidenses (USD)</option>
    <option value="USDT">Dólares digitales (USDT)</option>
  </select>
</div>
            </div>

            {error && <p style={{ color:'#DC2626', fontSize:'14px', marginTop:'16px' }}>{error}</p>}

            <button
              onClick={handleGenerar}
              disabled={loading}
              style={{ marginTop:'28px', width:'100%', padding:'14px', borderRadius:'10px', background: loading ? '#9CA3AF' : '#F5A623', color:'#0A1628', border:'none', fontSize:'16px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Space Grotesk, sans-serif' }}
            >
                
              {loading ? '⏳  Generando tu contrato...' : '⚡  Generar contrato ahora'}
            </button>
          </div>
        ) : (
          <div>
            <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', boxShadow:'0 1px 3px rgba(0,0,0,0.08)', marginBottom:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'20px', fontWeight:600, color:'#111827', margin:0 }}>
                    ✅ Contrato generado
                  </h2>
                  <p style={{ color:'#16A34A', fontSize:'13px', marginTop:'4px' }}>
                    Generado en {tiempo}s · Conforme a la ley argentina
                  </p>
                </div>
                <button
                  onClick={handleDescargar}
                  style={{ padding:'10px 22px', borderRadius:'8px', background:'#0A1628', color:'#F5A623', border:'none', fontSize:'14px', fontWeight:600, cursor:'pointer', fontFamily:'Space Grotesk, sans-serif' }}
                >
                  ↓ Descargar PDF
                </button>
              </div>
              <pre style={{ whiteSpace:'pre-wrap', fontSize:'13px', lineHeight:'1.9', color:'#374151', fontFamily:'Georgia, serif', borderTop:'1px solid #F3F4F6', paddingTop:'24px', margin:0 }}>
                {contrato}
              </pre>
            </div>
            <button
              onClick={() => setContrato('')}
              style={{ background:'none', border:'none', color:'#6B7280', fontSize:'14px', cursor:'pointer', textDecoration:'underline', padding:0 }}
            >
              ← Generar otro contrato
            </button>
          </div>
        )}

      </div>
    </main>
  );
}