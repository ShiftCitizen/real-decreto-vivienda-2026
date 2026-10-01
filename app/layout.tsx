import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'RDL 26/2026 y 27/2026 · vivienda | Vivienda 2026',
    template: '%s | Vivienda 2026',
  },
  description:
    'Análisis del Real Decreto-ley 26/2026 y del Real Decreto-ley 27/2026: función social de la vivienda, alquiler, fiscalidad, financiación y régimen sancionador.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteNav />
        <main className="main-content" id="contenido">
          {children}
        </main>
        <footer className="site-footer">
          Análisis divulgativo, sin valor de asesoramiento jurídico; prevalece el texto
          oficial (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a>,
          30-09-2026) y (
          <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>,
          01-10-2026), con los que se ha contrastado el articulado.
          <br />
          Cocreado con Claude · © Carlos Marchena 2026
        </footer>
      </body>
    </html>
  );
}
