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
        locadores = [], garantes = [],
        locatario_nombre, locatario_dni, locatario_estado_civil, locatario_email,
        inmueble_tipo, inmueble_direccion, inmueble_piso_dpto, inmueble_cp,
        inmueble_destino, inmueble_estado,
        fecha_inicio, duracion_meses,
        monto_alquiler, moneda_alquiler, indice, periodicidad, dias_desde, dias_hasta, metodo_pago,
        monto_deposito, moneda_deposito,
        servicio_luz, servicio_gas, servicio_agua, servicio_internet,
        expensas_ordinarias, expensas_extraordinarias, impuesto_inmobiliario, tasa_municipal,
        mora_tipo, mora_porcentaje, mora_dias_gracia,
        preaviso, jurisdiccion,
      } = body;

      const locadoresTexto = locadores.map((l: Record<string, string>, idx: number) =>
        `LOCADOR${locadores.length > 1 ? ` ${idx + 1}` : ''}: ${l.nombre}, DNI/CUIT: ${l.dni}, Estado civil: ${l.estado_civil}, Domicilio: ${l.domicilio}, Email: ${l.email}`
      ).join('\n');

      const garantesTexto = garantes.map((g: Record<string, string>, idx: number) => {
        let detalle = '';
        if (g.tipo === 'Propietaria')       detalle = `Garantía propietaria. Matrícula: ${g.matricula}, Registro: ${g.registro}, Ubicación: ${g.ciudad_prop}, ${g.provincia_prop}.`;
        if (g.tipo === 'Recibo de Sueldo')  detalle = `Garantía por recibo de sueldo. Empresa: ${g.empresa}, Cargo: ${g.cargo}.`;
        if (g.tipo === 'Seguro de Caución') detalle = `Garantía por seguro de caución. Aseguradora: ${g.aseguradora}, Póliza N°: ${g.poliza}.`;
        return `GARANTE ${idx + 1}: ${g.nombre}, DNI: ${g.dni}, Domicilio: ${g.domicilio}, Email: ${g.email}\nTipo: ${g.tipo}. ${detalle}`;
      }).join('\n\n');

      const serviciosTexto = [
        { label: 'Electricidad',              value: servicio_luz },
        { label: 'Gas',                       value: servicio_gas },
        { label: 'Agua',                      value: servicio_agua },
        { label: 'Internet / Cable',          value: servicio_internet },
        { label: 'Expensas ordinarias',       value: expensas_ordinarias },
        { label: 'Expensas extraordinarias',  value: expensas_extraordinarias },
        { label: 'Impuesto inmobiliario',     value: impuesto_inmobiliario },
        { label: 'Tasa municipal (TGI)',      value: tasa_municipal },
      ]
        .filter(s => s.value !== 'No aplica')
        .map(s => `- ${s.label}: a cargo del ${s.value}`)
        .join('\n');

      const diasGracia = parseInt(mora_dias_gracia ?? '5');
      const diaInicio  = diasGracia === 0 ? '1' : `${diasGracia + 1}`;
      const moraTexto  = mora_tipo === 'Porcentaje mensual'
        ? `${mora_porcentaje}% mensual sobre el monto adeudado, desde el día ${diaInicio} de atraso`
        : `${mora_tipo} sobre el monto adeudado, desde el día ${diaInicio} de atraso`;

      prompt = `Generá un contrato de locación (alquiler) completo y formal conforme a la legislación argentina vigente (Ley 27.551 y modificatorias, Código Civil y Comercial de la Nación).

${locadoresTexto}

LOCATARIO: ${locatario_nombre}, DNI/CUIT: ${locatario_dni}, Estado civil: ${locatario_estado_civil}, Email: ${locatario_email}

${garantesTexto}

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

SERVICIOS E IMPUESTOS:
${serviciosTexto}

MORA POR ATRASO EN EL PAGO: ${moraTexto}

RESCISION: Preaviso de ${preaviso}

JURISDICCION: ${jurisdiccion}

INSTRUCCIONES:
- Español formal legal argentino
- Incluir obligatoriamente: objeto y destino, plazo y renovación, precio y actualización (cláusula índice detallada), depósito y condiciones de devolución, distribución de servicios e impuestos según lo indicado, cláusula de mora con el interés indicado, conservación del inmueble, prohibición de subalquilar, cláusula de garantía según tipo, rescisión anticipada y preaviso, jurisdicción y competencia
- Espacios para firmas de todos los locadores, locatario y garantes al final
- Sin markdown: sin asteriscos, sin ##, sin ---. Títulos en MAYÚSCULAS con numeración (PRIMERA, SEGUNDA, etc.)
- Solo el texto del contrato, sin comentarios adicionales`;

    } else {
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
- NO uses markdown: sin asteriscos, sin ##, sin ##, sin ---. Títulos en MAYÚSCULAS.`;
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