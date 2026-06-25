import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}