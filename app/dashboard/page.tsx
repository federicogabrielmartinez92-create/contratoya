'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Contrato {
  id: string;
  nombre: string;
  tipo: string;
  cliente: string;
  monto: string;
  con_firma: boolean;
  estado: string;
  created_at: string;
  url_original: string | null;
  url_firmado: string | null;
  zapsign_id: string | null;
  contenido: string | null;
}

const estadoBadge: Record<string, { label: string; bg: string; color: string }> = {
  generado: { label: 'PDF generado',     bg: '#F3F4F6', color: '#6B7280' },
  enviado:  { label: 'Enviado a firmar', bg: '#FEF3C7', color: '#92400E' },
  firmado:  { label: 'Firmado ✓',        bg: '#D1FAE5', color: '#065F46' },
};

const tipoBadge: Record<string, { label: string; bg: string; color: string }> = {
  servicios: { label: 'Servicios', bg: '#EDE9FE', color: '#5B21B6' },
  alquiler:  { label: 'Alquiler',  bg: '#DBEAFE', color: '#1E40AF' },
  subido:    { label: 'Subido',    bg: '#FEE2E2', color: '#991B1B' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [contratos, setContratos]     = useState<Contrato[]>([]);
  const [email, setEmail]             = useState('');
  const [cargando, setCargando]       = useState(true);
  const [verificando, setVerificando] = useState<Record<string, boolean>>({});

  const cargarContratos = async () => {
    const { data } = await supabase
      .from('contratos')
      .select('id, nombre, tipo, cliente, monto, con_firma, estado, created_at, url_original, url_firmado, zapsign_id, contenido')
      .order('created_at', { ascending: false });
    setContratos(data ?? []);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      setEmail(session.user.email ?? '');
      await cargarContratos();
      setCargando(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleVerificarFirma = async (c: Contrato) => {
    if (!c.zapsign_id) return;
    setVerificando({ ...verificando, [c.id]: true });
    try {
      await fetch('/api/contratos/verificar-firma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zapsign_id: c.zapsign_id }),
      });
      await cargarContratos();
    } finally {
      setVerificando({ ...verificando, [c.id]: false });
    }
  };

  const crearPDF = (texto: string) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight();
    const mx = 50; const lh = 14;
    const lines = doc.splitTextToSize(texto, W - mx * 2) as string[];
    let y = mx + lh;
    lines.forEach((line) => { if (y > H - mx) { doc.addPage(); y = mx + lh; } doc.text(line, mx, y); y += lh; });
    return doc;
  };

  const handleDescargarPDF = (c: Contrato) => {
    if (!c.contenido) return;
    const nombreArchivo = (c.nombre || 'contrato').replace(/\s+/g, '-').toLowerCase() + '.pdf';
    crearPDF(c.contenido).save(nombreArchivo);
  };

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (cargando) return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#6B7280' }}>Cargando...</p>
    </main>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0A1628', padding: '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/generar" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>+ Nuevo contrato</a>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{email}</span>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#111827', margin: 0 }}>
              Mis contratos
            </h1>
            <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
              {contratos.length} contrato{contratos.length !== 1 ? 's' : ''} generado{contratos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <a href="/generar"
            style={{ padding: '10px 20px', background: '#F5A623', color: '#0A1628', borderRadius: '8px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
            ⚡ Nuevo contrato
          </a>
        </div>

        {contratos.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
              Todavía no generaste ningún contrato
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
              Creá tu primer contrato en segundos con IA
            </p>
            <a href="/generar" style={{ padding: '12px 24px', background: '#F5A623', color: '#0A1628', borderRadius: '8px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}>
              Generar contrato →
            </a>
          </div>

        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.8fr', padding: '12px 24px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Contrato', 'Tipo', 'Fecha', 'Estado', 'Firma', 'Acciones'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {h}
                </span>
              ))}
            </div>

            {contratos.map((c, i) => {
              const estado = estadoBadge[c.estado] ?? estadoBadge.generado;
              const tipo   = tipoBadge[c.tipo]     ?? tipoBadge.servicios;
              return (
                <div key={c.id}
                  style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1.8fr', padding: '16px 24px', borderBottom: i < contratos.length - 1 ? '1px solid #F3F4F6' : 'none', alignItems: 'center' }}>

                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>
                      {c.nombre || `Contrato con ${c.cliente}`}
                    </p>
                    {c.monto && <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>${c.monto}</p>}
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', background: tipo.bg, color: tipo.color, width: 'fit-content' }}>
                    {tipo.label}
                  </span>

                  <span style={{ fontSize: '13px', color: '#6B7280' }}>
                    {formatFecha(c.created_at)}
                  </span>

                  <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px', background: estado.bg, color: estado.color, width: 'fit-content' }}>
                    {estado.label}
                  </span>

                  <span style={{ fontSize: '12px', color: c.con_firma ? '#15803D' : '#9CA3AF' }}>
                    {c.con_firma ? '✓ Con firma' : '— Solo PDF'}
                  </span>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {c.url_original && (
                      <a href={c.url_original} target="_blank" rel="noreferrer"
                        style={{ fontSize: '11px', color: '#3B82F6', textDecoration: 'none', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Ver original
                      </a>
                    )}
                    {c.url_firmado && (
                      <a href={c.url_firmado} target="_blank" rel="noreferrer"
                        style={{ fontSize: '11px', color: '#15803D', textDecoration: 'none', background: '#DCFCE7', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ↓ PDF firmado
                      </a>
                    )}
                    {c.con_firma && c.estado !== 'firmado' && c.zapsign_id && (
                      <button onClick={() => handleVerificarFirma(c)} disabled={verificando[c.id]}
                        style={{ fontSize: '11px', color: '#6B21A8', background: '#F3E8FF', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, cursor: verificando[c.id] ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                        {verificando[c.id] ? '⏳ Revisando...' : '🔄 Verificar firma'}
                      </button>
                    )}
                    {!c.con_firma && c.contenido && (
                      <button onClick={() => handleDescargarPDF(c)}
                        style={{ fontSize: '11px', color: '#0A1628', background: '#FEF3C7', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        ↓ Descargar PDF
                      </button>
                    )}
                    {!c.url_original && !c.url_firmado && !c.contenido && (
                      <span style={{ fontSize: '11px', color: '#D1D5DB' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}