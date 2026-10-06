import { ESTADO_VOTACION } from '@/lib/estado-votacion';

/**
 * Banner de estado post-votación. Lee el resultado de lib/estado-votacion.ts:
 * para cambiar el estado de la web basta editar ese archivo y reconstruir.
 * Se muestra en la portada, en /estado/ y en forma compacta en las páginas
 * de análisis, cuyas medidas describe en pasado.
 */
export default function AvisoEstado() {
  const estado = ESTADO_VOTACION;
  if (estado.status !== 'derogados') {
    return (
      <div className="box warn">
        <strong>Estado de los decretos (situación a {estado.lastUpdated}).</strong>
        <p>
          Consulta la sección de resultado de la votación: el estado actual es{' '}
          {estado.status}.
        </p>
      </div>
    );
  }
  const r26 = estado.resultados.rdl26;
  const r27 = estado.resultados.rdl27;
  const favor26 = r26.aFavor === null ? 'votos a favor no confirmados' : `${r26.aFavor} a favor`;
  const favor27 = r27.aFavor === null ? 'votos a favor no confirmados' : `${r27.aFavor} a favor`;
  return (
    <div className="box warn">
      <strong>Estado: derogados. El 2 de octubre de 2026, el Congreso rechazó la convalidación de los dos reales decretos-ley de vivienda.</strong>
      <p>
        RDL 26/2026: {favor26}, {r26.enContra} en contra → derogado el 2-10-2026.
        RDL 27/2026: {favor27}, {r27.enContra} en contra → derogado el 2-10-2026.
      </p>
      <p>
        Al no ser convalidados, ambos decretos quedaron derogados el 2-10-2026 y no
        están en vigor. Si recibiste una notificación fechada el 1 o el 2 de octubre,
        llévala a un abogado o a un sindicato de inquilinos.
      </p>
    </div>
  );
}
