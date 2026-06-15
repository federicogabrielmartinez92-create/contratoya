import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo = 'servicios' } = body;

    let prompt = '';

    if (tipo === 'alquiler') {
      const {
        locador_nombre, locador_dni, locador_estado_civil, locador_domicilio, locador_email,
        locatario_nombre, locatario_dni, locatario_estado_civil, locatario_email,
        garante_tipo, garante_nombre, garante_dni, garante_domicilio, garante_email,
        garante_matricula, garante_registro, garante_ciudad_prop, garante_provincia_prop,
        garante_empresa, garante_cargo, garante_aseguradora, garante_poliza,
        inmueble_tipo, inmueble_direccion, inmueble_piso_dpto, inmueble_cp,
        inmueble_destino, inmueble_estado,
        fecha_inicio, duracion_meses,
        monto_alquiler, moneda_alquiler, indice, periodicidad, dias_desde, dias_hasta, metodo_pago,
        monto_deposito, moneda_deposito,
        servicios_obs, preaviso, jurisdiccion,
      } = body;

      // Detalle del garante según tipo
      let detalleGarante = '';
      if (garante_tipo === 'Propietaria') {
        detalleGarante = `Garantía propietaria. Matrícula: ${garante_matricula}, Registro: ${garante_registro}, Ubicación: ${garante_ciudad_prop}, ${garante_provincia_prop}.`;
      } else if (garante_tipo === 'Recibo de Sueldo') {
        detalleGarante = `Garantía por recibo de sueldo. Empresa: ${garante_empresa}, Cargo/Antigüedad: ${garante_cargo}.`;
      } else if (garante_tipo === 'Seguro de Caución') {
        detalleGarante = `Garantía por seguro de caución. Aseguradora: ${garante_aseguradora}, Póliza N°: ${garante_poliza}.`;
      }

      prompt = `Generá un contrato de locación (alquiler) completo y formal conforme a la legislación argentina vigente (Ley 27.551 y modificatorias, Código Civil y Comercial de la Nación).

LOCADOR: ${locador_nombre}, DNI/CUIT: ${locador_dni}, Estado civil: ${locador_estado_civil}, Domicilio: ${locador_domicilio}, Email: ${locador_email}

LOCATARIO: ${locatario_nombre}, DNI/CUIT: ${locatario_dni}, Estado civil: ${locatario_estado_civil}, Email: ${locatario_email}

GARANTE: ${garante_nombre}, DNI: ${garante_dni}, Domicilio: ${garante_domicilio}, Email: ${garante_email}
Tipo de garantía: ${garante_tipo}. ${detalleGarante}

INMUEBLE: ${inmueble_tipo} ubicado en ${inmueble_direccion}${inmueble_piso_dpto ? `, ${inmueble_piso_dpto}` : ''}, CP: ${inmueble_cp}
Destino: ${inmueble_destino}
Estado de entrega: ${inmueble_estado || 'Buen estado general'}

PLAZOS: Inicio: ${fecha_inicio} — Duración: ${duracion_meses} meses

CONDICIONES ECONÓMICAS:
- Monto inicial: ${monto_alquiler} ${moneda_alquiler}
- Índice de actualización: ${indice}, periodicidad: ${periodicidad}
- Período de pago: del día ${dias_desde} al ${dias_hasta} de cada mes
- Método de pago: ${metodo_pago}

DEPOSITO EN GARANTIA: ${monto_deposito} ${moneda_deposito}

SERVICIOS E IMPUESTOS: ${servicios_obs}

RESCISION: Preaviso de ${preaviso}

JURISDICCION: ${jurisdiccion}

INSTRUCCIONES:
- Español formal legal argentino
- Incluir obligatoriamente: objeto y destino, plazo y renovación, precio y actualización (cláusula ICL/índice detallada), depósito y condiciones de devolución, servicios e impuestos, conservación del inmueble, prohibición de subalquilar, cláusula de garantía según tipo, rescisión anticipada y preaviso, mora, jurisdicción y competencia
- Espacios para firmas de locador, locatario y garante al final
- Sin markdown: sin asteriscos, sin ##, sin ---. Títulos en MAYÚSCULAS con numeración (PRIMERA, SEGUNDA, etc.)
- Solo el texto del contrato, sin comentarios adicionales`;

    } else {
      // ── Contrato de servicios (lógica original) ──────────────
      const { prestador, cuit_prestador, cliente, cuit_cliente, servicio, monto, moneda, plazo, ciudad, fecha, condiciones_pago } = body;

      prompt = `Generá un contrato profesional de prestación de servicios para freelancer argentino.

DATOS:
- Prestador: ${prestador} (CUIT: ${cuit_prestador})
- Cliente: ${cliente} (CUIT: ${cuit_cliente})
- Servicio: ${servicio}
- Monto: ${monto} ${moneda}
- Plazo de entrega: ${plazo}
- Ciudad: ${ciudad || 'Buenos Aires'}
- Fecha: ${fecha}
- Condiciones de pago: ${condiciones_pago}

INSTRUCCIONES:
- Español formal argentino
- Conforme al Código Civil y Comercial de la Nación Argentina
- Incluir: objeto, honorarios y forma de pago (${condiciones_pago}), plazo, propiedad intelectual, confidencialidad, mora (2% mensual), rescisión, jurisdicción en ${ciudad || 'Buenos Aires'}
- Espacios para firmas al final con nombre y aclaración
- Solo el texto del contrato, sin comentarios adicionales
- NO uses markdown: sin asteriscos, sin ##, sin ---. Títulos en MAYÚSCULAS.`;
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const contrato = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ contrato });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error al generar el contrato' }, { status: 500 });
  }
}