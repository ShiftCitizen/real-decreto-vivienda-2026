import type { Metadata } from 'next';
import { slugify } from '@/lib/slug';
import { revisionDe } from '@/lib/revisiones';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Quién elabora el análisis de los reales decretos-ley de vivienda 2026 y cómo enviar comentarios a ShiftCitizen.',
};

export default function ContactoPage() {
  return (
    <>
      <h1>Contacto</h1>
      <p className="lead">
        Este análisis lo elabora Carlos Marchena (ShiftCitizen). No es un despacho
        ni un servicio de asesoramiento jurídico: es una lectura divulgativa del
        articulado publicado en el BOE.
      </p>

      <h2 id={slugify('Quién hay detrás')}>Quién hay detrás</h2>
      <p>
        <strong>Carlos Marchena</strong>: formación en derecho, desarrollo de
        software con IA para el tercer sector y, desde 2021, enseñanza de
        programación y competencias digitales. ShiftCitizen nace para poner al
        alcance de las organizaciones con impacto social las herramientas
        digitales que necesitan.
      </p>
      <ul>
        <li>
          LinkedIn:{' '}
          <a
            href="https://www.linkedin.com/in/cmarchena/"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/cmarchena
          </a>
        </li>
        <li>
          Sitio:{' '}
          <a href="https://shiftcitizen.com" target="_blank" rel="noopener noreferrer">
            shiftcitizen.com
          </a>
        </li>
      </ul>

      <h2 id={slugify('Comentarios y correcciones')}>Comentarios y correcciones</h2>
      <p>
        Si encuentras un error, una omisión o quieres sugerir una mejora en este
        análisis, escribe a{' '}
        <a href="mailto:contacto@shiftcitizen.com">contacto@shiftcitizen.com</a>.
        Respuestas a mensajes personales sobre tu caso concreto quedan fuera del
        alcance de este sitio.
      </p>

      <p className="page-meta">Última revisión: {revisionDe('/contacto')}.</p>
    </>
  );
}
