/**
 * Estado parlamentario de los reales decretos-ley de vivienda. ÚNICO lugar
 * donde vive el resultado de la votación: el banner (AvisoEstado), la sección
 * de resultado de la portada y la página de estado leen de aquí, así que un
 * solo cambio actualiza toda la web (tras reconstruir).
 *
 * Cuatro decretos conviven aquí, y no son intercambiables:
 *
 *  - RDL 26/2026 y RDL 27/2026: publicados en septiembre/octubre, derogados
 *    por el Congreso el 2-10-2026 al rechazarse su convalidación. Siguen
 *    derogados: este flash no los devuelve a la vigencia.
 *  - RDL 29/2026 y RDL 28/2026: aprobados por el Consejo de Ministros el
 *    6-10-2026 y publicados en el «BOE» núm. 249, de 7 de octubre de 2026.
 *    Son un paquete nuevo y distinto, no una re-convalidación de los
 *    anteriores. El RDL 29/2026 entró en vigor el 8-10-2026 (día siguiente a
 *    su publicación) y está pendiente de convalidación por la Diputación
 *    Permanente. El RDL 28/2026 NO está en vigor: su disposición final
 *    segunda lo retrasa al 15-11-2026, de modo que solo produce efectos si
 *    la Diputación Permanente lo convalida antes.
 *
 * Cómo actualizar si hay novedades:
 * 1. Cambia `status` a 'en_tramite_proyecto_ley' (u otro valor del tipo) y
 *    ajusta `notaFutura` y `lastUpdated`.
 * 2. Si hubo otra votación, actualiza `fechaVotacion` y `resultados`.
 * 3. `npm run build` y despliega. Nada más hay que tocar.
 *
 * Los votos del RDL 26/2026 son el resultado facilitado el 2-10-2026; del RDL
 * 27/2026 no hay cifra a favor confirmada en fuente oficial y por eso no se
 * publica ninguna horquilla. Ninguna cifra sale del BOE.
 *
 * Los dos decretos nuevos no tienen resultado de convalidación: la Diputación
 * Permanente aún no ha votado. Las estimaciones de prensa del 6-10-2026 no
 * son resultados y no se publican aquí como tales.
 */

export type EstadoNormativa = 'derogados' | 'convalidados_parcialmente' | 'en_tramite_proyecto_ley';

export type ResultadoVotacion = {
  /** Votos a favor, o `null` cuando no hay cifra confirmada en fuente oficial. */
  aFavor: number | null;
  enContra: number;
  abstenciones: number;
};

export type EstadoDecretoNuevo = {
  status: 'en_vigor_pendiente_convalidacion' | 'pendiente_convalidacion';
  /** Fecha de entrada en vigor, o `null` si aún no ha entrado. */
  entradaEnVigor: string | null;
  /** Fecha de publicación en el BOE, si ya se ha publicado. */
  publicacion: string | null;
  /** Fecha de convalidación por la Diputación Permanente, si ya se ha producido. */
  convalidacion: string | null;
};

export const ESTADO_VOTACION: {
  status: EstadoNormativa;
  fechaVotacion: string;
  lastUpdated: string;
  resultados: { rdl26: ResultadoVotacion; rdl27: ResultadoVotacion };
  notaFutura: string;
  /** Estado de los dos decretos nuevos (RDL 29/2026 y RDL 28/2026). */
  nuevos: {
    rdl29: EstadoDecretoNuevo;
    rdl28: EstadoDecretoNuevo;
  };
} = {
  status: 'derogados',
  fechaVotacion: '2026-10-02',
  lastUpdated: '2026-10-07',
  resultados: {
    rdl26: { aFavor: 172, enContra: 178, abstenciones: 0 },
    rdl27: { aFavor: null, enContra: 184, abstenciones: 0 },
  },
  notaFutura:
    'El RDL 29/2026 entró en vigor el 8-10-2026 y está pendiente de convalidación por la Diputación Permanente. El RDL 28/2026 no está en vigor: su entrada en vigor está prevista para el 15-11-2026 y depende de que la Diputación Permanente lo convalidé antes.',
  nuevos: {
    rdl29: {
      status: 'en_vigor_pendiente_convalidacion',
      entradaEnVigor: '2026-10-08',
      publicacion: '2026-10-07',
      convalidacion: null,
    },
    rdl28: {
      status: 'pendiente_convalidacion',
      entradaEnVigor: null,
      publicacion: '2026-10-07',
      convalidacion: null,
    },
  },
};
