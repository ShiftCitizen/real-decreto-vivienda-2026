import type { Metadata } from 'next';
import Link from 'next/link';
import AvisoEstado from '@/components/AvisoEstado';
import Cite from '@/components/Cite';
import CiteMap from '@/components/CiteMap';
import ScrollTable from '@/components/ScrollTable';
import Timeline from '@/components/Timeline';
import { slugify } from '@/lib/slug';
import { revisionDe } from '@/lib/revisiones';

export const metadata: Metadata = {
  title: 'Estado y advertencias',
  description:
    'El RDL 29/2026 está en vigor desde el 8-10-2026 y el RDL 28/2026, publicado el 7-10, entrará en vigor el 15-11 si se convalida. Tabla con la situación de cada medida y cuatro advertencias clave.',
};

/**
 * One status vocabulary for the whole table, mapped to four tones.
 *
 * The old table mixed "Activa", "Activas", "Potestativos", "Inoperante",
 * "Pendientes", "Bloqueados" and "Regla de prioridad" in the same column: seven
 * literal strings, no way to compare them, and no CSS. Four values is enough to
 * say everything a reader needs — can I rely on this today?
 */
type Estado = 'vigente' | 'potestativa' | 'pendiente' | 'bloqueada';

const ESTADO_TXT: Record<Estado, string> = {
  vigente: 'Vigente',
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

/**
 * Qué norma rige cada medida hoy.
 *
 * Los RDL 26/2026 y 27/2026 quedaron derogados el 2-10-2026, pero sus medidas
 * no desaparecieron: el RDL 29/2026 las reproduce en lo sustancial y el
 * RDL 28/2026 hace lo propio con la prórroga indefinida y la indemnización.
 * Por eso la columna dice en qué decreto está cada una y no solo si está
 * derogada. La columna «Condición» nombra la norma con su artículo, y el
 * chatbot la lee: es lo que evita que una respuesta diga que una medida que
 * hoy se aplica «no se aplica».
 */
const FILAS: Fila[] = [
  {
    medida: 'Freno a la compra especulativa del 70 %',
    estado: 'vigente',
    condicion:
      'Art. 1 del RDL 29/2026, en vigor desde el 8-10-2026, con el plazo ampliado hasta el 31-12-2030. Era del art. 1 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Suspensión de desahucios',
    estado: 'vigente',
    condicion:
      'Art. 2 del RDL 29/2026, en vigor desde el 8-10-2026, hasta el 31-12-2030. Era del art. 2 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Enervación extraordinaria',
    estado: 'vigente',
    condicion:
      'Art. 5.Dos del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 5 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Reforma de la LAU (temporada, habitaciones, gastos, garantías)',
    estado: 'vigente',
    condicion:
      'Art. 3 del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 3 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Régimen sancionador de plataformas de corta duración (Título V LAU)',
    estado: 'vigente',
    condicion:
      'Art. 3.Veinte del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 3.Veinte del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Prohibición de los seguros de impago de renta en la LAU',
    estado: 'vigente',
    condicion:
      'Art. 3.Diecisiete del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 3 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Prórroga extraordinaria de dos años (DF 5.ª)',
    estado: 'vigente',
    condicion:
      'DF 5.ª del RDL 29/2026, en vigor desde el 8-10-2026. Era del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Límite del 2 % a la actualización de la renta (DF 6.ª)',
    estado: 'vigente',
    condicion:
      'DF 6.ª del RDL 29/2026, en vigor desde el 8-10-2026, hasta el 31-12-2027. Era del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Prórroga indefinida de cinco y siete años e indemnización de doce mensualidades',
    estado: 'pendiente',
    condicion:
      'Art. único del RDL 28/2026: no está en vigor —entrada prevista el 15-11-2026— y está pendiente de convalidación. Era del RDL 27/2026, derogado el 2-10-2026',
    etiqueta: 'No en vigor',
  },
  {
    medida: 'Recargos de IBI (vivienda desocupada y alojamiento turístico)',
    estado: 'potestativa',
    condicion:
      'Art. 8 del RDL 29/2026, en vigor desde el 8-10-2026. Eran del art. 8 del RDL 26/2026, derogado el 2-10-2026',
    nota: 'Siguen siendo potestativos: dependen de una ordenanza municipal',
  },
  {
    medida: 'Exención por transmisión de vivienda a entes públicos',
    estado: 'vigente',
    condicion:
      'Art. 6.Segundo.Once del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 6 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'IVA de estancias cortas y de obras de renovación al 10 %',
    estado: 'vigente',
    condicion:
      'Art. 7 del RDL 29/2026, en vigor desde el 8-10-2026, con efectos desde el 1-12-2026. Era del art. 7 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Nueva escala de imputación de rentas (IRPF)',
    estado: 'vigente',
    condicion:
      'Art. 6.Primero del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 6 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'TU CASA (préstamo al 0 %)',
    estado: 'vigente',
    condicion:
      'Art. 19 del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 19 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Línea de avales de 2.000 M€',
    estado: 'vigente',
    condicion:
      'Art. 16 del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 16 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Línea de avales de 280 M€',
    estado: 'vigente',
    condicion:
      'Art. 17 del RDL 29/2026, en vigor desde el 8-10-2026. Era del art. 17 del RDL 26/2026, derogado el 2-10-2026',
  },
  {
    medida: 'Registro de IIC Elegibles',
    estado: 'pendiente',
    condicion:
      'Disposición adicional segunda del RDL 29/2026, en vigor desde el 8-10-2026: la CNMV dispone de cuatro meses para crearlo',
  },
  {
    medida: 'Proveedor social de vivienda asequible y cooperativas',
    estado: 'pendiente',
    condicion:
      'Disposición adicional primera del RDL 29/2026, en vigor desde el 8-10-2026: el Gobierno debe regular su figura en seis meses',
  },
  {
    medida: 'Comercialización de la Cuenta Financia Europa y del SIALPFE',
    estado: 'pendiente',
    condicion:
      'Título VI del RDL 29/2026, en vigor desde el 8-10-2026, pero no puede contratarse hasta que entre en vigor la orden ministerial del art. 347.7 de la Ley de los Mercados de Valores',
  },
  {
    medida: 'Activos IIC dentro de la Cuenta',
    estado: 'pendiente',
    condicion:
      'Título VI del RDL 29/2026, en vigor desde el 8-10-2026: solo los activos elegibles distintos de participaciones o acciones de IIC, hasta que funcione el Registro de IIC Elegibles',
  },
  {
    medida: 'Movilización entre entidades proveedoras',
    estado: 'bloqueada',
    condicion:
      'No puede efectuarse hasta la entrada en vigor de la orden ministerial del art. 347.7 de la Ley de los Mercados de Valores, que el RDL obliga a aprobar en seis meses',
  },
];

export default function EstadoPage() {
  return (
    <>
      <h1>Estado de aplicación y advertencias</h1>
      <p className="lead">
        El RDL 29/2026 está en vigor desde el 8 de octubre de 2026 y el RDL 28/2026 se publicó el
        7 de octubre, con entrada en vigor prevista para el 15 de noviembre. Los RDL 26/2026 y
        27/2026 entraron en vigor el 1 y el 2 de octubre y quedaron derogados ese mismo 2-10-2026 al
        rechazar el Congreso su convalidación: sus medidas, en lo sustancial, las reproduce ahora el
        RDL 29/2026. Qué norma rige cada una, cuáles dependían todavía de un acuerdo ministerial u
        ordenanza, y las cuatro advertencias que conviene leer antes de fiarse de una cifra. Si
        recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un
        sindicato de inquilinos.
      </p>

      <AvisoEstado />

      <p>
        Contexto (octubre de 2026): ver la{' '}
        <Link href="/#nuevos-decretos-de-vivienda-y-diputacion-permanente">actualización bajo el resumen «En 1 minuto» de la portada</Link>.
      </p>

      <h2 id={slugify('Nuevos decretos de 6 de octubre de 2026')}>
        Nuevos decretos de 6 de octubre de 2026
      </h2>

      <p>
        El Consejo de Ministros aprobó el 6 de octubre de 2026 dos nuevos reales
        decretos-ley de vivienda, publicados en el «BOE» núm. 249 de 7 de octubre.
        Son un paquete nuevo y distinto, no una re-convalidación de los decretos
        derogados.
      </p>

      <ScrollTable label="Estado de los nuevos reales decretos-ley de vivienda">
        <table>
          <thead>
            <tr>
              <th scope="col">Decreto</th>
              <th scope="col">BOE</th>
              <th scope="col">Entrada en vigor</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b className="tono-rdl29">RDL 29/2026</b> — paquete principal: desahucios,
                alquiler, fiscal, financiación
              </td>
              <td>
                <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20823">
                  BOE-A-2026-20823
                </a>
              </td>
              <td>8 de octubre de 2026</td>
              <td>
                <span className="pill pill-pendiente">En vigor, pendiente de convalidación</span>
              </td>
            </tr>
            <tr>
              <td>
                <b className="tono-rdl28">RDL 28/2026</b> — estabilidad de los contratos de
                arrendamiento
              </td>
              <td>
                <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20822">
                  BOE-A-2026-20822
                </a>
              </td>
              <td>15 de noviembre de 2026 (prevista)</td>
              <td>
                <span className="pill pill-pendiente">No en vigor, pendiente de convalidación</span>
              </td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>

      <p>
        La Diputación Permanente (69 miembros, mayoría absoluta de 35) debe votar la
        convalidación de ambos decretos en el plazo de treinta días (hacia el 6 de
        noviembre de 2026). No hay fecha de sesión fijada.{' '}
        <Cite norma="ce" art="78.2" /> <Cite norma="ce" art="86.2" />
      </p>

      <h2 id={slugify('Situación de cada medida')}>Situación de cada medida</h2>

      <p>
        La tabla resume la situación de cada medida hoy. Casi todas las del RDL 26/2026 y del RDL
        27/2026 <b>vuelven a regir</b>, pero no por aquellos decretos: el RDL 29/2026, en vigor
        desde el 8-10-2026 y pendiente de convalidación, las reproduce, y el RDL 28/2026 hace lo
        propio con la prórroga indefinida y la indemnización, aunque todavía no está en vigor. La
        columna «Condición» dice en qué decreto está cada una y qué queda pendiente. Las etiquetas{' '}
        <b>Potestativa</b>, <b>Pendiente</b> y <b>Bloqueada</b> marcan las que dependen todavía de
        una ordenanza municipal o de una orden ministerial, no de una convalidación.
      </p>

      <ScrollTable label="Estado de aplicación de cada medida de los reales decretos-ley de vivienda">
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

      <h2 id={slugify('Línea de tiempo')}>Línea de tiempo</h2>

      <p>
        Cómo hemos llegado hasta aquí, del BOE a la Diputación Permanente, en
        orden de relevancia (el mismo que la tabla de la portada).
      </p>

      <Timeline />

      <h2 id={slugify('Historial de actualizaciones')}>Historial de actualizaciones</h2>

      <ul>
        <li>
          <b>7 de octubre de 2026:</b> tercera versión. El RDL 29/2026 entró en vigor el 8-10-2026 y
          el RDL 28/2026 quedó publicado a la espera de su entrada en vigor y de la convalidación. La
          tabla de medidas pasó a decir qué decreto rige cada una, en lugar de darlas todas por
          derogadas.
        </li>
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
          172 a favor y 178 en contra el RDL 26/2026; RDL 27/2026 rechazado sin cifra a
          favor confirmada en fuente oficial y con 184 en contra.
          Ambos quedaron derogados y dejaron de estar en vigor ese día.{' '}
          <Cite norma="ce" art="86.2" /> Ese es el historial; lo que rige hoy son el RDL
          29/2026 y el RDL 28/2026. Si alguna medida se tramita como proyecto de ley,
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
          <Cite norma="rdl29" art="2.2" /> Pero la eficacia real depende de que esa
          administración conteste en el plazo y tenga recursos: si no responde o informa de que no
          cuenta con ellos, el proceso se suspende, y si tras los dos meses no ha pagado ni
          consignado, la subrogación automática es lo que evita el lanzamiento.{' '}
          <Cite norma="rdl29" art="5.Dos" /> En el País Vasco y en Navarra la
          instrumentación financiera se acordará bilateralmente con sus propios regímenes.{' '}
          <Cite norma="rdl29" art="5.Dos" /> Los recargos de IBI son potestativos y
          dependen íntegramente de la ordenanza municipal.
        </p>

      <h3 id={slugify('Territorios forales y competencias autonómicas')}>
        Territorios forales y competencias autonómicas
      </h3>

      <p>
        La disposición final décima.8 respeta los regímenes civiles forales o especiales, los
        regímenes tributarios forales de concerto y convenio económico del País Vasco y Navarra, y
        la competencia autónoma en ordenación del territorio, urbanismo y vivienda.{' '}
        <CiteMap norma="rdl26" art="disposición final décima.8" /> El RDL 27/2026 se dicta bajo el{' '}
        <b>artículo 149.1.8.ª CE</b> en materia de legislación civil, «sin perjuicio de la
        conservación, modificación y desarrollo por las comunidades autónomas de los derechos
        civiles, forales o especiales, allí donde existan, y, en todo caso, sobre las bases de las
        obligaciones contractuales».{' '}
        <Cite norma="ce" art="149.1.8" /> <CiteMap norma="rdl27" art="disposición final primera" />
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
        Última revisión: {revisionDe('/estado')}. Articulado contrastado con{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a>,{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>,{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20823">BOE-A-2026-20823</a> y{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20822">BOE-A-2026-20822</a>.
      </p>
    </>
  );
}
