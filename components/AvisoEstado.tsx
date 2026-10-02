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
  return (
    <div className="box warn">
      <strong>Estado: derogados. El 2 de octubre de 2026, el Congreso rechazó la convalidación de los dos reales decretos-ley de vivienda.</strong>
      <p>
        RDL 26/2026: {r26.aFavor} a favor, {r26.enContra} en contra → derogado.
        RDL 27/2026: {r27.aFavor} a favor, {r27.enContra} en contra → derogado.
      </p>
      <p>
        Al no ser convalidados, ambos decretos dejan de estar en vigor. Las
        medidas que incluían (moratoria de desahucios, límites a subidas de
        renta, prórrogas automáticas, indemnizaciones y el resto de este
        análisis) no se aplican, salvo que se aprueben por otra vía legislativa.
      </p>
    </div>
  );
}
