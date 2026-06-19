import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo = 'servicios', con_firma = false } = body;

    const instruccionFirma = con_firma
      ? `Este documento se firmará digitalmente a través de una plataforma de firma electrónica que agrega su propia hoja de validación al final. Por eso: NO incluyas espacios de firma manual (no agregues líneas para firma, aclaración, cargo, fecha ni bloques repetidos de datos de las partes al final del documento). El contrato debe terminar directamente después de la última cláusula (jurisdicción), sin sección de firmas.`
      : `Este documento se firmará en papel, de forma manuscrita. Al final del contrato, dejá espacios claros de firma para cada parte, con líneas para: nombre completo, aclaración, cargo (si corresponde) y fecha.`;

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
- ${instruccionFirma}
- Sin markdown: sin asteriscos, sin ##, sin ---. Títulos en MAYÚSCULAS con numeración (PRIMERA, SEGUNDA, etc.)
- Solo el texto del contrato, sin comentarios adicionales`;

    } else {
      const {
        prestador, cuit_prestador, cliente, cuit_cliente,
        representante_cliente, cargo_representante,
        servicio, monto, moneda, plazo, ciudad, fecha,
        condiciones_pago, revisiones,
      } = body;

      const clienteInfo = representante_cliente
        ? `${cliente}${cuit_cliente ? ` (CUIT: ${cuit_cliente})` : ''}, representado por ${representante_cliente}${cargo_representante ? `, ${cargo_representante}` : ''}`
        : `${cliente}${cuit_cliente ? ` (CUIT: ${cuit_cliente})` : ''}`;

      prompt = `Generá un contrato profesional de prestación de servicios para freelancer argentino, conforme al Código Civil y Comercial de la Nación.

DATOS:
- Prestador: ${prestador} (CUIT: ${cuit_prestador})
- Cliente: ${clienteInfo}
- Servicio: ${servicio}
- Monto: ${monto} ${moneda}
- Condiciones de pago: ${condiciones_pago}
- Plazo de entrega: ${plazo || 'A acordar entre las partes'}
- Rondas de revisión incluidas: ${revisiones || '2'}
- Ciudad: ${ciudad || 'Rosario'}
- Fecha: ${fecha}

INSTRUCCIONES - Incluí OBLIGATORIAMENTE estas cláusulas:

1. IDENTIFICACIÓN DE PARTES: Si el cliente tiene representante legal, identificarlo con nombre y cargo en el cuerpo del contrato.

2. OBJETO Y ALCANCE DEL SERVICIO: Describir el servicio. Establecer explícitamente que el precio base incluye ${revisiones || '2'} ronda(s) de revisión. Toda revisión adicional se cotizará y facturará por separado previo al inicio.

3. RESERVA DE PROPIEDAD INTELECTUAL: Los archivos fuente, derechos de autor y licencias de uso NO se transfieren al cliente hasta la acreditación del 100% del pago total acordado. Hasta entonces, el prestador conserva todos los derechos. El cliente solo recibe una licencia de uso limitada y no exclusiva una vez saldada la deuda en su totalidad.

4. PRECIO, PAGO E INTERÉS PUNITORIO: Establecer el monto y condiciones de pago (${condiciones_pago}). Ante mora en el pago, aplicar un interés punitorio del 0,5% diario sobre el saldo impago desde la fecha de vencimiento, sin necesidad de interpelación judicial o extrajudicial.

5. CONFIDENCIALIDAD (NDA): Ambas partes se obligan a mantener confidencialidad sobre información técnica, comercial y estratégica que accedan con motivo del presente contrato, con vigencia de 3 años post-finalización.

6. RESCISIÓN: Cualquier parte puede rescindir con 15 días de preaviso escrito. Si rescinde el cliente, abona los trabajos realizados hasta esa fecha más el 20% del saldo pendiente como compensación.

7. JURISDICCIÓN: Cualquier disputa se resolverá exclusivamente ante los Tribunales Provinciales de Rosario, Santa Fe, renunciando las partes a cualquier otro fuero.

8. CIERRE: ${instruccionFirma}

FORMATO:
- Español formal argentino
- Sin markdown: sin asteriscos, sin ##, sin ---
- Títulos de cláusulas en MAYÚSCULAS con numeración (PRIMERA, SEGUNDA, etc.)
- Solo el texto del contrato, sin comentarios adicionales`;
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