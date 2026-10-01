/**
 * Typed registry of every norm the site cites.
 *
 * The site quotes two decrees that both have an "artículo 1", plus eight other
 * norms. A bare "art. 1" is therefore ambiguous, so <Cite> requires `norma` and
 * this table is the single place a norm's identity lives: label, official title,
 * BOE id and ELI permalink.
 *
 * `tono` picks the accent colour. Only the two decrees get a hue: everything
 * else uses the neutral treatment, so the colour on the page always means
 * "which decree".
 */

export type NormaId =
  | 'rdl26'
  | 'rdl27'
  | 'lau'
  | 'lec'
  | 'l123'
  | 'lirpf'
  | 'liva'
  | 'lrhl'
  | 'lmv'
  | 'ce'
  | 'lic'
  | 'lrga'
  | 'rdl83'
  | 'reglamentoUe';

export type Tono = 'rdl26' | 'rdl27' | 'neutro';

export type Norma = {
  id: NormaId;
  /** Short label used in the coloured tag next to every article reference. */
  etiqueta: string;
  /** Full official title, shown in the legend and in the search index. */
  titulo: string;
  /** BOE reference id, when the norm is published in the BOE. */
  boe?: string;
  /** ELI permalink. */
  eli?: string;
  tono: Tono;
};

export const NORMAS: Record<NormaId, Norma> = {
  rdl26: {
    id: 'rdl26',
    etiqueta: 'RDL 26/2026',
    titulo:
      'Real Decreto-ley 26/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para la protección de la función social de la vivienda y la ampliación de la oferta de vivienda asequible',
    boe: 'BOE-A-2026-20266',
    eli: 'https://www.boe.es/eli/es/rdl/2026/09/29/26',
    tono: 'rdl26',
  },
  rdl27: {
    id: 'rdl27',
    etiqueta: 'RDL 27/2026',
    titulo:
      'Real Decreto-ley 27/2026, de 29 de septiembre, por el que se adoptan medidas urgentes para reforzar la estabilidad de los contratos de arrendamiento de vivienda habitual',
    boe: 'BOE-A-2026-20385',
    eli: 'https://www.boe.es/eli/es/rdl/2026/09/29/27',
    tono: 'rdl27',
  },
  lau: {
    id: 'lau',
    etiqueta: 'LAU',
    titulo:
      'Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos',
    boe: 'BOE-A-1994-26003',
    eli: 'https://www.boe.es/eli/es/l/1994/11/24/29',
    tono: 'neutro',
  },
  lec: {
    id: 'lec',
    etiqueta: 'LEC',
    titulo:
      'Ley 1/2000, de 7 de enero, de Enjuiciamiento Civil',
    boe: 'BOE-A-2000-323',
    eli: 'https://www.boe.es/eli/es/l/2000/01/07/1',
    tono: 'neutro',
  },
  l123: {
    id: 'l123',
    etiqueta: 'Ley 12/2023',
    titulo:
      'Ley 12/2023, de 24 de mayo, por el derecho a la vivienda',
    boe: 'BOE-A-2023-12203',
    eli: 'https://www.boe.es/eli/es/l/2023/05/24/12',
    tono: 'neutro',
  },
  lirpf: {
    id: 'lirpf',
    etiqueta: 'LIRPF',
    titulo:
      'Ley 35/2006, de 28 de noviembre, del Impuesto sobre la Renta de las Personas Físicas y de modificación parcial de las leyes de los Impuestos sobre Sociedades, sobre la Renta de no Residentes y sobre el Patrimonio',
    boe: 'BOE-A-2006-20764',
    eli: 'https://www.boe.es/eli/es/l/2006/11/28/35',
    tono: 'neutro',
  },
  liva: {
    id: 'liva',
    etiqueta: 'LIVA',
    titulo:
      'Ley 37/1992, de 28 de diciembre, del Impuesto sobre el Valor Añadido',
    boe: 'BOE-A-1992-28740',
    eli: 'https://www.boe.es/eli/es/l/1992/12/28/37',
    tono: 'neutro',
  },
  lrhl: {
    id: 'lrhl',
    etiqueta: 'LRHL',
    titulo:
      'Texto refundido de la Ley Reguladora de las Haciendas Locales, aprobado por Real Decreto Legislativo 2/2004, de 5 de marzo',
    boe: 'BOE-A-2004-4214',
    eli: 'https://www.boe.es/eli/es/rdl/2004/03/05/2',
    tono: 'neutro',
  },
  lmv: {
    id: 'lmv',
    etiqueta: 'LMV',
    titulo:
      'Ley 6/2023, de 17 de marzo, de los Mercados de Valores y de los Servicios de Inversión',
    boe: 'BOE-A-2023-7053',
    eli: 'https://www.boe.es/eli/es/l/2023/03/17/6',
    tono: 'neutro',
  },
  ce: {
    id: 'ce',
    etiqueta: 'CE',
    titulo: 'Constitución Española',
    boe: 'BOE-A-1978-31229',
    eli: 'https://www.boe.es/eli/es/c/1978/12/29/constitucion',
    tono: 'neutro',
  },
  lic: {
    id: 'lic',
    etiqueta: 'Ley 11/2009',
    titulo:
      'Ley 11/2009, de 26 de octubre, por la que se regulan las Sociedades Anónimas Cotizadas de Inversión en el Mercado Inmobiliario',
    boe: 'BOE-A-2009-17000',
    eli: 'https://www.boe.es/eli/es/l/2009/10/26/11',
    tono: 'neutro',
  },
  lrga: {
    id: 'lrga',
    etiqueta: 'Ley 5/2019',
    titulo:
      'Ley 5/2019, de 15 de marzo, reguladora de los contratos de crédito inmobiliario',
    boe: 'BOE-A-2019-3814',
    eli: 'https://www.boe.es/eli/es/l/2019/03/15/5',
    tono: 'neutro',
  },
  rdl83: {
    id: 'rdl83',
    etiqueta: 'RDL 8/2023',
    titulo:
      'Real Decreto-ley 8/2023, de 27 de diciembre, por el que se adoptan medidas para afrontar las consecuencias económicas y sociales derivadas de los conflictos en Ucrania y Oriente Próximo, así como para paliar los efectos de la sequía',
    boe: 'BOE-A-2023-26452',
    eli: 'https://www.boe.es/eli/es/rdl/2023/12/27/8',
    tono: 'neutro',
  },
  reglamentoUe: {
    id: 'reglamentoUe',
    etiqueta: 'Reglamento (UE) 2024/1028',
    titulo:
      'Reglamento (UE) 2024/1028 del Parlamento Europeo y del Consejo, de 11 de abril de 2024, sobre la recogida y el intercambio de datos relativos a los servicios de alquiler de alojamientos de corta duración y por el que se modifica el Reglamento (UE) 2018/1724',
    eli: 'https://eur-lex.europa.eu/eli/reg/2024/1028/oj',
    tono: 'neutro',
  },
};

export const NORMA_IDS = Object.keys(NORMAS) as NormaId[];

/**
 * Every norm is a searchable entity in its own right: someone who types
 * "gran tenedor" should be able to land on the Ley 12/2023 entry.
 */
export const NORMA_ENTRIES = NORMA_IDS.map((id) => ({
  id,
  etiqueta: NORMAS[id].etiqueta,
  titulo: NORMAS[id].titulo,
  href: NORMAS[id].boe
    ? `/normas/#${id}`
    : `/normas/#${id}`,
  tono: NORMAS[id].tono,
}));
