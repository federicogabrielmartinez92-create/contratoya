'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Tipos ──────────────────────────────────────────────
type Firmante = { nombre: string; email: string };

interface Usuario {
  id: string; email: string; plan: string;
  contratos_usados: number; contratos_mes: number; creditos_firma: number;
}

export default function SubirContratoPage() {
  const router = useRouter();

  // ══════════════════ ESTADO ══════════════════
  const [usuario, setUsuario]   = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const [file, setFile]           = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const [firmantes, setFirmantes] = useState<Firmante[]>([
    { nombre: '', email: '' },
    { nombre: '', email: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [enviado, setEnviado] = useState(false);
  const [links, setLinks]     = useState<{ nombre: string; url: string }[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      const user = session.user;
      const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
      if (data) {
        setUsuario(data);
      } else {
        await supabase.from('usuarios').insert({ id: user.id, email: user.email });
        setUsuario({ id: user.id, email: user.email!, plan: 'gratis', contratos_usados: 0, contratos_mes: 0, creditos_firma: 0 });
      }
      setCargando(false);
    };
    init();
  }, [router]);

  // ══════════════════ MANEJO DE ARCHIVO (UI) ══════════════════
  const validateFile = (f: File) => {
    if (f.type !== 'application/pdf') { setFileError('Solo se aceptan archivos PDF.'); return false; }
    if (f.size > 5 * 1024 * 1024)      { setFileError('El archivo no puede superar los 5MB.'); return false; }
    setFileError('');
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) setFile(f);
  };

  // ══════════════════ MANEJO DE FIRMANTES (estado dinámico) ══════════════════
  const handleChangeFirmante = (idx: number, field: 'nombre' | 'email', value: string) =>
    setFirmantes(firmantes.map((f, i) => i === idx ? { ...f, [field]: value } : f));

  const agregarFirmante = () => setFirmantes([...firmantes, { nombre: '', email: '' }]);
  const removerFirmante = (idx: number) => setFirmantes(firmantes.filter((_, i) => i !== idx));

  // ══════════════════ LLAMADAS A SUPABASE STORAGE + ZAPSIGN ══════════════════
  const handleSubirYFirmar = async () => {
    if (!usuario || !file) { setError('Subí un archivo PDF primero.'); return; }

    // Límites de plan (mismo criterio que /generar)
    const creditosFirma = usuario.creditos_firma ?? 0;
if (creditosFirma === 0 && usuario.contratos_usados >= 1) {
  setError('Ya usaste tu contrato gratuito. Comprá créditos en /precios para seguir subiendo contratos.');
  return;
}

    if (firmantes.some(f => !f.nombre || !f.email)) { setError('Completá nombre y email de todos los firmantes.'); return; }

    setLoading(true); setError('');

    try {
      // 1. Subir PDF a Supabase Storage en la carpeta del usuario
      const filePath = `${usuario.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documentos_usuario')
        .upload(filePath, file, { contentType: 'application/pdf' });
      if (uploadError) throw new Error('Error al subir el archivo: ' + uploadError.message);

      // 2. Generar URL firmada temporal (10 min) para que ZapSign pueda leerla
      const { data: signedData, error: signedError } = await supabase.storage
        .from('documentos_usuario')
        .createSignedUrl(filePath, 600);
      if (signedError || !signedData) throw new Error('Error al generar la URL del archivo');

      // 3. Enviar a ZapSign vía nuestra API
      const res  = await fetch('/api/firmar-externo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url_pdf:    signedData.signedUrl,
          signers:    firmantes,
          nombre_doc: file.name.replace(/\.pdf$/i, ''),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLinks(data.links ?? []);

      // 4. Guardar referencia en la tabla contratos
      await supabase.from('contratos').insert({
        usuario_id:   usuario.id,
        tipo:         'subido',
        nombre:       `Subido — ${file.name}`,
        con_firma:    true,
        zapsign_id:   data.zapsign_token,
        url_original: data.url_original,
        estado:       'enviado',
      });

      // 5. Actualizar contador de uso (mismo criterio que /generar)
      const cf = usuario.creditos_firma ?? 0;
if (cf > 0) {
  await supabase.from('usuarios').update({ creditos_firma: cf - 1, contratos_usados: usuario.contratos_usados + 1 }).eq('id', usuario.id);
  setUsuario({ ...usuario, creditos_firma: cf - 1, contratos_usados: usuario.contratos_usados + 1 });
} else {
  await supabase.from('usuarios').update({ contratos_usados: usuario.contratos_usados + 1 }).eq('id', usuario.id);
  setUsuario({ ...usuario, contratos_usados: usuario.contratos_usados + 1 });
}

      setEnviado(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hubo un error al procesar el documento.');
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════ ESTILOS ══════════════════
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' };
  const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' };

  if (cargando) return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#6B7280' }}>Cargando...</p>
    </main>
  );

  // ══════════════════ UI ══════════════════
  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0A1628', padding: '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/generar" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Generar con IA</a>
          <a href="/dashboard" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Mis contratos</a>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{usuario?.email}</span>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          Subí tu propio contrato
        </h1>
        <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px' }}>
          Subí un PDF ya redactado y enviálo a firmar digitalmente.
        </p>

        {!enviado ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

            {/* ── Dropzone ── */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
              style={{
                border: dragActive ? '2px dashed #F5A623' : '2px dashed #E5E7EB',
                borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer',
                background: dragActive ? '#FFFBF0' : '#F9FAFB', transition: 'all 0.15s',
              }}
            >
              <input id="file-input" type="file" accept="application/pdf" onChange={handleFileSelect} style={{ display: 'none' }} />
              {file ? (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📄</div>
                  <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{file.name}</p>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(2)} MB — Click para cambiar</p>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
                  <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>Arrastrá tu PDF aquí</p>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>o hacé click para seleccionar — máx. 5MB</p>
                </div>
              )}
            </div>
            {fileError && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '8px' }}>{fileError}</p>}

            {/* ── Firmantes dinámicos ── */}
            <div style={{ marginTop: '32px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontFamily: 'Space Grotesk, sans-serif' }}>
                Firmantes
              </p>

              {firmantes.map((f, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    {idx === 0 && <label style={lbl}>Nombre completo</label>}
                    <input value={f.nombre} onChange={(e) => handleChangeFirmante(idx, 'nombre', e.target.value)} placeholder="Ej: Martín González" style={inp} />
                  </div>
                  <div style={{ flex: 1 }}>
                    {idx === 0 && <label style={lbl}>Email</label>}
                    <input value={f.email} onChange={(e) => handleChangeFirmante(idx, 'email', e.target.value)} type="email" placeholder="email@ejemplo.com" style={inp} />
                  </div>
                  {firmantes.length > 2 && (
                    <button onClick={() => removerFirmante(idx)}
                      style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontSize: '13px' }}>
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button onClick={agregarFirmante}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px dashed #F5A623', background: '#FFFBF0', color: '#92400E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}>
                + Agregar firmante
              </button>
            </div>

            {error && <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '16px' }}>{error}</p>}

            <button onClick={handleSubirYFirmar} disabled={loading}
              style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '10px', background: loading ? '#9CA3AF' : '#F5A623', color: '#0A1628', border: 'none', fontSize: '16px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
              {loading ? '⏳  Procesando...' : '✍️  Enviar a firmar'}
            </button>
          </div>

        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 16px' }}>
              ✅ Documento enviado a firmar
            </h2>
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '20px' }}>
              {links.map((link) => (
                <div key={link.url} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #BBF7D0' }}>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{link.nombre}</span>
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#15803D', textDecoration: 'none', background: '#DCFCE7', padding: '6px 14px', borderRadius: '6px', fontWeight: 500 }}>Firmar →</a>
                </div>
              ))}
            </div>
            <a href="/dashboard" style={{ display: 'inline-block', marginTop: '20px', color: '#6B7280', fontSize: '14px', textDecoration: 'underline' }}>
              Ver en Mis contratos →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}