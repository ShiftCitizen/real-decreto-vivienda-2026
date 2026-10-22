/**
 * Concordancia artículo a artículo RDL 26→29 y RDL 27→28.
 *
 * Fuente: data/concordancia.json (rótulos del BOE). Los subapartados del sitio
 * (p. ej. «5.Dos», «3.Veinte», «disposición final quinta.1») heredan el mapeo
 * del artículo o disposición padre; el sufijo se conserva en la cita vigente.
 */

import raw from '@/data/concordancia.json';
import { NORMAS, type NormaId } from '@/lib/normas';

export type ConcordStatus = 'mapped' | 'pending' | 'new_in_successor' | 'exclusive_repealed';

export type ConcordEntry = {
  id: string;
  from: { norma: NormaId; art: string; title: string | null } | null;
  to: { norma: NormaId; art: string; title: string | null } | null;
  status: ConcordStatus;
  note: string;
};

type ConcordFile = {
  meta: Record<string, unknown>;
  entries: ConcordEntry[];
  lookup: Record<string, string>;
};

const DATA = raw as ConcordFile;
const BY_ID = new Map(DATA.entries.map((e) => [e.id, e]));

/** Normas derogadaas que este módulo puede reescribir. */
export type NormaDerogada = 'rdl26' | 'rdl27';

export function esNormaDerogada(norma: NormaId): norma is NormaDerogada {
  return norma === 'rdl26' || norma === 'rdl27';
}

/**
 * Extrae la clave padre usada en data/concordancia.json.
 * «5.Dos» → «5»; «disposición final undécima.1» → «disposición final undécima»;
 * «único.1» → «único». Citas compuestas sin padre claro → null.
 */
export function padreDeArt(art: string): string | null {
  const t = art.trim();
  if (/^\d+(\.\S+)?/.test(t) || /^(Uno|Dos|Tres|Cuatro|Cinco|Seis|Siete|Ocho|Nueve|Diez|Once|Doce|Trece|Catorce|Quince|Dieciséis|Diecisiete|Dieciocho|Diecinueve|Veinte)/i.test(t)) {
    const m = t.match(/^(\d+)/);
    if (m) return m[1];
  }
  if (/^único(\.|$)/i.test(t) || t === 'único') return 'único';
  if (/^disposiciones\b/i.test(t) || /^\d+\s+a\s+\d+/i.test(t)) {
    // «disposiciones finales quinta y sexta», «1 a 5» — no auto-mapear
    return null;
  }
  if (/^disposición\b/i.test(t)) {
    // «disposición final tercera.Tres y Cuatro» u otras compuestos con «y»:
    // no inventar un padre único.
    if (/\by\b/i.test(t)) return null;
    return t
      .replace(/\.(Uno|Dos|Tres|Cuatro|Cinco|Seis|Siete|Ocho|Nueve|Diez)\b.*$/i, '')
      .replace(/\.\d+(\.\S+)*$/, '')
      .trim();
  }
  return null;
}

/**
 * Reescribe el art. vigente: cambia el padre y conserva el sufijo.
 * rdl26 «20» → «21»; «disposición final undécima.1» → «disposición final decimoprimera.1».
 */
export function reescribirArt(fromArt: string, fromParent: string, toParent: string): string {
  if (fromParent === toParent) return fromArt;
  if (fromArt === fromParent) return toParent;
  if (fromArt.startsWith(fromParent)) {
    return toParent + fromArt.slice(fromParent.length);
  }
  return toParent;
}

export type Resolucion =
  | {
      status: 'mapped';
      vigente: { norma: NormaId; art: string };
      antes: { norma: NormaDerogada; art: string };
      note: string;
      entryId: string;
    }
  | {
      status: 'pending' | 'exclusive_repealed' | 'unmapped';
      vigente: null;
      antes: { norma: NormaDerogada; art: string };
      note: string;
      entryId: string | null;
    };

/**
 * Resuelve una cita a un decreto derogado. Si no hay equivalencia clara,
 * status ≠ mapped y la UI no debe fingir una norma vigente.
 */
export function resolverCita(norma: NormaDerogada, art: string): Resolucion {
  const padre = padreDeArt(art);
  if (!padre) {
    return {
      status: 'unmapped',
      vigente: null,
      antes: { norma, art },
      note: 'Cita compuesta o sin padre en la concordancia; pendiente de revisión humana',
      entryId: null,
    };
  }
  const entryId = DATA.lookup[`${norma}:${padre}`];
  if (!entryId) {
    return {
      status: 'unmapped',
      vigente: null,
      antes: { norma, art },
      note: `Sin entrada de concordancia para ${norma} · ${padre}`,
      entryId: null,
    };
  }
  const entry = BY_ID.get(entryId);
  if (!entry || !entry.to || entry.status !== 'mapped') {
    return {
      status: entry?.status === 'exclusive_repealed' ? 'exclusive_repealed' : 'pending',
      vigente: null,
      antes: { norma, art },
      note: entry?.note ?? 'Pendiente de revisión humana',
      entryId,
    };
  }
  return {
    status: 'mapped',
    vigente: {
      norma: entry.to.norma,
      art: reescribirArt(art, padre, entry.to.art),
    },
    antes: { norma, art },
    note: entry.note,
    entryId,
  };
}

export function entradasConcordancia(): ConcordEntry[] {
  return DATA.entries;
}

export function metaConcordancia(): ConcordFile['meta'] {
  return DATA.meta;
}

/** Forma plana para WebMCP / llms: vigente + opcional «antes». */
export type CitaAgente = {
  norm: string;
  article: string;
  formerly?: { norm: string; article: string };
  note?: string;
};

/**
 * Formatea una cita tipada para agentes. Si es rdl26/rdl27 y hay mapeo,
 * devuelve la norma sucesora y el derogado en `formerly`.
 */
export function citarParaAgente(norma: NormaId, art: string): CitaAgente {
  if (esNormaDerogada(norma)) {
    const r = resolverCita(norma, art);
    if (r.status === 'mapped' && r.vigente) {
      return {
        norm: NORMAS[r.vigente.norma].etiqueta,
        article: r.vigente.art,
        formerly: {
          norm: NORMAS[r.antes.norma].etiqueta,
          article: r.antes.art,
        },
        note: r.note || undefined,
      };
    }
    return {
      norm: NORMAS[norma].etiqueta,
      article: art,
      note: r.note || 'Derogado; equivalencia pendiente de revisión humana',
    };
  }
  return { norm: NORMAS[norma].etiqueta, article: art };
}
