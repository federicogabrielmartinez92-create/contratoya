'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const campos = [
  { name: 'prestador',              label: 'Tu nombre completo *',          placeholder: 'Ej: Martín González',            span: 1 },
  { name: 'cliente',                label: 'Nombre del cliente *',          placeholder: 'Ej: Empresa XYZ SRL',            span: 1 },
  { name: 'cuit_prestador',         label: 'Tu CUIT *',                     placeholder: 'Ej: 20-12345678-9',              span: 1 },
  { name: 'cuit_cliente',           label: 'CUIT del cliente',              placeholder: 'Ej: 30-98765432-1',              span: 1 },
  { name: 'representante_cliente',  label: 'Representante legal del cliente', placeholder: 'Ej: Ana López (solo si es empresa)', span: 1 },
  { name: 'cargo_representante',    label: 'Cargo del representante',       placeholder: 'Ej: Directora Comercial',        span: 1 },
  { name: 'servicio',               label: 'Servicio contratado *',         placeholder: 'Ej: Diseño de identidad visual', span: 2 },
  { name: 'monto',                  label: 'Monto acordado *',              placeholder: 'Ej: $280.000',                   span: 1 },
  { name: 'plazo',                  label: 'Plazo de entrega',              placeholder: 'Ej: 30 días corridos',           span: 1 },
  { name: 'ciudad',                 label: 'Ciudad',                        placeholder: 'Ej: Rosario',                    span: 1 },
  { name: 'fecha',                  label: 'Fecha',                         placeholder: 'Ej: 10/06/2026',                 span: 1 },
];

const serviciosItems = [
  { name: 'servicio_luz',             label: 'Electricidad',             default: 'Locatario' },
  { name: 'servicio_gas',             label: 'Gas',                      default: 'Locatario' },
  { name: 'servicio_agua',            label: 'Agua',                     default: 'Locatario' },
  { name: 'servicio_internet',        label: 'Internet / Cable',         default: 'Locatario' },
  { name: 'expensas_ordinarias',      label: 'Expensas ordinarias',      default: 'Locatario' },
  { name: 'expensas_extraordinarias', label: 'Expensas extraordinarias', default: 'Locador'   },
  { name: 'impuesto_inmobiliario',    label: 'Impuesto inmobiliario',    default: 'Locador'   },
  { name: 'tasa_municipal',           label: 'Tasa municipal (TGI)',     default: 'Locador'   },
];

type LocadorData = {
  nombre: string; dni: string; estado_civil: string; domicilio: string; email: string;
};

type GaranteData = {
  tipo: string; nombre: string; dni: string; domicilio: string; email: string;
  matricula: string; registro: string; ciudad_prop: string; provincia_prop: string;
  empresa: string; cargo: string; aseguradora: string; poliza: string;
};

const initialLocador: LocadorData = {
  nombre: '', dni: '', estado_civil: 'Soltero/a', domicilio: '', email: '',
};

const initialGarante: GaranteData = {
  tipo: 'Propietaria', nombre: '', dni: '', domicilio: '', email: '',
  matricula: '', registro: '', ciudad_prop: '', provincia_prop: '',
  empresa: '', cargo: '', aseguradora: '', poliza: '',
};

const serviciosDefaults = Object.fromEntries(serviciosItems.map(s => [s.name, s.default]));

const initialFormAlquiler: Record<string, string> = {
  locatario_nombre: '', locatario_dni: '', locatario_estado_civil: 'Soltero/a', locatario_email: '',
  inmueble_tipo: 'Departamento', inmueble_direccion: '', inmueble_piso_dpto: '',
  inmueble_cp: '', inmueble_destino: 'Vivienda familiar', inmueble_estado: '',
  fecha_inicio: new Date().toLocaleDateString('es-AR'),
  duracion_meses: '24',
  monto_alquiler: '', moneda_alquiler: 'ARS',
  indice: 'ICL', periodicidad: 'Cuatrimestral',
  dias_desde: '1', dias_hasta: '10', metodo_pago: 'Transferencia bancaria',
  monto_deposito: '', moneda_deposito: 'ARS',
  ...serviciosDefaults,
  mora_tipo: 'Porcentaje mensual', mora_porcentaje: '5', mora_dias_gracia: '5',
  preaviso: '60 días', jurisdiccion: 'Tribunales Provinciales de Rosario',
};

interface Usuario {
  id: string; email: string; plan: string;
  contratos_usados: number; contratos_mes: number; creditos_express: number;
}

export default function GenerarPage() {
  const router = useRouter();
  const [usuario, setUsuario]           = useState<Usuario | null>(null);
  const [cargando, setCargando]         = useState(true);
  const [tipoContrato, setTipoContrato] = useState<'servicios' | 'alquiler'>('servicios');
  const [form, setForm] = useState<Record<string, string>>({
  prestador: '', cliente: '', cuit_prestador: '', cuit_cliente: '',
  representante_cliente: '', cargo_representante: '',
  servicio: '', monto: '', plazo: '', ciudad: '',
  fecha: new Date().toLocaleDateString('es-AR'),
  condiciones_pago: '50% adelanto / 50% al entregar',
  moneda: 'ARS', revisiones: '2', email_prestador: '', email_cliente: '',
});

  const [formAlquiler, setFormAlquiler] = useState<Record<string, string>>(initialFormAlquiler);
  const [locadores, setLocadores]       = useState<LocadorData[]>([{ ...initialLocador }]);
  const [garantes, setGarantes]         = useState<GaranteData[]>([{ ...initialGarante }]);
  const [conFirma, setConFirma]         = useState(false);
  const [contrato, setContrato]         = useState('');
  const [links, setLinks]               = useState<{ nombre: string; url: string }[]>([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [tiempo, setTiempo]             = useState(0);

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
        setUsuario({ id: user.id, email: user.email!, plan: 'gratis', contratos_usados: 0, contratos_mes: 0, creditos_express: 0 });
      }
      setCargando(false);
    };
    init();
  }, [router]);

  const handleLogout          = async () => { await supabase.auth.signOut(); router.push('/'); };
  const handleChange          = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeAlquiler  = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormAlquiler({ ...formAlquiler, [e.target.name]: e.target.value });
  const handleChangeLocador   = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setLocadores(locadores.map((l, i) => i === idx ? { ...l, [e.target.name]: e.target.value } : l));
  const agregarLocador        = () => setLocadores([...locadores, { ...initialLocador }]);
  const removerLocador        = (idx: number) => setLocadores(locadores.filter((_, i) => i !== idx));
  const handleChangeGarante   = (idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setGarantes(garantes.map((g, i) => i === idx ? { ...g, [e.target.name]: e.target.value } : g));
  const agregarGarante        = () => setGarantes([...garantes, { ...initialGarante }]);
  const removerGarante        = (idx: number) => setGarantes(garantes.filter((_, i) => i !== idx));

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
  const generarPDFBase64 = (texto: string) => crearPDF(texto).output('datauristring').split(',')[1];
  const handleDescargar  = () => {
    const nombre = tipoContrato === 'alquiler'
      ? `contrato-alquiler-${formAlquiler.locatario_nombre.replace(/\s+/g, '-').toLowerCase()}.pdf`
      : `contrato-${form.cliente.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    crearPDF(contrato).save(nombre);
  };

  const handleGenerar = async () => {
    if (!usuario) return;
    const creditosExpress = usuario.creditos_express ?? 0;
    if (usuario.plan === 'pro') {
      if (usuario.contratos_mes >= 15) { setError('Llegaste al límite de 15 contratos del plan Pro este mes.'); return; }
    } else if (creditosExpress > 0) {
      // OK
    } else {
      if (usuario.contratos_usados >= 1) { setError('Ya usaste tu contrato gratuito. Elegí un plan para continuar.'); return; }
    }
    if (conFirma && usuario.plan !== 'pro' && creditosExpress === 0) { setError('La firma digital requiere un plan Express o Pro.'); return; }

    if (tipoContrato === 'servicios') {
      if (!form.prestador || !form.cliente || !form.servicio || !form.monto || !form.cuit_prestador) { setError('Completá los campos obligatorios (*)'); return; }
      if (conFirma && (!form.email_prestador || !form.email_cliente)) { setError('Para la firma digital necesitás ingresar ambos emails'); return; }
    } else {
      if (!locadores[0].nombre || !formAlquiler.locatario_nombre || !formAlquiler.inmueble_direccion || !formAlquiler.monto_alquiler) { setError('Completá los campos obligatorios (*)'); return; }
      if (conFirma && (!locadores[0].email || !formAlquiler.locatario_email)) { setError('Para la firma digital necesitás los emails del locador y locatario'); return; }
    }

    setLoading(true); setError('');
    const inicio = Date.now();

    try {
      const payload = tipoContrato === 'alquiler'
        ? { tipo: 'alquiler', ...formAlquiler, locadores, garantes }
        : { tipo: 'servicios', ...form };

      const res1  = await fetch('/api/generar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data1 = await res1.json();
      if (data1.error) throw new Error(data1.error);
      setContrato(data1.contrato);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let data2: any = null;

      if (conFirma) {
        const base64_pdf   = generarPDFBase64(data1.contrato);
        const f1 = tipoContrato === 'alquiler' ? { nombre: locadores[0].nombre, email: locadores[0].email } : { nombre: form.prestador, email: form.email_prestador };
        const f2 = tipoContrato === 'alquiler' ? { nombre: formAlquiler.locatario_nombre, email: formAlquiler.locatario_email } : { nombre: form.cliente, email: form.email_cliente };
        const firmantes_extra = tipoContrato === 'alquiler' ? [
          ...locadores.slice(1).filter(l => l.email).map(l => ({ nombre: l.nombre, email: l.email })),
          ...garantes.filter(g => g.email).map(g => ({ nombre: g.nombre, email: g.email })),
        ] : [];
        const nombre_doc = tipoContrato === 'alquiler' ? `Contrato de Alquiler - ${formAlquiler.locatario_nombre}` : undefined;
        const res2  = await fetch('/api/firmar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ base64_pdf, prestador: f1.nombre, email_prestador: f1.email, cliente: f2.nombre, email_cliente: f2.email, firmantes_extra, nombre_doc }) });
        data2 = await res2.json();
        if (data2.error) throw new Error(data2.error);
        setLinks(data2.links ?? []);
      }

      const ce = usuario.creditos_express ?? 0;
      if (usuario.plan === 'pro') {
        await supabase.from('usuarios').update({ contratos_mes: usuario.contratos_mes + 1, contratos_usados: usuario.contratos_usados + 1 }).eq('id', usuario.id);
        setUsuario({ ...usuario, contratos_mes: usuario.contratos_mes + 1, contratos_usados: usuario.contratos_usados + 1 });
      } else if (ce > 0) {
        await supabase.from('usuarios').update({ creditos_express: ce - 1, contratos_usados: usuario.contratos_usados + 1 }).eq('id', usuario.id);
        setUsuario({ ...usuario, creditos_express: ce - 1, contratos_usados: usuario.contratos_usados + 1 });
      } else {
        await supabase.from('usuarios').update({ contratos_usados: usuario.contratos_usados + 1 }).eq('id', usuario.id);
        setUsuario({ ...usuario, contratos_usados: usuario.contratos_usados + 1 });
      }
      // Guardar en tabla contratos
const nombreContrato = tipoContrato === 'alquiler'
  ? `Alquiler — ${formAlquiler.locatario_nombre}`
  : `Servicios — ${form.cliente}`;

await supabase.from('contratos').insert({
  usuario_id:    usuario.id,
  tipo:          tipoContrato,
  nombre:        nombreContrato,
  prestador:     tipoContrato === 'servicios' ? form.prestador : locadores[0]?.nombre,
  cliente:       tipoContrato === 'servicios' ? form.cliente   : formAlquiler.locatario_nombre,
  monto:         tipoContrato === 'servicios' ? form.monto     : formAlquiler.monto_alquiler,
  con_firma:     conFirma,
  zapsign_id:    conFirma ? data2?.zapsign_token : null,  // ← token ZapSign
  url_original:  conFirma ? data2?.url_original  : null,  // ← URL original
  estado:        conFirma ? 'enviado' : 'generado',
});

      setTiempo(Math.round((Date.now() - inicio) / 1000));
    } catch { setError('Hubo un error al generar el contrato. Intentá de nuevo.'); }
    finally { setLoading(false); }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' };
  const lbl: React.CSSProperties = { fontSize: '13px', fontWeight: 500, color: '#374151', display: 'block', marginBottom: '6px' };
  const sec: React.CSSProperties = { gridColumn: 'span 2', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #F3F4F6', paddingBottom: '6px', marginTop: '4px', fontFamily: 'Space Grotesk, sans-serif' };

  if (cargando) return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ color: '#6B7280' }}>Cargando...</p>
    </main>
  );

  const creditosExpress  = usuario?.creditos_express ?? 0;
  const hasExpressCredit = creditosExpress > 0;
  const planColor   = usuario?.plan === 'pro' ? '#7C3AED' : hasExpressCredit ? '#0EA5E9' : '#6B7280';
  const planLabel   = usuario?.plan === 'pro' ? 'Pro'     : hasExpressCredit ? 'Express' : 'Gratis';
  const canGenerate = usuario?.plan === 'pro' || hasExpressCredit || (usuario?.contratos_usados ?? 0) < 1;
  const estadosCiviles = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión convivencial'];
  const responsables   = ['Locatario', 'Locador', 'A cargo de ambos', 'No aplica'];

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#0A1628', padding: '14px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
          Contrato<span style={{ color: '#F5A623' }}>Ya</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '100px', background: planColor, color: '#fff' }}>Plan {planLabel}</span>
          {usuario?.plan !== 'pro' && !hasExpressCredit && (usuario?.contratos_usados ?? 0) <= 1 && (
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            {usuario?.contratos_usados}/1 contratos
          </span>
          )}
          {hasExpressCredit && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{creditosExpress} contrato Express disponible</span>}
          {usuario?.plan === 'pro' && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{usuario.contratos_mes}/15 este mes</span>}
          {usuario?.plan !== 'pro' && (
            <a href="/precios" style={{ fontSize: '12px', fontWeight: 600, color: '#F5A623', border: '1px solid #F5A623', padding: '4px 12px', borderRadius: '100px', textDecoration: 'none' }}>
              Mejorar plan →
            </a>
          )}
          <a href="/dashboard" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            Mis contratos
          </a>
          <a href="/subir" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
            Subir mi contrato
          </a>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{usuario?.email}</span>
          <button onClick={handleLogout} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>Generá tu contrato</h1>
        <p style={{ color: '#6B7280', fontSize: '16px', marginBottom: '32px' }}>Completá los datos y la IA genera tu contrato en segundos.</p>

        {usuario?.plan !== 'pro' && !hasExpressCredit && (usuario?.contratos_usados ?? 0) >= 1 && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', margin: '0 0 2px' }}>Ya usaste tu contrato gratuito</p>
              <p style={{ fontSize: '13px', color: '#B45309', margin: 0 }}>Elegí un plan para seguir generando contratos</p>
            </div>
            <a href="/precios" style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', background: '#FDE68A', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>Ver planes →</a>
          </div>
        )}

        {!contrato ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

            {/* Selector tipo */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              {[{ val: 'servicios', label: '💼  Servicios / Freelance' }, { val: 'alquiler', label: '🏠  Contrato de Alquiler' }].map(opt => (
                <button key={opt.val} onClick={() => { setTipoContrato(opt.val as 'servicios' | 'alquiler'); setError(''); }}
                  style={{ flex: 1, padding: '14px', borderRadius: '10px', cursor: 'pointer', border: tipoContrato === opt.val ? '2px solid #F5A623' : '1.5px solid #E5E7EB', background: tipoContrato === opt.val ? '#FFFBF0' : '#fff', fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Selector firma */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              {[
                { val: false, label: '📄  Solo PDF',         desc: 'Descarga directa' },
                { val: true,  label: '✍️  Con firma digital', desc: (!hasExpressCredit && usuario?.plan !== 'pro') ? 'Requiere plan Express o Pro' : 'Ambas partes firman online' },
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => setConFirma(opt.val)}
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', border: conFirma === opt.val ? '2px solid #F5A623' : '1.5px solid #E5E7EB', background: conFirma === opt.val ? '#FFFBF0' : '#fff', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{opt.label}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* ── FORM SERVICIOS ── */}
            {tipoContrato === 'servicios' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {campos.map((c) => (
                  <div key={c.name} style={{ gridColumn: c.span === 2 ? 'span 2' : 'span 1' }}>
                    <label style={lbl}>{c.label}</label>
                    <input name={c.name} value={form[c.name]} onChange={handleChange} placeholder={c.placeholder} style={inp} />
                  </div>
                ))}
                <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Condiciones de pago</label><input name="condiciones_pago" value={form.condiciones_pago} onChange={handleChange} placeholder="Ej: 50% adelanto / 50% al entregar" style={inp} /></div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={lbl}>Moneda del contrato</label>
                  <select name="moneda" value={form.moneda} onChange={handleChange} style={{ ...inp, background: 'white' }}>
                    <option value="ARS">Pesos argentinos (ARS)</option>
                    <option value="USD">Dólares (USD)</option>
                    <option value="USDT">Dólares digitales (USDT)</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
  <label style={lbl}>Rondas de revisión incluidas en el precio</label>
  <select name="revisiones" value={form.revisiones} onChange={handleChange} style={{ ...inp, background: 'white' }}>
    <option value="1">1 ronda de revisión</option>
    <option value="2">2 rondas de revisión</option>
    <option value="3">3 rondas de revisión</option>
    <option value="ilimitadas">Revisiones ilimitadas</option>
  </select>
</div>
                {conFirma && (
                  <div style={{ gridColumn: 'span 2', background: '#F0FDF4', borderRadius: '10px', padding: '16px', border: '1px solid #BBF7D0' }}>
                    <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 12px', fontWeight: 500 }}>✓ Ambas partes recibirán un email para firmar digitalmente.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div><label style={lbl}>Tu email *</label><input name="email_prestador" value={form.email_prestador} onChange={handleChange} placeholder="tu@email.com" type="email" style={inp} /></div>
                      <div><label style={lbl}>Email del cliente *</label><input name="email_cliente" value={form.email_cliente} onChange={handleChange} placeholder="cliente@empresa.com" type="email" style={inp} /></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── FORM ALQUILER ── */}
            {tipoContrato === 'alquiler' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                {/* Locadores */}
                <div style={sec}>Locador{locadores.length > 1 ? 'es' : ''} (Propietario{locadores.length > 1 ? 's' : ''})</div>
                {locadores.map((locador, idx) => (
                  <React.Fragment key={idx}>
                    {locadores.length > 1 && (
                      <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Locador {idx + 1}</span>
                        {idx > 0 && <button onClick={() => removerLocador(idx)} style={{ fontSize: '12px', color: '#DC2626', background: 'none', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>− Eliminar</button>}
                      </div>
                    )}
                    <div><label style={lbl}>Nombre completo {idx === 0 ? '*' : ''}</label><input name="nombre" value={locador.nombre} onChange={(e) => handleChangeLocador(idx, e)} placeholder="Ej: Juan Pérez" style={inp} /></div>
                    <div><label style={lbl}>DNI / CUIT {idx === 0 ? '*' : ''}</label><input name="dni" value={locador.dni} onChange={(e) => handleChangeLocador(idx, e)} placeholder="Ej: 20-12345678-9" style={inp} /></div>
                    <div><label style={lbl}>Estado civil</label><select name="estado_civil" value={locador.estado_civil} onChange={(e) => handleChangeLocador(idx, e)} style={{ ...inp, background: 'white' }}>{estadosCiviles.map(e => <option key={e}>{e}</option>)}</select></div>
                    <div><label style={lbl}>Email</label><input name="email" value={locador.email} onChange={(e) => handleChangeLocador(idx, e)} type="email" placeholder="locador@email.com" style={inp} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Domicilio real</label><input name="domicilio" value={locador.domicilio} onChange={(e) => handleChangeLocador(idx, e)} placeholder="Ej: Corrientes 1234, Rosario" style={inp} /></div>
                  </React.Fragment>
                ))}
                {locadores.length < 3 && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <button onClick={agregarLocador} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px dashed #F5A623', background: '#FFFBF0', color: '#92400E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      + Agregar otro locador
                    </button>
                  </div>
                )}

                {/* Locatario */}
                <div style={sec}>Locatario (Inquilino)</div>
                <div><label style={lbl}>Nombre completo *</label><input name="locatario_nombre" value={formAlquiler.locatario_nombre} onChange={handleChangeAlquiler} placeholder="Ej: María García" style={inp} /></div>
                <div><label style={lbl}>DNI / CUIT *</label><input name="locatario_dni" value={formAlquiler.locatario_dni} onChange={handleChangeAlquiler} placeholder="Ej: 27-98765432-1" style={inp} /></div>
                <div><label style={lbl}>Estado civil</label><select name="locatario_estado_civil" value={formAlquiler.locatario_estado_civil} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>{estadosCiviles.map(e => <option key={e}>{e}</option>)}</select></div>
                <div><label style={lbl}>Email</label><input name="locatario_email" value={formAlquiler.locatario_email} onChange={handleChangeAlquiler} type="email" placeholder="inquilino@email.com" style={inp} /></div>

                {/* Garantes */}
                <div style={sec}>Garante{garantes.length > 1 ? 's' : ''}</div>
                {garantes.map((garante, idx) => (
                  <React.Fragment key={idx}>
                    {garantes.length > 1 && (
                      <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', borderRadius: '8px', padding: '8px 12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Garante {idx + 1}</span>
                        {idx > 0 && <button onClick={() => removerGarante(idx)} style={{ fontSize: '12px', color: '#DC2626', background: 'none', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>− Eliminar</button>}
                      </div>
                    )}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={lbl}>Tipo de garantía</label>
                      <select name="tipo" value={garante.tipo} onChange={(e) => handleChangeGarante(idx, e)} style={{ ...inp, background: 'white' }}>
                        <option>Propietaria</option><option>Recibo de Sueldo</option><option>Seguro de Caución</option>
                      </select>
                    </div>
                    <div><label style={lbl}>Nombre del garante</label><input name="nombre" value={garante.nombre} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Carlos López" style={inp} /></div>
                    <div><label style={lbl}>DNI del garante</label><input name="dni" value={garante.dni} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: 25-11122233-4" style={inp} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Domicilio del garante</label><input name="domicilio" value={garante.domicilio} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: San Martín 456, Rosario" style={inp} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Email del garante</label><input name="email" value={garante.email} onChange={(e) => handleChangeGarante(idx, e)} type="email" placeholder="garante@email.com" style={inp} /></div>
                    {garante.tipo === 'Propietaria' && (<>
                      <div><label style={lbl}>Matrícula del inmueble</label><input name="matricula" value={garante.matricula} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Matrícula 12345" style={inp} /></div>
                      <div><label style={lbl}>Registro de la Propiedad</label><input name="registro" value={garante.registro} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Tomo 5, Folio 200" style={inp} /></div>
                      <div><label style={lbl}>Ciudad del inmueble en garantía</label><input name="ciudad_prop" value={garante.ciudad_prop} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Rosario" style={inp} /></div>
                      <div><label style={lbl}>Provincia</label><input name="provincia_prop" value={garante.provincia_prop} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Santa Fe" style={inp} /></div>
                    </>)}
                    {garante.tipo === 'Recibo de Sueldo' && (<>
                      <div><label style={lbl}>Empresa empleadora</label><input name="empresa" value={garante.empresa} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Empresa SA" style={inp} /></div>
                      <div><label style={lbl}>Cargo / Antigüedad</label><input name="cargo" value={garante.cargo} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Contador, 5 años" style={inp} /></div>
                    </>)}
                    {garante.tipo === 'Seguro de Caución' && (<>
                      <div><label style={lbl}>Aseguradora</label><input name="aseguradora" value={garante.aseguradora} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: Federación Patronal" style={inp} /></div>
                      <div><label style={lbl}>Número de póliza</label><input name="poliza" value={garante.poliza} onChange={(e) => handleChangeGarante(idx, e)} placeholder="Ej: POL-2026-00123" style={inp} /></div>
                    </>)}
                  </React.Fragment>
                ))}
                {garantes.length < 3 && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <button onClick={agregarGarante} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px dashed #F5A623', background: '#FFFBF0', color: '#92400E', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      + Agregar otro garante
                    </button>
                  </div>
                )}

                {/* Inmueble */}
                <div style={sec}>El Inmueble</div>
                <div><label style={lbl}>Tipo</label><select name="inmueble_tipo" value={formAlquiler.inmueble_tipo} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>{['Departamento','Casa','Local comercial','Oficina'].map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label style={lbl}>Destino</label><select name="inmueble_destino" value={formAlquiler.inmueble_destino} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>{['Vivienda familiar','Comercial','Profesional'].map(d => <option key={d}>{d}</option>)}</select></div>
                <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Dirección exacta *</label><input name="inmueble_direccion" value={formAlquiler.inmueble_direccion} onChange={handleChangeAlquiler} placeholder="Ej: Córdoba 2500, Rosario" style={inp} /></div>
                <div><label style={lbl}>Piso / Dpto</label><input name="inmueble_piso_dpto" value={formAlquiler.inmueble_piso_dpto} onChange={handleChangeAlquiler} placeholder="Ej: 3° B" style={inp} /></div>
                <div><label style={lbl}>Código Postal</label><input name="inmueble_cp" value={formAlquiler.inmueble_cp} onChange={handleChangeAlquiler} placeholder="Ej: S2000" style={inp} /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Estado de entrega</label><input name="inmueble_estado" value={formAlquiler.inmueble_estado} onChange={handleChangeAlquiler} placeholder="Ej: Buen estado general, pintura nueva" style={inp} /></div>

                {/* Plazos */}
                <div style={sec}>Plazos</div>
                <div><label style={lbl}>Fecha de inicio</label><input name="fecha_inicio" value={formAlquiler.fecha_inicio} onChange={handleChangeAlquiler} placeholder="Ej: 01/07/2026" style={inp} /></div>
                <div><label style={lbl}>Duración (meses)</label><input name="duracion_meses" value={formAlquiler.duracion_meses} onChange={handleChangeAlquiler} type="number" min="1" style={inp} /></div>

                {/* Condiciones económicas */}
                <div style={sec}>Condiciones Económicas</div>
                <div><label style={lbl}>Monto primer alquiler *</label><input name="monto_alquiler" value={formAlquiler.monto_alquiler} onChange={handleChangeAlquiler} placeholder="Ej: 250000" style={inp} /></div>
                <div><label style={lbl}>Moneda</label><select name="moneda_alquiler" value={formAlquiler.moneda_alquiler} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}><option value="ARS">Pesos (ARS)</option><option value="USD">Dólares (USD)</option></select></div>
                <div><label style={lbl}>Índice de actualización</label><select name="indice" value={formAlquiler.indice} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>{['ICL','IPC','CER','Fijo','Sin ajuste'].map(i => <option key={i}>{i}</option>)}</select></div>
                <div><label style={lbl}>Periodicidad de ajuste</label><select name="periodicidad" value={formAlquiler.periodicidad} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>{['Mensual','Trimestral','Cuatrimestral','Semestral','Anual'].map(p => <option key={p}>{p}</option>)}</select></div>
                <div><label style={lbl}>Días de pago (desde)</label><input name="dias_desde" value={formAlquiler.dias_desde} onChange={handleChangeAlquiler} type="number" min="1" max="28" style={inp} /></div>
                <div><label style={lbl}>Días de pago (hasta)</label><input name="dias_hasta" value={formAlquiler.dias_hasta} onChange={handleChangeAlquiler} type="number" min="1" max="28" style={inp} /></div>
                <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Método de pago</label><select name="metodo_pago" value={formAlquiler.metodo_pago} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}><option>Transferencia bancaria</option><option>Efectivo</option></select></div>

                {/* Depósito */}
                <div style={sec}>Depósito en Garantía</div>
                <div><label style={lbl}>Monto del depósito</label><input name="monto_deposito" value={formAlquiler.monto_deposito} onChange={handleChangeAlquiler} placeholder="Ej: 250000" style={inp} /></div>
                <div><label style={lbl}>Moneda del depósito</label><select name="moneda_deposito" value={formAlquiler.moneda_deposito} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}><option value="ARS">Pesos (ARS)</option><option value="USD">Dólares (USD)</option></select></div>

                {/* Servicios e Impuestos */}
                <div style={sec}>Servicios e Impuestos</div>
                <div style={{ gridColumn: 'span 2', background: '#F9FAFB', borderRadius: '10px', padding: '4px 0', border: '1px solid #F3F4F6' }}>
                  {serviciosItems.map((item, i) => (
                    <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: i < serviciosItems.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{item.label}</span>
                      <select name={item.name} value={formAlquiler[item.name]} onChange={handleChangeAlquiler}
                        style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: '6px', fontSize: '13px', color: '#111827', background: 'white', cursor: 'pointer' }}>
                        {responsables.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Mora */}
                <div style={sec}>Interés por Mora</div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={lbl}>Tipo de interés moratorio</label>
                  <select name="mora_tipo" value={formAlquiler.mora_tipo} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>
                    <option>Porcentaje mensual</option>
                    <option>Tasa activa BNA</option>
                    <option>Tasa pasiva BCRA</option>
                  </select>
                </div>
                {formAlquiler.mora_tipo === 'Porcentaje mensual' && (
                  <div>
                    <label style={lbl}>Porcentaje mensual (%)</label>
                    <input name="mora_porcentaje" value={formAlquiler.mora_porcentaje} onChange={handleChangeAlquiler} type="number" min="1" max="100" placeholder="Ej: 5" style={inp} />
                  </div>
                )}
                <div>
                  <label style={lbl}>Días de gracia antes de aplicar mora</label>
                  <select name="mora_dias_gracia" value={formAlquiler.mora_dias_gracia} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}>
                    {['0','3','5','7','10'].map(d => <option key={d}>{d} {d === '0' ? '(sin gracia)' : d === '1' ? 'día' : 'días'}</option>)}
                  </select>
                </div>

                {/* Resolución */}
                <div style={sec}>Resolución y Jurisdicción</div>
                <div><label style={lbl}>Preaviso de rescisión</label><select name="preaviso" value={formAlquiler.preaviso} onChange={handleChangeAlquiler} style={{ ...inp, background: 'white' }}><option>30 días</option><option>60 días</option></select></div>
                <div><label style={lbl}>Jurisdicción</label><input name="jurisdiccion" value={formAlquiler.jurisdiccion} onChange={handleChangeAlquiler} placeholder="Ej: Tribunales Provinciales de Rosario" style={inp} /></div>

                {/* Firma */}
                {conFirma && (
                  <div style={{ gridColumn: 'span 2', background: '#F0FDF4', borderRadius: '10px', padding: '16px', border: '1px solid #BBF7D0' }}>
                    <p style={{ fontSize: '13px', color: '#15803D', margin: '0 0 12px', fontWeight: 500 }}>
                      ✓ Locador{locadores.length > 1 ? 'es' : ''}, locatario{garantes.some(g => g.email) ? ' y garantes' : ''} recibirán un email para firmar digitalmente.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {locadores.map((l, i) => (
                        <div key={i}><label style={lbl}>Email del locador {locadores.length > 1 ? i + 1 : ''} {i === 0 ? '*' : ''}</label><input name="email" value={l.email} onChange={(e) => handleChangeLocador(i, e)} type="email" placeholder="locador@email.com" style={inp} /></div>
                      ))}
                      <div><label style={lbl}>Email del locatario *</label><input name="locatario_email" value={formAlquiler.locatario_email} onChange={handleChangeAlquiler} type="email" placeholder="inquilino@email.com" style={inp} /></div>
                    </div>
                    {garantes.some(g => g.email) && (
                      <div style={{ marginTop: '12px', padding: '10px 12px', background: '#DCFCE7', borderRadius: '8px' }}>
                        <p style={{ fontSize: '12px', color: '#15803D', margin: '0 0 6px', fontWeight: 600 }}>Garantes que firmarán:</p>
                        {garantes.filter(g => g.email).map((g, i) => (
                          <p key={i} style={{ fontSize: '12px', color: '#166534', margin: '2px 0' }}>✓ {g.nombre || `Garante ${i + 1}`} — {g.email}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && <p style={{ color: '#DC2626', fontSize: '14px', marginTop: '16px' }}>{error}</p>}

            <button onClick={handleGenerar} disabled={loading || !canGenerate}
              style={{ marginTop: '28px', width: '100%', padding: '14px', borderRadius: '10px', background: (loading || !canGenerate) ? '#9CA3AF' : '#F5A623', color: '#0A1628', border: 'none', fontSize: '16px', fontWeight: 600, cursor: (loading || !canGenerate) ? 'not-allowed' : 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>
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
                <button onClick={handleDescargar} style={{ padding: '10px 22px', borderRadius: '8px', background: '#0A1628', color: '#F5A623', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Space Grotesk, sans-serif' }}>↓ Descargar PDF</button>
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
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.9', color: '#374151', fontFamily: 'Georgia, serif', borderTop: '1px solid #F3F4F6', paddingTop: '24px', margin: 0 }}>{contrato}</pre>
            </div>
            <button onClick={() => { setContrato(''); setLinks([]); }} style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>← Generar otro contrato</button>
          </div>
        )}
      </div>
    </main>
  );
}