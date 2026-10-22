import type { ReactNode } from 'react';
import Cite from '@/components/Cite';
import {
  esNormaDerogada,
  resolverCita,
  type NormaDerogada,
} from '@/lib/concordancia';
import type { NormaId } from '@/lib/normas';

type Props = {
  /**
   * Cita al decreto derogado (rdl26 / rdl27). La concordancia elige el artículo
   * de la norma sucesora; no hay que escribir a mano el par vigente/antes.
   */
  norma: NormaDerogada;
  art: string;
  label?: string;
};

/**
 * Cita con vigencia primero: «art. X RDL 29/2026 (antes art. Y RDL 26/2026)».
 * Si la equivalencia está pendiente, deja solo la cita al derogado (sin inventar).
 */
export default function CiteMap({ norma, art, label }: Props) {
  const r = resolverCita(norma, art);
  if (r.status !== 'mapped' || !r.vigente) {
    return (
      <span className="cite-map cite-map--pending">
        <Cite norma={norma} art={art} label={label} />
        <span className="cite-map-nota"> (derogado; equivalencia pendiente de revisión)</span>
      </span>
    );
  }
  return (
    <span className="cite-map">
      <Cite norma={r.vigente.norma} art={r.vigente.art} label={label} />
      <span className="cite-map-antes">
        {' '}
        (antes <Cite norma={r.antes.norma} art={r.antes.art} label={label} />)
      </span>
    </span>
  );
}

type Cita = { norma: NormaId; art: string };

/**
 * Pinta una lista de citas: los derogados pasan por la concordancia; si la
 * lista ya trae el homólogo vigente y el derogado, se fusionan en un solo
 * CiteMap y no se duplican.
 */
export function renderCitas(citas: Cita[]): ReactNode[] {
  const omitidos = new Set<string>();
  const out: ReactNode[] = [];

  for (const cita of citas) {
    const key = `${cita.norma}:${cita.art}`;
    if (omitidos.has(key)) continue;

    if (esNormaDerogada(cita.norma)) {
      const r = resolverCita(cita.norma, cita.art);
      if (r.status === 'mapped' && r.vigente) {
        const vk = `${r.vigente.norma}:${r.vigente.art}`;
        if (citas.some((c) => `${c.norma}:${c.art}` === vk)) {
          // La vigente está en la lista: se pintará enriquecida al llegar a ella.
          omitidos.add(key);
          continue;
        }
      }
      out.push(<CiteMap key={key} norma={cita.norma} art={cita.art} />);
      continue;
    }

    const antes = citas.find((c) => {
      if (!esNormaDerogada(c.norma)) return false;
      const r = resolverCita(c.norma, c.art);
      return (
        r.status === 'mapped' &&
        r.vigente?.norma === cita.norma &&
        r.vigente.art === cita.art
      );
    });
    if (antes && esNormaDerogada(antes.norma)) {
      omitidos.add(`${antes.norma}:${antes.art}`);
      out.push(
        <CiteMap key={`map-${antes.norma}-${antes.art}`} norma={antes.norma} art={antes.art} />,
      );
    } else {
      out.push(<Cite key={key} norma={cita.norma} art={cita.art} />);
    }
  }
  return out;
}

export type { NormaDerogada };
