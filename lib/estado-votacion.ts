/**
 * Estado parlamentario de los dos reales decretos-ley. ÚNICO lugar donde
 * vive el resultado de la votación: el banner (AvisoEstado), la sección de
 * resultado de la portada y la página de estado leen de aquí, así que un
 * solo cambio actualiza toda la web (tras reconstruir).
 *
 * Cómo actualizar si hay novedades (p. ej. tramitación como proyecto de ley):
 * 1. Cambia `status` a 'en_tramite_proyecto_ley' (u otro valor del tipo) y
 *    ajusta `notaFutura` y `lastUpdated`.
 * 2. Si hubo otra votación, actualiza `fechaVotacion` y `resultados`.
 * 3. `npm run build` y despliega. Nada más hay que tocar.
 *
 * Los votos del RDL 26/2026 son el resultado facilitado el 2-10-2026; del RDL
 * 27/2026 no hay cifra a favor confirmada en fuente oficial y por eso no se
 * publica ninguna horquilla. Ninguna cifra sale del BOE.
 */

export type EstadoNormativa = 'derogados' | 'convalidados_parcialmente' | 'en_tramite_proyecto_ley';

export type ResultadoVotacion = {
  /** Votos a favor, o `null` cuando no hay cifra confirmada en fuente oficial. */
  aFavor: number | null;
  enContra: number;
  abstenciones: number;
};

export const ESTADO_VOTACION: {
  status: EstadoNormativa;
  fechaVotacion: string;
  lastUpdated: string;
  resultados: { rdl26: ResultadoVotacion; rdl27: ResultadoVotacion };
  notaFutura: string;
} = {
  status: 'derogados',
  fechaVotacion: '2026-10-02',
  lastUpdated: '2026-10-02',
  resultados: {
    rdl26: { aFavor: 172, enContra: 178, abstenciones: 0 },
    rdl27: { aFavor: null, enContra: 184, abstenciones: 0 },
  },
  notaFutura:
    'El Gobierno podría intentar tramitar algunas medidas como proyecto de ley, pero no hay nada cerrado.',
};
