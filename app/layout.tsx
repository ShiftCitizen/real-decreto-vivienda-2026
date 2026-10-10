import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import WebMcpTools from '@/components/WebMcpTools';
import ChatWidget from '@/components/ChatWidget';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://real-decreto-vivienda-2026.vercel.app'),
  title: {
    default: 'Vivienda: los RDL 29/2026 y 28/2026 | Vivienda 2026',
    template: '%s | Vivienda 2026',
  },
  description:
    'El RDL 29/2026 está en vigor desde el 8-10-2026 y el RDL 28/2026 publicado en el BOE el 7-10-2026, pendientes de convalidación. Los RDL 26/2026 y 27/2026 quedaron derogados el 2-10-2026.',
  authors: [{ name: 'Carlos Marchena', url: 'https://www.linkedin.com/in/cmarchena/' }],
  openGraph: {
    title: 'Vivienda: los RDL 29/2026 y 28/2026',
    description:
      'El RDL 29/2026 está en vigor desde el 8-10-2026 y el RDL 28/2026 publicado en el BOE el 7-10-2026, pendientes de convalidación. Los RDL 26/2026 y 27/2026 quedaron derogados el 2-10-2026.',
    url: '/',
    siteName: 'Vivienda 2026',
    locale: 'es_ES',
    type: 'website',
    images: [{ url: '/assets/hero.jpg' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
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
          30-09-2026), (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>,
          01-10-2026), (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20823">BOE-A-2026-20823</a>,
          07-10-2026) y (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20822">BOE-A-2026-20822</a>,
          07-10-2026), con los que se ha contrastado el articulado.
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
