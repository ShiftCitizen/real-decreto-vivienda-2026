import type { Metadata } from 'next';
import Script from 'next/script';
import SiteNav from '@/components/SiteNav';
import WebMcpTools from '@/components/WebMcpTools';
import ChatWidget from '@/components/ChatWidget';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'RDL 26/2026 y 27/2026 · vivienda | Vivienda 2026',
    template: '%s | Vivienda 2026',
  },
  description:
    'Análisis del Real Decreto-ley 26/2026 y del Real Decreto-ley 27/2026: función social de la vivienda, alquiler, fiscalidad, financiación y régimen sancionador.',
  authors: [{ name: 'Carlos Marchena', url: 'https://www.linkedin.com/in/cmarchena/' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        {/* Excepción aprobada por el propietario a la regla de no usar CDN:
            AgentLane registra las herramientas del sitio en
            document.modelContext para que los agentes las descubran vía
            WebMCP. data-domain es un identificador público del sitio. */}
        <Script
          src="https://cdn.agentlane.com/v1/snippet.js"
          data-domain="dom-cfb1061sr1jh"
          strategy="beforeInteractive"
        />
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteNav />
        <WebMcpTools />
        <ChatWidget />
        <main className="main-content" id="contenido">
          {children}
        </main>
        <footer className="site-footer" id="autor">
          Análisis divulgativo, sin valor de asesoramiento jurídico; prevalece el texto
          oficial (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a>,
          30-09-2026) y (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>,
          01-10-2026), con los que se ha contrastado el articulado.
          <br />
          ©{' '}
          <a href="https://www.linkedin.com/in/cmarchena/" target="_blank" rel="noreferrer">
            Carlos Marchena
          </a>{' '}
          2026 · Resumen no oficial elaborado con ayuda de herramientas de inteligencia
          artificial. El texto oficial es el publicado en el BOE.
        </footer>
      </body>
    </html>
  );
}
