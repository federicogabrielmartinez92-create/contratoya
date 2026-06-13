'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/generar');
      }
    });
  }, [router]);

  return (
    <main style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#F5A623', fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600 }}>
          Iniciando sesión...
        </p>
      </div>
    </main>
  );
}