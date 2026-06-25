import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pactia — Contratos y firma digital en minutos",
  description: "Generá contratos legales actualizados al Código Civil y Comercial, o subí los tuyos, y enviálos a firmar digitalmente. Sin abogados, sin papeles, sin suscripciones.",
  openGraph: {
    title: "Pactia — Contratos y firma digital en minutos",
    description: "Generá o subí tu contrato y enviálo a firmar digitalmente. Hecho para Argentina.",
    url: "https://pactia.com.ar",
    siteName: "Pactia",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}