import Link from 'next/link';
import Cite from '@/components/Cite';
import FaqList from '@/components/FaqList';
import ScrollTable from '@/components/ScrollTable';
import { CRONOLOGIA } from '@/lib/cronologia';
import { slugify } from '@/lib/slug';

const FIGURAS = [
  {
    label: 'Suspensión de desahucios',
    valor: '31-12-2030',
    nota: 'hasta esa fecha',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '2' },
  },
  {
    label: 'Umbral de tasación',
    valor: '70 %',
    nota: 'hasta 2028',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '1' },
  },
  {
    label: 'Tope vivienda asequible',
    valor: '30 %',
    nota: 'de la renta mediana',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '14' },
  },
  {
    label: 'Línea de avales',
    valor: '2.000 M€',
    nota: 'modifica el art. 86 del RDL 8/2023',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '16' },
  },
  {
    label: 'Línea de avales industrialización',
    valor: '280 M€',
    nota: 'hasta 2040 · el art. 18 del RDL 26/2026 es solo régimen de cobranza',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '17.2' },
  },
  {
    label: 'TU CASA',
    valor: '0 %',
    nota: 'hasta el menor de 50.000 € o 20 %',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '19' },
  },
  {
    label: 'Recargo IBI turístico máximo',
    valor: '150 %',
    nota: 'solo en zona tensionada',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '8.Cuatro' },
  },
  {
    // The fine lives in the new Título V of the LAU, not in the decree itself:
    // `norma` says which decree introduces it, `cita` names the norm to cite.
    label: 'Multa por plataforma turística',
    valor: '1 M€',
    nota: 'infracción muy grave · nuevo Título V del RDL 26/2026',
    norma: 'rdl26' as const,
    cita: { norma: 'lau' as const, art: '43.2' },
  },
  {
    label: 'Indemnización por no renovación',
    valor: '12 rentas',
    nota: 'nueva redacción del RDL 27/2026',
    norma: 'rdl27' as const,
    cita: { norma: 'lau' as const, art: '10.1' },
  },
];

export default function HomePage() {
  return (
    <>
      <figure className="hero">
        <img
          src="/assets/hero.jpg"
          alt="Composición arquitectónica: edificio residencial contemporáneo con acento burdeos sobre horizonte urbano suave"
          width={1168}
          height={784}
          decoding="async"
          fetchPriority="high"
        />
        <figcaption>
          Medidas urgentes de vivienda
        </figcaption>
      </figure>

      <p className="meta">
        Jefatura del Estado · «BOE» núm. 241, de 30 de septiembre de 2026 (BOE-A-2026-20266) y
        núm. 243, de 1 de octubre de 2026 (BOE-A-2026-20385) · en vigor desde el 1 y el 2 de
        octubre de 2026 respectivamente
      </p>

      <h1>Vivienda: los reales decretos-ley 26/2026 y 27/2026</h1>

      <p className="lead">
        Medidas urgentes para la protección de la función social de la vivienda y la ampliación
        de la oferta de vivienda asequible.
      </p>

      <p>
        Dos reales decretos-ley publicados con un día de diferencia y aprobados en el mismo
        Consejo de Ministros. El primero, de 96 páginas y veinte artículos en seis títulos, actúa
        en cuatro frentes: alquiler y desahucios, fiscalidad, parque público y financiación de
        vivienda asequible, y cierra con la Cuenta de Ahorro e Inversión Financia Europa. El
        segundo es un texto breve de ocho páginas con un único artículo, y se ocupa de una sola
        cosa: el futuro de los contratos de arrendamiento de vivienda habitual.
      </p>

      <p>
        Lo más urgente del primero es el régimen de desahucios. Si la administración competente
        no ofrece alternativa habitacional a un arrendatario vulnerable, dispone de dos meses
        improrrogables para pagar o consignar la deuda; si no lo hace, queda subrogada y no hay
        lanzamiento (<Cite norma="rdl26" art="5.Dos" />). El segundo cambia el cálculo
        del inquilino: los contratos de vivienda habitual pasan a prorrogarse obligatoriamente
        por plazos sucesivos de cinco años, o de siete si el arrendador es persona jurídica, salvo
        que este notifique su voluntad de no renovar con seis meses de antelación, y esa no
        renovación obliga a pagar doce mensualidades de renta. No deroga al primero, pero
        su disposición adicional primera fija la relación entre ambos: la prórroga indefinida
        prevalece sobre la prórroga extraordinaria de la DF 5.ª cuando procede el{' '}
        <Cite norma="lau" art="10.1" />, y si el primer decreto se aplicó a un contrato que el
        arrendador ya había
        negado, el contrato se extingue igualmente, con derecho a indemnización (
        <Link href="/desahucios-y-alquiler#coordinacion">ver la coordinación</Link>).
      </p>

      <div className="figs">
        {FIGURAS.map((fig) => (
          <div className="fig" key={fig.label}>
            <span className="fig-label">{fig.label}</span>
            <b>{fig.valor}</b>
            <span className="fig-ref">
              <Cite norma={fig.cita.norma} art={fig.cita.art} /> {fig.nota}
            </span>
          </div>
        ))}
      </div>

      <h2 id={slugify('Cronología')}>Cronología</h2>

      <ScrollTable label="Cronología de los reales decretos-ley 26/2026 y 27/2026">
        <table>
          <colgroup>
            <col className="col-fecha" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              <th scope="col">Qué ocurre</th>
            </tr>
          </thead>
          <tbody>
            {CRONOLOGIA.map((row) => (
              <tr key={row.fecha}>
                <td className="col-fecha">{row.fecha}</td>
                <td>
                  {row.que}{' '}
                  <span className="cite-block">
                    {row.citas.map((cita) => (
                      <Cite key={`${cita.norma}-${cita.art}`} norma={cita.norma} art={cita.art} />
                    ))}
                    {' '}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>

      <h2 id={slugify('Lo que afecta al tercer sector')}>Lo que afecta al tercer sector</h2>

      <ul>
        <li>
          <strong>Compras:</strong> quedan fuera del límite del 70 % las adquisiciones para
          residencia de colectivos socialmente vulnerables por parte de entidades del tercer
          sector de acción social, las destinadas a la protección de las víctimas de violencia
          de género, las que se destinan a residencia de personas que precisen atención
          sociosanitaria y las de quien se adhiera a un Código de Buenas Prácticas acordado con
          la autoridad competente.{' '}
          <Cite norma="rdl26" art="1.2" />
        </li>
        <li>
          <strong>Habitaciones:</strong> la LAU no se aplica a la cesión de uso de habitaciones o
          estancias de una vivienda que realicen las entidades del tercer sector de acción social
          en programas de acogida, inclusión o alojamiento de personas en situación de
          vulnerabilidad, sin finalidad lucrativa.{' '}
          <Cite norma="rdl26" art="3.Cuatro.f" />
        </li>
        <li>
          <strong>IRPF:</strong> reducción del 70 % para el propietario que alquila a una entidad
          sin fines lucrativos del título II de la Ley 49/2002 y que destine la vivienda al
          alquiler social con renta inferior a la del programa estatal de alquiler, al alojamiento
          de personas en situación de vulnerabilidad económica de la Ley 19/2021, o a un programa
          público o calificación que imponga limitación de la renta.{' '}
          <Cite norma="rdl26" art="6.Segundo.Dos.c" />
        </li>
        <li>
          <strong>DA 1.ª:</strong> el Gobierno regulará en seis meses la figura de proveedor
          social de vivienda asequible y las cooperativas de vivienda asequible, con el referente
          de las Housing Associations, y la certificación será exclusivamente a los efectos de la
          participación de estas entidades en programas o en el acceso a financiación, ventajas o
          especialidades en relación con tributos o procedimientos estatales.{' '}
          <Cite norma="rdl26" art="disposición adicional primera" />
        </li>
      </ul>

      <div className="box warn">
        <strong>Convalidación pendiente (situación a 30-9-2026).</strong>
        <p>
          El artículo 86.2 de la CE exige el pronunciamiento expreso del Congreso dentro de los
          treinta días siguientes a la promulgación: no hay convalidación tácita. Según
          información de prensa del 29 de septiembre de 2026 (
          <a href="https://www.moncloa.com/2026/09/29/convalidacion-decretos-vivienda-pleno-congreso-3439659/" rel="noreferrer">
            moncloa.com
          </a>
          ), la Junta de Portavoces habría convocado un pleno extraordinario para el viernes 2
          de octubre de 2026, a las 11:00, que votaría por separado los dos decretos de
          vivienda; no es un horario oficial publicado por el Congreso. Hasta la votación la
          norma rige con plena eficacia; si el Congreso deroga alguno, cesa de inmediato sin
          anular los efectos ya producidos. El Congreso puede además convalidar y acordar su
          tramitación como proyecto de ley, lo que abre la puerta a modificar el contenido
          después.
        </p>
        <p>
          <b>
            Actualizar esta página con el resultado de la votación antes de volver a publicarla:
          </b>{' '}
          el resultado cambia el estado de todo lo que sigue.
        </p>
      </div>

      <h2 id={slugify('Preguntas frecuentes')}>Preguntas frecuentes</h2>

      <p>
        Las nueve preguntas que más se repiten, respondidas con la referencia al precepto en el
        que se apoya cada respuesta. Debajo, la explicación de cómo leer las citas de todo el
        sitio.
      </p>

      <FaqList />

      <h2 id={slugify('Cómo leer las citas')}>Cómo leer las citas</h2>

      <p>
        Toda referencia de este sitio va acompañada del nombre de su norma, porque el número de
        artículo por sí solo no basta: los dos decretos tienen ambos un artículo 1 y, sin embargo,
        el del RDL 26/2026 pone freno a la compra especulativa mientras que el del RDL 27/2026
        reescribe la prórroga del arrendamiento. Una cita con el número solo, sin el nombre de la
        norma, no diría cuál de los dos es. El color de cada etiqueta dice a qué decreto o ley
        pertenece el precepto.
      </p>

      <ul className="cite-legend">
        <li>
          <span className="tono-rdl26">RDL 26/2026</span> — el decreto de 96 páginas: alquiler y
          desahucios, fiscalidad, parque público, financiación y la Cuenta Financia Europa.{' '}
          <Link href="/normas#rdl26">Ficha completa</Link>.
        </li>
        <li>
          <span className="tono-rdl27">RDL 27/2026</span> — el decreto de 8 páginas, un único
          artículo que reescribe el 10 de la LAU.{' '}
          <Link href="/normas#rdl27">Ficha completa</Link>.
        </li>
        <li>
          <span className="cite-norma">LAU</span>, <span className="cite-norma">LEC</span>,{' '}
          <span className="cite-norma">Ley 12/2023</span>,{' '}
          <span className="cite-norma">LIRPF</span> y el resto son leyes y reglamentos
          modificados por los decretos; se identifican con su abreviatura, que es la que usa el
          propio BOE.{' '}
          <Link href="/normas">Todas las normas citadas</Link>.
        </li>
        <li>
          Las abreviaturas de disposición van dentro de la referencia, no en la etiqueta: «DF
          5.ª» es una disposición final y «art. 10.1 LAU», un artículo con apartado.
        </li>
      </ul>

      <p className="page-meta">
        Última revisión: 1 de octubre de 2026, 12:00. Articulado contrastado con{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a> y{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>.
      </p>
    </>
  );
}
