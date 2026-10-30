import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buscar, esSaludo, palabrasDeConsulta } from '@/lib/busqueda';
import { seleccionar } from '@/lib/okf';
import type { TablaOkf } from '@/lib/okf';
import type { EntradaIndice } from '@/lib/busqueda';

export type ResultadoOkf = {
  niega: boolean;
  titulos: string[];
  hrefs: string[];
  contexto: string;
};

const root = join(import.meta.dirname, '../..');

export function cargarIndices(): { indice: EntradaIndice[]; okf: TablaOkf } {
  const indice = JSON.parse(
    readFileSync(join(root, 'public/search-index.json'), 'utf8'),
  ) as EntradaIndice[];
  const okf = JSON.parse(readFileSync(join(root, 'public/okf-index.json'), 'utf8')) as TablaOkf;
  return { indice, okf };
}

export function comoOkf(pregunta: string, okf: TablaOkf): ResultadoOkf {
  const evidencia = seleccionar(pregunta, okf);
  if (!evidencia) return { niega: true, titulos: [], hrefs: [], contexto: '' };
  return {
    niega: false,
    titulos: evidencia.map((e) => e.titulo),
    hrefs: evidencia.map((e) => e.href),
    contexto: evidencia.map((e) => e.texto).join('\n\n'),
  };
}

export function comoBuscar(pregunta: string, indice: EntradaIndice[]) {
  const utiles = buscar(indice, pregunta).slice(0, 3);
  return {
    niega: utiles.length === 0,
    titulos: utiles.map((r) => r.titulo),
    hrefs: utiles.map((r) => r.href),
    contexto: utiles.map((r) => r.contexto).join('\n\n'),
  };
}

/** Scope gate como en la ruta: saludo, sin palabras de contenido, o OKF vacío. */
export function esNegativaScope(pregunta: string, okf: TablaOkf): boolean {
  if (esSaludo(pregunta)) return true;
  if (palabrasDeConsulta(pregunta).length === 0) return true;
  return seleccionar(pregunta, okf) === null;
}

export function hrefValido(href: string, indice: EntradaIndice[]): boolean {
  if (!href.startsWith('/')) return false;
  if (href.includes('.md')) return false;
  const base = href.split('#')[0] || '/';
  return indice.some((e) => {
    const eb = e.href.split('#')[0] || '/';
    return e.href === href || eb === base;
  });
}

/** Match against href and/or title (FAQ de desahucio vive en `/` sin hash). */
export function coincideTopic(
  hrefs: string[],
  topic: string,
  titulos: string[] = [],
): boolean {
  if (hrefs.some((h) => h.includes(topic))) return true;
  return titulos.some((t) => t.toLowerCase().includes(topic.toLowerCase()));
}
