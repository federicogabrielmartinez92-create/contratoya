export const PLANES = {
  express: {
    nombre: 'Express',
    precio: 3.99,
    creditos: 1,
    titulo: 'ContratoYa Express — 1 contrato con firma digital',
    descripcion: 'Pagás solo cuando lo necesitás.',
    features: ['1 contrato con firma digital', 'Válido legalmente en Argentina', 'Audit trail y certificado', 'Sin vencimiento'],
    color: '#0A1628',
    destacado: true,
  },
  pro: {
    nombre: 'Pro',
    precio: 24.99,
    creditos: 7,
    titulo: 'ContratoYa Pro — 7 contratos con firma digital',
    descripcion: 'Para freelancers con varios clientes.',
    features: ['7 contratos con firma digital', 'Todos los rubros (servicios y alquiler)', 'Historial completo', 'Sin vencimiento'],
    color: '#7C3AED',
    destacado: false,
  },
  business: {
    nombre: 'Business',
    precio: 54.99,
    creditos: 20,
    titulo: 'ContratoYa Business — 20 contratos con firma digital',
    descripcion: 'Para estudios, inmobiliarias y equipos.',
    features: ['20 contratos con firma digital', 'Mejor precio por contrato', 'Todos los rubros', 'Soporte prioritario', 'Sin vencimiento'],
    color: '#0F766E',
    destacado: false,
  },
} as const;

export type PlanId = keyof typeof PLANES;