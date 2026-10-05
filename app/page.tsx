import Link from 'next/link';
import AvisoEstado from '@/components/AvisoEstado';
import Cite from '@/components/Cite';
import FaqList from '@/components/FaqList';
import ScrollTable from '@/components/ScrollTable';
import { CRONOLOGIA } from '@/lib/cronologia';
import { slugify } from '@/lib/slug';

/**
 * MAIN PAGE — DOCUMENTACIÓN DE MANTENIMIENTO (requerido por spec)
 *
 * Textos clave y su ubicación:
 * - Banner "derogados": components/AvisoEstado.tsx (lee de lib/estado-votacion.ts)
 * - Bloque "En 1 minuto": app/page.tsx líneas ~135–161 (id #en-1-minuto)
 * - Sección "Resultado de la votación": app/page.tsx líneas ~187–236
 * - Cronología: lib/cronologia.ts (CRONOLOGIA array)
 * - FAQ: lib/faq.ts (FAQ array) → renderizado por components/FaqList.tsx
 * - Figuras/valores: app/page.tsx FIGURAS array
 *
 * Cómo actualizar el estado tras novedades (p.ej. tramitación como proyecto de ley):
 * 1. Edita lib/estado-votacion.ts:
 *    - status: 'derogados' | 'convalidados_parcialmente' | 'en_tramite_proyecto_ley'
 *    - resultados.rdl26 / rdl27: votos a favor/en contra/abstenciones
 *    - fechaVotacion: 'YYYY-MM-DD' (si hubo nueva votación)
 *    - lastUpdated: 'YYYY-MM-DD'
 *    - notaFutura: texto breve sobre posibles escenarios
 * 2. Reconstruye y despliega: `npm run build && git push`
 *    El banner (AvisoEstado), la sección de resultado y la página /estado/ se actualizan
 *    automáticamente al leer de ese único archivo.
 *
 * Archivos modificados principalmente en esta actualización post-votación:
 * - lib/estado-votacion.ts (configuración central de estado)
 * - components/AvisoEstado.tsx (banner)
 * - lib/cronologia.ts (nuevo hito 2-10-2026)
 * - lib/faq.ts (respuestas post-votación)
 * - app/page.tsx (meta, intro, FIGURAS, "En 1 minuto", "Resultado", TOC)
 * - app/estado/page.tsx (metadata, tabla FILAS, textos explicativos)
 * - app/desahucios-y-alquiler/page.tsx, app/fiscal/page.tsx, app/financiacion/page.tsx (leads)
 * - app/layout.tsx (metadata SEO/OG)
 */

const FIGURAS = [
  {
    label: 'Suspensión de desahucios',
    valor: '31-12-2030',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '2' },
  },
  {
    label: 'Umbral de tasación',
    valor: '70 %',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '1' },
  },
  {
    label: 'Tope vivienda asequible',
    valor: '30 %',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '14' },
  },
  {
    label: 'Línea de avales',
    valor: '2.000 M€',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '16' },
  },
  {
    label: 'Línea de avales industrialización',
    valor: '280 M€',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '17.2' },
  },
  {
    label: 'TU CASA',
    valor: '0 %',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '19' },
  },
  {
    label: 'Recargo IBI turístico máximo',
    valor: '150 %',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'rdl26' as const, art: '8.Cuatro' },
  },
  {
    // The fine lives in the new Título V of the LAU, not in the decree itself:
    // `norma` says which decree introduces it, `cita` names the norm to cite.
    label: 'Multa por plataforma turística',
    valor: '1 M€',
    nota: 'derogado — no se aplica',
    norma: 'rdl26' as const,
    cita: { norma: 'lau' as const, art: '43.2' },
  },
  {
    label: 'Indemnización por no renovación',
    valor: '12 rentas',
    nota: 'derogado — no se aplica',
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
        núm. 243, de 1 de octubre de 2026 (BOE-A-2026-20385) · derogados por el Congreso el
        2 de octubre de 2026 (rechazo de la convalidación)
      </p>

      <h1>Vivienda: los reales decretos-ley 26/2026 y 27/2026</h1>

      {/* <!-- TODO: indicar nº de los nuevos RDL y enlace BOE cuando se publiquen --> */}
      <div className="box" role="note" aria-label="Actualización de 5 de octubre de 2026">
        <h2 id={slugify('Nuevos decretos de vivienda y Diputación Permanente')} className="sr-only">
          Nuevos decretos de vivienda y Diputación Permanente
        </h2>
        <p>
          <strong>Actualización (5 de octubre de 2026).</strong> Tras la disolución de las Cortes y
          la convocatoria de elecciones generales para el 29 de noviembre, la Diputación Permanente
          sustituye al Pleno y es la vía para convalidar los decretos-ley (arts. 78.2 y 86.2 CE{' '}
          <Cite norma="ce" art="78.2" /> <Cite norma="ce" art="86.2" />, con un plazo de treinta
          días). El Consejo de Ministros aprobará el 6 de octubre unos nuevos decretos de
          vivienda, similares a los derogados pero no idénticos —la redacción final aún está en
          estudio—, para someterlos a ese órgano. La Diputación tiene 69 miembros y la mayoría
          absoluta son 35 votos: con los 25 del PSOE y los 6 de Sumar, bastarían EH Bildu, ERC,
          Podemos y el PNV —que ya apoyaron el primer decreto— para convalidar, y el voto de
          Junts sería irrelevante. Si el PNV mantiene su voto, se estima probable la
          convalidación del decreto que impide los desahucios de personas vulnerables, aunque el
          margen sigue siendo estrecho; el segundo, el de los contratos de alquiler permanentes,
          decaería por la oposición del PNV.
        </p>
        <p>
          El Gobierno cesa solo tras la celebración de las elecciones generales{' '}
          <Cite norma="ce" art="101.1" />.
        </p>
        <p>
          <strong>Fuentes:</strong>
        </p>
        <ul>
          <li>
            <a
              href="https://www.eldebate.com/espana/20261005/diputacion-permanente-puede-clave-salvar-decreto-vivienda-cns_466011.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              El Debate
            </a>
          </li>
          <li>
            <a
              href="https://noticiasciudadanas.com/la-vivienda-puede-volver-a-votarse-con-las-cortes-disueltas-que-permite-la-diputacion-permanente/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Noticias Ciudadanas
            </a>
          </li>
          <li>
            <a
              href="https://bilbaohiria.com/actualidad/sanchez-decreto-vivienda-diputacion-permanente-disolucion-cortes"
              target="_blank"
              rel="noopener noreferrer"
            >
              Bilbao Hiria
            </a>
          </li>
          <li>
            <a
              href="https://www.moncloa.com/2026/10/05/sanchez-reales-decretos-ley-vivienda-3442577/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Moncloa.com
            </a>
          </li>
          <li>
            <a
              href="https://www.democrata.es/en/general-elections-spain/elections-on-november-29-and-housing-decree-sanchez-way-to-do-it-all-at-once/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Demócrata
            </a>
          </li>
          <li>
            <a
              href="https://elpais.com/espana/2026-10-05/el-consejo-de-ministros-aprobara-manana-los-decretos-de-vivienda-para-que-los-vote-la-diputacion-permanente.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              El País
            </a>
          </li>
          <li>
            <a
              href="https://elpais.com/espana/2026-10-05/reacciones-a-los-decretos-de-vivienda-y-las-acampadas-en-directo.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              El País, en directo
            </a>
          </li>
        </ul>
      </div>

      <p className="lead">
        Medidas urgentes para la protección de la función social de la vivienda y la ampliación
        de la oferta de vivienda asequible.
      </p>

      <p>
        Dos reales decretos-ley publicados con un día de diferencia y aprobados en el mismo
        Consejo de Ministros. El primero, de 96 páginas y veinte artículos en seis títulos,
        actuaba en cuatro frentes: alquiler y desahucios, fiscalidad, parque público y financiación
        de vivienda asequible, y cerraba con la Cuenta de Ahorro e Inversión Financia Europa. El
        segundo era un texto breve de ocho páginas con un único artículo, y se ocupaba de una sola
        cosa: el futuro de los contratos de arrendamiento de vivienda habitual.
      </p>

      <p>
        Lo más urgente del primero era el régimen de desahucios. Si la administración competente
        no ofrecía alternativa habitacional a un arrendatario vulnerable, disponía de dos meses
        improrrogables para pagar o consignar la deuda; si no lo hacía, quedaba subrogada y no
        había lanzamiento (<Cite norma="rdl26" art="5.Dos" />). El segundo cambiaba el cálculo
        del inquilino: los contratos de vivienda habitual habrían pasado a prorrogarse
        obligatoriamente por plazos sucesivos de cinco años, o de siete si el arrendador era
        persona jurídica, salvo que este notificase su voluntad de no renovar con seis meses de
        antelación, y esa no renovación obligaría a pagar, como mínimo, el importe de doce
        mensualidades de renta de una vivienda de análogas características a la arrendada, salvo
        que procediese alguna de las excepciones de los apartados 10.1 y 10.2 de la LAU. No
        derogaba al primero, pero su disposición adicional primera fijaba la relación entre
        ambos: la prórroga indefinida prevalecía sobre la prórroga extraordinaria de la DF 5.ª
        cuando procedía el <Cite norma="lau" art="10.1" />, y si el primer decreto se hubiese
        aplicado a un contrato que el arrendador ya había negado, el contrato se extinguía
        igualmente con derecho a indemnización solo cuando la extinción por voluntad del
        arrendador se produjese sin que mediase ninguna de las causas previstas en el artículo
        10.2 de la LAU (<Cite norma="rdl27" art="disposición adicional primera.2" />,{' '}
        <Link href="/desahucios-y-alquiler#coordinacion">ver la coordinación</Link>).
      </p>

      <h2 id={slugify('En 1 minuto')}>En 1 minuto</h2>

      <div className="box">
        <ul>
          <li>
            <strong>Qué ha pasado:</strong> el Congreso ha rechazado los dos decretos de
            vivienda; ambos quedan derogados.
          </li>
          <li>
            <strong>Para inquilinos:</strong> la moratoria de desahucios, los límites
            extra a subidas de renta y las prórrogas automáticas que preveían los
            decretos entraron en vigor con ellos; al quedar derogados los decretos el
            2 de octubre de 2026, ya no se aplican.
          </li>
          <li>
            <strong>Para caseros:</strong> no se aplican las reglas de renovación automática
            ni las indemnizaciones previstas en el segundo decreto.
          </li>
          <li>
            <strong>Qué pasa ahora:</strong> vuelve el marco anterior (la LAU y las normas
            vigentes antes de los decretos), salvo que se aprueben nuevas medidas por otra vía.
            El Gobierno prevé reaprobar los nuevos decretos de vivienda y someterlos a la
            Diputación Permanente (ver la actualización al inicio de esta página).
          </li>
          <li>
            <strong>Futuro incierto:</strong> el Gobierno podría intentar tramitar algunas
            medidas como proyecto de ley, pero no hay nada cerrado. Además, prevé someter los
            nuevos decretos de vivienda a la Diputación Permanente (ver la actualización al
            inicio de esta página).
          </li>
        </ul>
      </div>

      <div className="box warn">
        <strong>Votación del 2 de octubre de 2026.</strong> El Congreso rechazó la
        convalidación de ambos decretos: RDL 26/2026, 172 a favor / 178 en contra /
        0 abstenciones; RDL 27/2026, 166–167 a favor / 184 en contra / 0
        abstenciones (<Cite norma="ce" art="86.2" />). Al no convalidarse,
        quedaron derogados y dejan de estar en vigor desde ese día.
      </div>

      <nav className="indice-pagina" aria-label="En esta página">
        <ul>
          <li><a href="#contenido">Resumen</a></li>
          <li><a href="#en-1-minuto">En 1 minuto</a></li>
          <li><a href="#resultado-de-la-votacion">Resultado de la votación</a></li>
          <li><a href="#cronologia">Cronología</a></li>
          <li><a href="#lo-que-afecta-al-tercer-sector">Tercer sector</a></li>
          <li><a href="#preguntas-frecuentes">Preguntas frecuentes</a></li>
          <li><a href="#como-leer-las-citas">Cómo leer las citas</a></li>
        </ul>
      </nav>

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

      <h2 id={slugify('Resultado de la votación')}>Resultado de la votación en el Congreso (2 de octubre de 2026)</h2>

      <p>
        Los dos decretos se votaron por separado y ambos fueron rechazados. Al no
        obtener la convalidación, quedan derogados y dejan de producir efectos.
      </p>

      <h3>RDL 26/2026 (el decreto «grande»)</h3>

      <ul>
        <li>
          <strong>Resultado:</strong> 172 votos a favor, 178 en contra, 0 abstenciones.
          Votaron en contra PP, Vox, Junts y UPN; a favor, PSOE, Sumar, ERC,
          EH Bildu, PNV, Podemos, BNG, Compromís y Coalición Canaria.
        </li>
        <li>
          <strong>Consecuencia:</strong> derogado. Entró en vigor el 1 de octubre de
          2026 y el Congreso lo derogó el 2 de octubre de 2026: no está ahora en vigor.
        </li>
        <li>
          <strong>Medidas que contenía y que no se aplican:</strong> moratoria de
          desahucios hasta 2030, enervación extraordinaria, tope extraordinario a la
          actualización de rentas, prórroga extraordinaria de contratos, reforma de la
          LAU sobre temporada y habitaciones, medidas fiscales (IRPF, IVA, IBI, SOCIMI)
          y financiación (avales, TU CASA y Cuenta Financia Europa).
        </li>
      </ul>

      <h3>RDL 27/2026 (alquileres)</h3>

      <ul>
        <li>
          <strong>Resultado:</strong> 166–167 votos a favor (según fuente), 184 en
          contra, 0 abstenciones.
        </li>
        <li>
          <strong>Consecuencia:</strong> derogado. Entró en vigor el 2 de octubre de
          2026 y el Congreso lo derogó ese mismo día: no está ahora en vigor.
        </li>
        <li>
          <strong>Medidas que contenía y que no se aplican:</strong> prórroga
          indefinida de cinco y siete años e indemnización de doce mensualidades por
          no renovación.
        </li>
      </ul>

      <p>
        Al no obtener la convalidación, los reales decretos-ley quedan derogados y
        dejan de producir efectos. La situación jurídica vuelve al marco anterior a
        su aprobación. Si alguna medida se tramita como proyecto de ley, este sitio
        se actualizará desde ese texto.
      </p>

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
            {CRONOLOGIA.map((row, i) => (
              <tr key={`${row.fecha}-${i}`}>
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

      <AvisoEstado />

      <p>
        Contexto (octubre de 2026): el Gobierno prevé someter los nuevos decretos de vivienda a
        la Diputación Permanente; ver la{' '}
        <a href="#nuevos-decretos-de-vivienda-y-diputacion-permanente">
          actualización al inicio de esta página
        </a>.
      </p>

      <h2 id={slugify('Preguntas frecuentes')}>Preguntas frecuentes</h2>

      <p>
        Las catorce preguntas que más se repiten, ahora en escenario post-votación:
        qué sigue vigente y qué no llegó a aplicarse. Debajo, la explicación de cómo leer las citas de todo el
        sitio.
      </p>

      <FaqList />

      <h2 id={slugify('Cómo leer las citas')}>Cómo leer las citas</h2>

      <p>
        Toda referencia de este sitio va acompañada del nombre de su norma, porque el número de
        artículo por sí solo no basta para identificar el texto aplicable. Una cita con el número
        solo, sin el nombre de la norma, no diría a cuál de las distintas disposiciones pertenece.
        El color de cada etiqueta dice a qué decreto o ley pertenece el precepto.
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
        Última revisión: 5 de octubre de 2026. Articulado contrastado con{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a> y{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>.
      </p>
    </>
  );
}
