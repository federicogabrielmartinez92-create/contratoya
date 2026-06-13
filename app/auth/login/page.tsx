'use client';
export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [modo,     setModo]     = useState<'login'|'register'>('login');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  );

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSubmit = async () => {
    if (!email || !password) { setError('Completá email y contraseña'); return; }
    setLoading(true); setError('');
    try {
      if (modo === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('✓ Revisá tu email para confirmar tu cuenta');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/generar');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', border:'1px solid #E5E7EB', borderRadius:'8px', fontSize:'14px', color:'#111827', outline:'none', boxSizing:'border-box', fontFamily:'Inter, sans-serif', marginBottom:'16px' };

  return (
    <main style={{ minHeight:'100vh', background:'#0A1628', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif', padding:'20px' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'48px 40px', width:'100%', maxWidth:'420px', boxShadow:'0 24px 80px rgba(0,0,0,0.4)' }}>
        <a href="/" style={{ display:'block', fontFamily:'Space Grotesk, sans-serif', fontSize:'22px', fontWeight:700, color:'#0A1628', textDecoration:'none', marginBottom:'32px' }}>
          Contrato<span style={{color:'#F5A623'}}>Ya</span>
        </a>

        <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'24px', fontWeight:700, color:'#111827', marginBottom:'8px' }}>
          {modo === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}
        </h1>
        <p style={{ fontSize:'14px', color:'#6B7280', marginBottom:'28px' }}>
          {modo === 'login' ? 'Para generar tus contratos' : 'Es gratis, sin tarjeta de crédito'}
        </p>

        {/* Botón Google */}
        <button onClick={handleGoogle}
          style={{ width:'100%', padding:'12px', borderRadius:'10px', background:'#fff', border:'1.5px solid #E5E7EB', fontSize:'15px', fontWeight:500, cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', color:'#111827' }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continuar con Google
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
          <div style={{ flex:1, height:'1px', background:'#E5E7EB' }}/>
          <span style={{ fontSize:'13px', color:'#9CA3AF' }}>o</span>
          <div style={{ flex:1, height:'1px', background:'#E5E7EB' }}/>
        </div>

        <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inp} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} style={inp} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

        {error && (
          <p style={{ fontSize:'13px', color: error.startsWith('✓') ? '#16A34A' : '#DC2626', marginBottom:'16px' }}>{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', padding:'14px', borderRadius:'10px', background: loading ? '#9CA3AF' : '#F5A623', color:'#0A1628', border:'none', fontSize:'15px', fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'Space Grotesk, sans-serif', marginBottom:'20px' }}>
          {loading ? 'Cargando...' : modo === 'login' ? 'Ingresar →' : 'Crear cuenta →'}
        </button>

        <p style={{ fontSize:'14px', color:'#6B7280', textAlign:'center' }}>
          {modo === 'login' ? '¿No tenés cuenta? ' : '¿Ya tenés cuenta? '}
          <button onClick={() => { setModo(modo === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background:'none', border:'none', color:'#F5A623', fontWeight:600, cursor:'pointer', fontSize:'14px' }}>
            {modo === 'login' ? 'Registrate gratis' : 'Iniciá sesión'}
          </button>
        </p>
      </div>
    </main>
  );
}