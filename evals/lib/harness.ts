import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buscar, esSaludo, palabrasDeConsulta } from '@/lib/busqueda';
import { seleccionar } from '@/lib/okf';
import { responderAmplia } from '@/lib/amplia';
import type { TablaOkf } from '@/lib/okf';
import type { EntradaIndice } from '@/lib/busqueda';
import type { CasoEval } from '../types';

export type ResultadoRetrieval = {
  niega: boolean;
  titulos: string[];
  hrefs: string[];
  contexto: string;
};

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../..');

export function cargarIndices(): { indice: EntradaIndice[]; okf: TablaOkf } {
  const indice = JSON.parse(
    readFileSync(join(root, 'public/search-index.json'), 'utf8'),
  ) as EntradaIndice[];
  const okf = JSON.parse(readFileSync(join(root, 'public/okf-index.json'), 'utf8')) as TablaOkf;
  return { indice, okf };
}

export function comoOkf(pregunta: string, okf: TablaOkf): ResultadoRetrieval {
  const evidencia = seleccionar(pregunta, okf);
  if (!evidencia) return { niega: true, titulos: [], hrefs: [], contexto: '' };
  return {
    niega: false,
    titulos: evidencia.map((e) => e.titulo),
    hrefs: evidencia.map((e) => e.href),
    contexto: evidencia.map((e) => e.texto).join('\n\n'),
  };
}

export function comoBuscar(pregunta: string, indice: EntradaIndice[]): ResultadoRetrieval {
  const utiles = buscar(indice, pregunta).slice(0, 3);
  return {
    niega: utiles.length === 0,
    titulos: utiles.map((r) => r.titulo),
    hrefs: utiles.map((r) => r.href),
    contexto: utiles.map((r) => r.contexto).join('\n\n'),
  };
}

export function recuperar(
  caso: CasoEval,
  okf: TablaOkf,
  indice: EntradaIndice[],
): ResultadoRetrieval {
  if (caso.via === 'buscar' || caso.categoria === 'numeric_contamination') {
    return comoBuscar(caso.pregunta, indice);
  }
  return comoOkf(caso.pregunta, okf);
}

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

/**
 * Exige coincidencia exacta del href (incluida el ancla). Un match solo de
 * página base no cuenta: sirve para claims que necesitan un pasaje concreto.
 */
export function hrefAnclaExacta(href: string, indice: EntradaIndice[]): boolean {
  if (!href.startsWith('/')) return false;
  if (href.includes('.md')) return false;
  return indice.some((e) => e.href === href);
}

export type PasajeEvidencia = { href: string; texto: string };

/**
 * ¿El href citado apunta a un pasaje que contiene las frases exigidas?
 * Un match de página base sin el ancla correcto NO basta.
 */
export function citaSoportaPasaje(
  citedHref: string,
  requiredPhrases: string[],
  passages: PasajeEvidencia[],
): { ok: boolean; reason: string } {
  const exact = passages.find((p) => p.href === citedHref);
  if (!exact) {
    const base = citedHref.split('#')[0] || '/';
    const pageOnly = passages.some((p) => (p.href.split('#')[0] || '/') === base);
    if (pageOnly) {
      return { ok: false, reason: 'page-base match without required anchor/passage' };
    }
    return { ok: false, reason: 'cited href not in evidence' };
  }
  for (const phrase of requiredPhrases) {
    if (!exact.texto.toLowerCase().includes(phrase.toLowerCase())) {
      return { ok: false, reason: `missing phrase: ${phrase}` };
    }
  }
  return { ok: true, reason: 'supported' };
}

/** Marcadores [n] presentes en la respuesta (sin filtrar por total). */
export function citasMarcadas(respuesta: string): number[] {
  return [...respuesta.matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1]));
}

/**
 * True cuando `ajustarCitas` inventa la fuente [1] porque no había ningún
 * marcador válido. Eso es una reparación de presentación, no prueba de
 * soporte evidencial.
 */
export function esReparacionFuente1(respuesta: string, total: number): boolean {
  const validas = citasMarcadas(respuesta).filter((n) => n >= 1 && n <= total);
  return validas.length === 0 && total >= 1;
}

export function coincideTopic(
  hrefs: string[],
  topic: string,
  titulos: string[] = [],
): boolean {
  const t = topic.toLowerCase();
  if (hrefs.some((h) => h.toLowerCase().includes(t))) return true;
  return titulos.some((titulo) => titulo.toLowerCase().includes(t));
}

export function ampliaOk(pregunta: string): boolean {
  const r = responderAmplia(pregunta);
  if (!r || !r.respuesta?.trim()) return false;
  return Array.isArray(r.citas) && r.citas.length > 0;
}
