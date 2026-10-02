import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import WebMcpTools from '@/components/WebMcpTools';
import ChatWidget from '@/components/ChatWidget';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://real-decreto-vivienda-2026.vercel.app'),
  title: {
    default: 'Vivienda: los RDL 26/2026 y 27/2026, derogados | Vivienda 2026',
    template: '%s | Vivienda 2026',
  },
  description:
    'El Congreso rechazó el 2-10-2026 los dos decretos de vivienda: quedan derogados. Resultado de la votación, consecuencias y preguntas.',
  authors: [{ name: 'Carlos Marchena', url: 'https://www.linkedin.com/in/cmarchena/' }],
  openGraph: {
    title: 'Vivienda: los RDL 26/2026 y 27/2026, derogados',
    description:
      'El Congreso rechazó el 2-10-2026 los dos decretos de vivienda: quedan derogados. Resultado, consecuencias y preguntas.',
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
