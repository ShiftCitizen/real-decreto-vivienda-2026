import type { Metadata } from 'next';
import Link from 'next/link';
import AvisoEstado from '@/components/AvisoEstado';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Estado y advertencias',
  description:
    'Ambos decretos fueron derogados el 2-10-2026 al rechazar el Congreso su convalidación. Tabla con las medidas que contenían y su estado tras la derogación, más cuatro advertencias clave.',
};

/**
 * One status vocabulary for the whole table, mapped to four tones.
 *
 * The old table mixed "Activa", "Activas", "Potestativos", "Inoperante",
 * "Pendientes", "Bloqueados" and "Regla de prioridad" in the same column: seven
 * literal strings, no way to compare them, and no CSS. Four values is enough to
 * say everything a reader needs — can I rely on this today?
 */
type Estado = 'derogada' | 'potestativa' | 'pendiente' | 'bloqueada';

const ESTADO_TXT: Record<Estado, string> = {
  derogada: 'Derogada',
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
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Suspensión de desahucios',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Enervación extraordinaria',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Reforma de la LAU (temporada, habitaciones, gastos, garantías)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Régimen sancionador de plataformas de corta duración (Título V LAU)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Prohibición de los seguros de impago de renta en la LAU',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Prórroga extraordinaria de dos años (DF 5.ª)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Límite del 2 % a la actualización de la renta (DF 6.ª)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Prórroga indefinida de cinco y siete años e indemnización de doce mensualidades',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 27/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Recargos de IBI (vivienda desocupada y alojamiento turístico)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
    nota: 'Eran potestativos y requerían ordenanza municipal; el decreto que los habilitaba fue derogado',
  },
  {
    medida: 'Exención por transmisión de vivienda a entes públicos',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'IVA de estancias cortas y de obras de renovación al 10 %',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Nueva escala de imputación de rentas (IRPF)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'TU CASA (préstamo al 0 %)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Línea de avales de 2.000 M€ (art. 16 RDL 26/2026)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Línea de avales de 280 M€ (art. 17 RDL 26/2026)',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Registro de IIC Elegibles',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Proveedor social de vivienda asequible y cooperativas',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Comercialización de la Cuenta Financia Europa y del SIALPFE',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Activos IIC dentro de la Cuenta',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Movilización entre entidades proveedoras',
    estado: 'derogada',
    condicion: 'Contenida en el RDL 26/2026, derogado el 2-10-2026',
  },
];

export default function EstadoPage() {
  return (
    <>
      <h1>Estado de aplicación y advertencias</h1>
      <p className="lead">
        RDL 26/2026 entró en vigor el 1-10-2026 y RDL 27/2026 el 2-10-2026, pero ambos
        quedaron derogados ese mismo 2-10-2026 al rechazar el Congreso su convalidación.
        Qué medidas contenían, cuáles dependían todavía de un acuerdo ministerial u
        ordenanza, y las cuatro advertencias que conviene leer antes de fiarse de una cifra.
      </p>

      <AvisoEstado />

      <p>
        Contexto (octubre de 2026): el Gobierno prevé someter los nuevos decretos de vivienda a
        la Diputación Permanente; ver la{' '}
        <Link href="/#nuevos-decretos-de-vivienda-y-diputacion-permanente">actualización al inicio de la portada</Link>.
      </p>

      <h2 id={slugify('Situación de cada medida')}>Situación de cada medida</h2>

      <p>
        La tabla resume lo que contenían los decretos; desde el 2-10-2026, tras el rechazo de
        la convalidación, <b>ninguna medida se aplica</b>: todas figuran como <b>Derogada</b>.
        La columna «Condición» indica en qué decreto estaba cada medida y que fue derogada
        ese día. Las etiquetas <b>Potestativa</b>, <b>Pendiente</b> y <b>Bloqueada</b> se
        conservan solo para referencia histórica (indicaban el estado que habrían tenido de
        seguir en vigor los decretos), pero no tienen efecto práctico tras la derogación.
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
        El Congreso rechazó la convalidación de los dos decretos el 2 de octubre de 2026:
        172 a favor y 178 en contra el RDL 26/2026; 166–167 a favor y 184 en contra el
        RDL 27/2026. Ambos quedaron derogados y dejaron de estar en vigor ese día.{' '}
        <Cite norma="ce" art="86.2" /> Si alguna medida se tramita como proyecto de ley,
        este sitio se actualizará desde ese texto.
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
          No se publica aquí ninguna previsión sobre <b>futuras</b> votaciones o sobre qué
          apoyos tendría una tramitación como proyecto de ley. El resultado conocido
          (rechazo de ambos decretos el 2-10-2026) está en la portada; lo demás pertenece
          a la sesión futura, no a esta página.
        </p>

      </div>

      <p className="page-meta">
        Última revisión: 5 de octubre de 2026. Articulado contrastado con{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a> y{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>.
      </p>
    </>
  );
}
