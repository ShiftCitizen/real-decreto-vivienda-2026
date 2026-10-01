/**
 * Single source of truth for routes.
 *
 * The old hand-written HTML duplicated the nav, the `aria-current` attribute and
 * the footer in all five files, and they drifted apart — that is the structural
 * cause of the duplication and stale-state bugs the previous session shipped.
 * Nothing here may be written by hand twice.
 */

export type NavLink = {
  href: string;
  label: string;
  /** One-line summary, used as page keywords and as the sidebar subtitle. */
  resumen: string;
};

export type NavSection = {
  title: string;
  links: NavLink[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Los reales decretos-ley',
    links: [
      {
        href: '/',
        label: 'Resumen',
        resumen:
          'Qué cambian los reales decretos-ley 26/2026 y 27/2026, en cifras y en fechas.',
      },
      {
        href: '/desahucios-y-alquiler',
        label: 'Desahucios y alquiler',
        resumen:
          'Freno a la compra especulativa, suspensión de lanzamientos, enervación extraordinaria, reforma de la LAU y régimen sancionador de las plataformas de alquiler de corta duración.',
      },
      {
        href: '/fiscal',
        label: 'Fiscalidad',
        resumen:
          'IRPF por alquiler, IVA sobre estancias cortas, recargos de IBI y el gravamen especial de las SOCIMI.',
      },
      {
        href: '/financiacion',
        label: 'Financiación y cuenta',
        resumen:
          'Parque público, líneas de avales, el préstamo TU CASA al 0 % y la Cuenta de Ahorro e Inversión Financia Europa.',
      },
    ],
  },
  {
    title: 'Estado',
    links: [
      {
        href: '/estado',
        label: 'Estado y advertencias',
        resumen:
          'Qué está ya en vigor, qué depende de un acuerdo ministerial y qué advertencia conviene leer antes de fiarse de una cifra.',
      },
      {
        href: '/normas',
        label: 'Normas citadas',
        resumen:
          'Registro de los reales decretos-ley, leyes y reglamentos que se citan en este análisis, con su enlace permanente en el BOE.',
      },
    ],
  },
];

export const ALL_LINKS: NavLink[] = NAV_SECTIONS.flatMap((section) => section.links);

/** Normalises "/foo/" -> "/foo" so active-state comparison is exact. */
export function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}
