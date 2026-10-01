import type { Metadata } from 'next';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Estado y advertencias',
  description:
    'Qué está ya en vigor desde octubre de 2026, qué depende de un acuerdo ministerial u ordenanza, y las advertencias que conviene leer antes de fiarse de una cifra.',
};

/**
 * One status vocabulary for the whole table, mapped to four tones.
 *
 * The old table mixed "Activa", "Activas", "Potestativos", "Inoperante",
 * "Pendientes", "Bloqueados" and "Regla de prioridad" in the same column: seven
 * literal strings, no way to compare them, and no CSS. Four values is enough to
 * say everything a reader needs — can I rely on this today?
 */
type Estado = 'activa' | 'potestativa' | 'pendiente' | 'bloqueada';

const ESTADO_TXT: Record<Estado, string> = {
  activa: 'Activa',
  potestativa: 'Potestativa',
  pendiente: 'Pendiente',
  bloqueada: 'Bloqueada',
};

type Fila = {
  medida: string;
  estado: Estado;
  condicion: string;
  nota?: string;
  /**
   * Overrides the pill text while keeping the tone of `estado`. Used for
   * measures whose effect is deferred to a later date: they are enacted but
   * do not apply yet, so "Activa" would claim they can be relied on today.
   */
  etiqueta?: string;
};

const FILAS: Fila[] = [
  {
    medida: 'Freno a la compra especulativa del 70 %',
    estado: 'activa',
    condicion: 'Hasta el 31-12-2028',
  },
  {
    medida: 'Suspensión de desahucios',
    estado: 'activa',
    condicion:
      'Hasta el 31-12-2030; alcanza a las ejecuciones en curso en las que no se hubiera practicado el lanzamiento',
  },
  {
    medida: 'Enervación extraordinaria',
    estado: 'activa',
    condicion: 'Plazo improrrogable de dos meses para la administración competente',
  },
  {
    medida: 'Reforma de la LAU (temporada, habitaciones, gastos, garantías)',
    estado: 'activa',
    condicion: 'Sin perjuicio de la normativa autonómica en temporada y habitaciones',
  },
  {
    medida: 'Régimen sancionador de plataformas de corta duración (Título V LAU)',
    estado: 'activa',
    condicion: 'Multas de 100.000 a 1.000.000 €; el artículo 47.3 permite requerir la subsanación en quince días antes de incoar',
  },
  {
    medida: 'Prohibición de los seguros de impago de renta en la LAU',
    estado: 'activa',
    condicion: 'Aplica a los contratos vigentes desde el 1-10-2026',
  },
  {
    medida: 'Prórroga extraordinaria de dos años (DF 5.ª)',
    estado: 'activa',
    condicion: 'Solo contratos cuyo periodo de prórroga termine antes del 31-12-2028, y siempre que el arrendatario lleve los ocho meses al corriente',
  },
  {
    medida: 'Límite del 2 % a la actualización de la renta (DF 6.ª)',
    estado: 'activa',
    condicion: 'Límite hasta el 31-12-2027',
  },
  {
    medida: 'Prórroga indefinida de cinco y siete años e indemnización de doce mensualidades',
    estado: 'activa',
    etiqueta: 'Vigente desde 2-10-2026',
    condicion:
      'Desde el 2-10-2026, para los vencimientos posteriores a esa fecha; la DA 1.ª desplaza a la prórroga extraordinaria de la DF 5.ª',
  },
  {
    medida: 'Recargos de IBI (vivienda desocupada y alojamiento turístico)',
    estado: 'potestativa',
    condicion: 'Requieren ordenanza fiscal municipal',
    nota: 'Fuera de zona tensionada el 100 % depende de tres años de desocupación; dentro, de ser titular de cuatro o más inmuebles',
  },
  {
    medida: 'Exención por transmisión de vivienda a entes públicos',
    estado: 'activa',
    condicion: 'Hasta el 31-12-2027; exige dos años de desocupación sin causa justificada',
  },
  {
    medida: 'IVA de estancias cortas y de obras de renovación al 10 %',
    estado: 'activa',
    etiqueta: 'Vigente desde 1-12-2026',
    condicion: 'Con efectos desde el 1-12-2026',
  },
  {
    medida: 'Nueva escala de imputación de rentas (IRPF)',
    estado: 'activa',
    etiqueta: 'Vigente desde 1-1-2027',
    condicion: 'Con efectos desde el 1-1-2027',
  },
  {
    medida: 'TU CASA (préstamo al 0 %)',
    estado: 'pendiente',
    condicion: 'Falta el Acuerdo del Consejo de Ministros que fije beneficiarios, límites e importe inicial',
  },
  {
    medida: 'Línea de avales de 2.000 M€ (art. 16 RDL 26/2026)',
    estado: 'pendiente',
    condicion: 'Requiere los convenios con el ICO',
  },
  {
    medida: 'Línea de avales de 280 M€ (art. 17 RDL 26/2026)',
    estado: 'pendiente',
    condicion:
      'Requiere el convenio con el ICO; el art. 18 RDL 26/2026 es solo su régimen de cobranza',
  },
  {
    medida: 'Registro de IIC Elegibles',
    estado: 'pendiente',
    condicion: 'La CNMV debe crearlo en el plazo de cuatro meses (DA 2.ª)',
  },
  {
    medida: 'Proveedor social de vivienda asequible y cooperativas',
    estado: 'pendiente',
    condicion: 'Reglamento en el plazo de seis meses (DA 1.ª)',
  },
  {
    medida: 'Comercialización de la Cuenta Financia Europa y del SIALPFE',
    estado: 'bloqueada',
    condicion: 'Hasta la orden ministerial de información específica',
  },
  {
    medida: 'Activos IIC dentro de la Cuenta',
    estado: 'bloqueada',
    condicion: 'Solo tras la inscripción de la IIC en el Registro de IIC Elegibles',
  },
  {
    medida: 'Movilización entre entidades proveedoras',
    estado: 'bloqueada',
    condicion: 'Hasta la orden del artículo 347 de la Ley de los Mercados de Valores (DF 8.ª.2, seis meses)',
  },
];

export default function EstadoPage() {
  return (
    <>
      <h1>Estado de aplicación y advertencias</h1>
      <p className="lead">
        Qué rige desde el 1 y el 2 de octubre de 2026, qué depende todavía de una ordenanza, un
        convenio o un acuerdo ministerial, y las cuatro advertencias que conviene leer antes de
        fiarse de una cifra.
      </p>

      <h2 id={slugify('Situación de cada medida')}>Situación de cada medida</h2>

      <p>
        Cada medida de la tabla está en uno de cuatro estados.{' '}
        <b>Activa</b> es lo que puede aplicarse hoy. Cuando el efecto está diferido a una
        fecha posterior, la etiqueta indica desde cuándo rige (por ejemplo «Vigente desde
        1-12-2026») en lugar de «Activa»: la medida está aprobada pero aún no es aplicable.{' '}
        <b>Potestativa</b> existe pero depende de que el ayuntamiento la recoja en su ordenanza.{' '}
        <b>Pendiente</b> son preceptos que ya existen pero necesitan un acto posterior para
        funcionar.{' '}
        <b>Bloqueada</b> significa que hay una prohibición expresa de comercialización hasta que
        salga el instrumento que la levanta.
      </p>

      <ScrollTable label="Estado de aplicación de cada medida de los reales decretos-ley 26/2026 y 27/2026">
        <table>
          <thead>
            <tr>
              <th scope="col">Medida</th>
              <th scope="col">Estado</th>
              <th scope="col">Condición</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((fila) => (
              <tr key={fila.medida}>
                <td>
                  {fila.medida}
                  {fila.nota && <div className="nota-cell">{fila.nota}</div>}
                </td>
                <td>
                  <span className={`pill pill-${fila.estado}`}>{fila.etiqueta ?? ESTADO_TXT[fila.estado]}</span>
                </td>
                <td>{fila.condicion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>

      <h2 id={slugify('Historial de actualizaciones')}>Historial de actualizaciones</h2>

      <ul>
        <li>
          <b>1 de octubre de 2026, 12:00:</b> segunda versión. Se contrastó el articulado completo
          con el BOE-A-2026-20266 y el BOE-A-2026-20385 y se corrigieron cinco errores de fondo, se
          añadieron las disposiciones que faltaban y se separaron los dos reales decretos-ley en
          secciones propias.
        </li>
        <li>
          <b>30 de septiembre de 2026, 13:14:</b> versión inicial, contrastada con el
          articulado del BOE-A-2026-20266.
        </li>
      </ul>

      <h2 id={slugify('Cuatro advertencias')}>Cuatro advertencias</h2>

      <h3 id={slugify('Convalidación')}>Convalidación</h3>

      <p>
        El artículo 86.2 CE exige el pronunciamiento expreso del Congreso dentro de los{' '}
        <b>treinta días</b> siguientes a la promulgación: no hay convalidación tácita, y el cómputo
        es en días naturales.{' '}
        <Cite norma="ce" art="86.2" /> Según información de prensa del 29 de septiembre de
        2026 (
        <a href="https://www.moncloa.com/2026/09/29/convalidacion-decretos-vivienda-pleno-congreso-3439659/" rel="noreferrer">
          moncloa.com
        </a>
        ), la Junta de Portavoces habría convocado un pleno extraordinario para el viernes 2
        de octubre de 2026, a las 11:00, que votaría por separado los dos decretos; no es un
        horario oficial publicado por el Congreso. Hasta la votación, la norma rige con plena eficacia; si se deroga, cesa de
        inmediato <b>sin anular los efectos ya producidos</b>. El Congreso puede además
        convalidarla y acordar su tramitación como proyecto de ley, lo que abre la puerta a
        modificar el contenido después.{' '}
        <Cite norma="ce" art="86.1" /> Actualizar esta página tras la votación.
      </p>

      <h3 id={slugify('Preámbulo y articulado')}>Preámbulo y articulado</h3>

      <p>
        El preámbulo del BOE no coincide en todo con el articulado: describe de otro modo las
        consecuencias del art. 5 RDL 26/2026 y cita una numeración de disposiciones finales anterior a la
        definitiva. Este análisis sigue el articulado. El preámbulo invoca por su nombre el caso de
        Mari Carmen Abascal y adopta un registro político, lo que sitúa el debate de
        convalidación pero no altera el efecto jurídico.
      </p>

      <h3 id={slugify('Capacidad autonómica')}>Capacidad autonómica</h3>

      <p>
        La suspensión de desahucios y la enervación extraordinaria recaen sobre la{' '}
        <b>administración competente</b>, en general la autonómica, y el Estado compensa los gastos.{' '}
        <Cite norma="rdl26" art="2.2 y 3" /> Pero la eficacia real depende de que esa
        administración conteste en el plazo y tenga recursos: si no responde o informa de que no
        cuenta con ellos, el proceso se suspende, y si tras los dos meses no ha pagado ni
        consignado, la subrogación automática es lo que evita el lanzamiento.{' '}
        <Cite norma="rdl26" art="5.Dos" /> En el País Vasco y en Navarra la
        instrumentación financiera se acordará bilateralmente con sus propios regímenes.{' '}
        <Cite norma="rdl26" art="5.Dos" /> Los recargos de IBI son potestativos y
        dependen íntegramente de la ordenanza municipal.
      </p>

      <h3 id={slugify('Territorios forales y competencias autonómicas')}>
        Territorios forales y competencias autonómicas
      </h3>

      <p>
        La disposición final décima.8 respeta los regímenes civiles forales o especiales, los
        regímenes tributarios forales de concerto y convenio económico del País Vasco y Navarra, y
        la competencia autónoma en ordenación del territorio, urbanismo y vivienda.{' '}
        <Cite norma="rdl26" art="disposición final décima.8" /> El RDL 27/2026 se dicta bajo el{' '}
        <b>artículo 149.1.8.ª CE</b> en materia de legislación civil, «sin perjuicio de la
        conservación, modificación y desarrollo por las comunidades autónomas de los derechos
        civiles, forales o especiales, allí donde existan, y, en todo caso, sobre las bases de las
        obligaciones contractuales».{' '}
        <Cite norma="ce" art="149.1.8" /> <Cite norma="rdl27" art="disposición final primera" />
      </p>

      <div className="box warn">
        <strong>Lo que este sitio no afirma.</strong>
        <p>
          No se publica aquí ninguna previsión sobre el <b>resultado</b> de la votación de
          convalidación, ni sobre qué apoyos tendrá cada decreto. La convalidación depende
          de una votación que aún no se ha celebrado y no puede anticiparse desde el articulado; la
          que sí puede comprobarse es la eficacia actual de las normas, que es la que se analiza
          aquí. Si alguien necesita esa previsión, tiene que mirar el resultado de la sesión, no
          esta página.
        </p>
        <p>
          Tampoco se afirma nada sobre el cómputo de plazos de convalidación «en días hábiles»: el
          artículo 86.2 CE fija treinta días, sin esa modificación, y no existe base para leerlo de
          otra manera.
        </p>
      </div>

      <p className="page-meta">
        Última revisión: 1 de octubre de 2026, 12:00. Articulado contrastado con{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a> y{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>.
      </p>
    </>
  );
}
