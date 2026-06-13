import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Plan = 'gratis' | 'express' | 'pro';

export interface Usuario {
  id: string;
  email: string;
  plan: Plan;
  contratos_usados: number;
  contratos_mes: number;
  fecha_reset: string;
}

export async function getUsuario(): Promise<Usuario | null> {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', user.id)
    .single();
  return data;
}

export async function puedeGenerar(usuario: Usuario): Promise<{ ok: boolean; motivo?: string }> {
  const hoy   = new Date().toISOString().split('T')[0];
  const reset = new Date(usuario.fecha_reset);
  const ahora = new Date(hoy);
  if (ahora.getMonth() !== reset.getMonth() || ahora.getFullYear() !== reset.getFullYear()) {
    const supabase = createSupabaseClient();
    await supabase.from('usuarios').update({ contratos_mes: 0, fecha_reset: hoy }).eq('id', usuario.id);
    usuario.contratos_mes = 0;
  }
  if (usuario.plan === 'gratis' && usuario.contratos_usados >= 1) return { ok: false, motivo: 'gratis_agotado' };
  if (usuario.plan === 'pro'    && usuario.contratos_mes    >= 15) return { ok: false, motivo: 'pro_limite' };
  return { ok: true };
}