import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailFirma(params: {
  destinatarioNombre: string;
  destinatarioEmail: string;
  signUrl: string;
  nombreDocumento: string;
}) {
  const { destinatarioNombre, destinatarioEmail, signUrl, nombreDocumento } = params;

  try {
    await resend.emails.send({
      from: 'Pactia <firmas@pactia.com.ar>',
      to: destinatarioEmail,
      subject: `Tenés un contrato para firmar: ${nombreDocumento}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color:#0A1628; margin-bottom: 24px;">Pact<span style="color:#F5A623;">ia</span></h2>
          <p>Hola ${destinatarioNombre},</p>
          <p>Tenés un contrato esperando tu firma digital: <strong>${nombreDocumento}</strong>.</p>
          <p style="margin: 24px 0;">
            <a href="${signUrl}" style="background:#F5A623;color:#0A1628;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
              Firmar contrato →
            </a>
          </p>
          <p style="font-size:13px;color:#6B7280;">Si el botón no funciona, copiá y pegá este link en tu navegador:<br>${signUrl}</p>
          <p style="font-size:12px;color:#9CA3AF;margin-top:32px;">Este email fue enviado por Pactia (pactia.com.ar)</p>
        </div>
      `,
    });
  } catch (err) {
    console.error(`Error enviando email a ${destinatarioEmail}:`, err);
  }
}