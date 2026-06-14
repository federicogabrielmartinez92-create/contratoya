'use client';
import { useRouter } from 'next/navigation';

export default function ErrorPage() {
  const router = useRouter();
  return (
    <main style={{ minHeight:'100vh', background:'#0A1628', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter, sans-serif' }}>
      <div style={{ background:'#fff', borderRadius:'20px', padding:'48px 40px', maxWidth:'420px', width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>😕</div>
        <h1 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'24px', fontWeight:700, color:'#111827', marginBottom:'8px' }}>
          El pago no se procesó
        </h1>
        <p style={{ fontSize:'14px', color:'#6B7280', marginBottom:'24px' }}>
          No se realizó ningún cobro. Podés intentarlo de nuevo.
        </p>
        <button onClick={() => router.push('/precios')}
          style={{ padding:'12px 24px', borderRadius:'10px', background:'#F5A623', color:'#0A1628', border:'none', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
          Volver a los planes
        </button>
      </div>
    </main>
  );
}