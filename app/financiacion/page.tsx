import type { Metadata } from 'next';
import AvisoEstado from '@/components/AvisoEstado';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Financiación y cuenta',
  description:
    'Movilización del parque público, líneas de avales, el préstamo TU CASA al 0 % y la Cuenta de Ahorro e Inversión Financia Europa, con sus requisitos de pendientes de desarrollo.',
};

const TUCASA = [
  { k: 'Importe', v: 'El menor entre el 20 % del valor de la vivienda hipotecada y 50.000 €' },
  { k: 'Tipo y comisiones', v: '0 % y sin comisiones' },
  {
    k: 'Plazo',
    v: 'Hasta 10 años, con un período de carencia igual al del plazo de la hipoteca y por un máximo de 30 años',
  },
  {
    k: 'Transmisión',
    v: 'Precio máximo permanente: en segundas y posteriores transmisiones no podrá superar el precio de adquisición actualizado conforme al IPC, pudiendo incorporarse el valor de rehabilitaciones. Consta en la escritura y se inscribe en el Registro.',
  },
  {
    k: 'Financiación y reinversión',
    v: 'Se financia con el presupuesto del Ministerio de Vivienda y Agenda Urbana, y puede reinvertir reembolsos y rendimientos durante la vigencia del mecanismo, tras lo cual los recursos retornan al Tesoro.',
  },
  {
    k: 'Gestión',
    v: 'Gestionado por el ICO, con régimen de administración específico y contabilidad separada; los costes de gestión se imputan directamente al presupuesto del mecanismo.',
  },
  {
    k: 'Desarrollo',
    v: 'Un Acuerdo del Consejo de Ministros fijará objeto, beneficiarios, límites, características e importe inicial. El articulado no fija ningún límite de edad.',
  },
];

export default function FinanciacionPage() {
  return (
    <>
      <h1>Financiación, parque público y cuenta de ahorro</h1>
      <p className="lead">
        Movilización de parque público, dos líneas de avales por 2.000 M€ y 280 M€, el préstamo
        TU CASA al 0 % y la nueva Cuenta de Ahorro e Inversión Financia Europa (Títulos III a VI).
      </p>

      <AvisoEstado />

      <div className="box warn">
        <strong>Dos líneas de avales, no una.</strong>
        <p>
          El <Cite norma="rdl26" art="16" /> crea una línea de <b>2.000 M€</b> para promotores de
          vivienda social o asequible. El <Cite norma="rdl26" art="17" /> crea <b>otra</b> línea,
          de <b>280 M€</b>, para pymes de construcción industrializada, con otorgamiento hasta
          2040. El <b>artículo 18 del RDL 26/2026 y el artículo 86 bis del RDL 8/2023 no llevan ninguna cifra</b>: son
          únicamente el <i>régimen de cobranza</i> de cada línea. Cualquier resumen que sume las
          dos líneas en una sola, o que atribuya los 280 M€ al artículo 18 del RDL 26/2026, está mal.
        </p>
      </div>

      <h2 id={slugify('Parque público (arts. 11 a 14)')}>Parque público (arts. 11 a 14)</h2>

      <ul>
        <li>
          <b>Art. 11 (RDL 26/2026):</b> el régimen patrimonial de CASA 47 se rige por sus normas de creación y, en
          lo no previsto, por la Ley 33/2003. En la enajenación de viviendas de la Entidad —o
          promovidas en solares residenciales enajenados por ella— el precio de venta no puede
          superar el producto de su <b>superficie registral</b> por el{' '}
          <b>módulo más alto</b> de la legislación autonómica en vivienda protegida vigente en el
          momento de la transmisión.{' '}
          Esa limitación{' '}
          <b>se extiende a las sucesivas transmisiones</b>, debe constar en los pliegos y en las
          escrituras y se hace constar en el Registro de la Propiedad; en las viviendas calificadas
          con algún régimen de protección pública, empieza a regir finalizado el plazo de
          protección.{' '}
          <Cite norma="rdl26" art="11" />
        </li>
        <li>
          <b>Art. 12 (RDL 26/2026):</b> se aportan a CASA 47, por orden ministerial y con pleno carácter
          traslativo, todos los inmuebles del Patrimonio del Estado susceptibles de destinarse a la
          política de vivienda, así como las viviendas del patrimonio de la Seguridad Social.
          La aportación se exceptúa de la necesidad de valorar con carácter previo los inmuebles
          que van a ser aportados. En el caso de las viviendas de la Seguridad Social, tras su
          valoración, la contraprestación puede consistir en{' '}
          <b>condonación de deuda</b> por el Ministerio de Hacienda por importe igual al valor de
          los inmuebles. Quedan excluidos de compensación los inmuebles puestos a disposición por el
          INVIED, ADIF y Giese. Los inmuebles del Fondo Especial de MUFACE y los Reales Patronatos
          no se aportan con transmisión de la titularidad: CASA 47 puede gestionarlos mediante
          negocios patrimoniales que otorguen su uso
          manteniendo esos organismos su titularidad.
        </li>
        <li>
          <b>Art. 13 (RDL 26/2026):</b> se crea el Fondo de Vivienda de Impacto Social,{' '}
          <b>carente de personalidad jurídica</b>, con duración indefinida, adscrito al Ministerio
          de Vivienda y Agenda Urbana y dotado a través de su presupuesto, para financiar proyectos
          con impacto social positivo atrayendo inversión privada en proyectos innovadores en
          vivienda.
        </li>
        <li>
          <b>Art. 14 (RDL 26/2026):</b> es <b>vivienda asequible</b> aquella cuyas condiciones de precio de venta
          o alquiler, incluidos todos los gastos asociados, no superen el{' '}
          <b>30 % de la renta mediana</b> de la unidad de convivencia habitual del municipio en el
          que se ubique el inmueble. Los gastos asociados a los anejos no podrán suponer un
          incremento del precio de alquiler respecto al determinado para la vivienda.
        </li>
      </ul>

      <h2 id={slugify('Avales y TU CASA (arts. 15 a 19)')}>Avales y TU CASA (arts. 15 a 19)</h2>

      <ul>
        <li>
          <b>Art. 15 (RDL 26/2026):</b> se añade un sexto supuesto al artículo doce de la Ley de hipoteca
          mobiliaria y prenda sin desplazamiento de posesión:{' '}
          <b>el conjunto de componentes industrializados</b> destinados a la construcción
          industrializada de edificios, fabricados en entorno controlado para su posterior
          transporte, recepción, montaje y ensamblaje en obra.
        </li>
        <li>
          <b>Art. 16 (RDL 26/2026)</b>, que modifica el artículo 86 del{' '}
          <span className="cite-norma">RDL 8/2023</span>): línea de avales de hasta{' '}
          <b>2.000 M€</b> mediante convenios entre el Ministerio de Vivienda y Agenda Urbana y el
          ICO, por un plazo de hasta <b>35 años</b>, para la financiación de promotores públicos y
          privados en forma de préstamo dentro de la Facilidad ICO MRR para Promoción de Vivienda
          Social o con cargo a la estrategia de inversión definida en España CRECE. La ejecución se
          atenderá desde una partida presupuestaria del Ministerio, de carácter ampliable.{' '}
          El nuevo <b>artículo 86 bis del RDL 8/2023</b> fija el régimen
          de cobranza: el ICO aplica a la parte avalada el mismo régimen de recuperación y cobranza
          que a la no avalada, nunca el de crédito público; el deudor y los fiadores responden
          íntegramente por la deuda avalada; los créditos avalados tienen la consideración de
          crédito financiero y <b>rango de crédito ordinario</b> en el concurso, sin perjuicio de las
          garantías del crédito principal.{' '}
          <Cite norma="rdl83" art="86 bis" />
        </li>
        <li>
          <b>Art. 17 (RDL 26/2026):</b> segunda línea, de hasta <b>280 M€</b> y con otorgamiento hasta 2040, para
          las pymes de la línea «ICO CRECIMIENTO CONSTRUCCIÓN INDUSTRIALIZADA para inversión y
          circulante», esto es, fabricantes y promotores que utilicen sistemas de
          construcción industrializada.
        </li>
        <li>
          <b>Art. 18 (RDL 26/2026):</b> régimen de cobranza de esa segunda línea, <b>sin ninguna
          cuantía</b>, en términos equivalentes al del artículo 86 bis del RDL 8/2023.
        </li>
      </ul>

      <h3 id={slugify('El mecanismo TU CASA (art. 19 RDL 26/2026)')}>
        El mecanismo TU CASA (art. 19 RDL 26/2026)
      </h3>

      <ScrollTable label="Condiciones del mecanismo TU CASA">
        <table>
          <thead>
            <tr>
              <th scope="col">Condición</th>
              <th scope="col">Qué fija el art. 19 RDL 26/2026</th>
            </tr>
          </thead>
          <tbody>
            {TUCASA.map((row) => (
              <tr key={row.k}>
                <td>{row.k}</td>
                <td>{row.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>

      <p>
        El <Cite norma="rdl26" art="19" /> crea el mecanismo para <b>completar</b> la financiación
        privada de quienes accedan a su primera vivienda habitual hipotecada. No es una giveaway:
        es un préstamo, con las condiciones de la tabla.
      </p>

      <h2 id={slugify('Cuenta de Ahorro e Inversión Financia Europa (art. 20 RDL 26/2026)')}>
        Cuenta de Ahorro e Inversión Financia Europa (art. 20 RDL 26/2026)
      </h2>

      <p>
        El <Cite norma="rdl26" art="20" /> modifica la Ley de los Mercados de Valores: añade un
        artículo 309 bis y un título XI (artículos 341 a 356) <b>del LMV</b> con la cuenta y los
        requisitos de las IIC elegibles, y las disposiciones adicionales décima y decimoprimera.
      </p>

      <ul>
        <li>
          <b>Estructura y titularidad.</b> Es una relación contractual de servicios de inversión
          entre una persona física y una entidad proveedora, articulada mediante una cuenta
          operativa de efectivo, una cuenta de valores y una cuenta bancaria de contrapartida. Las
          aportaciones se hacen <b>en efectivo con cargo a la cuenta de contrapartida</b> y las
          disposiciones se abonan en la cuenta de contrapartida. La titularidad es individual e
          intransmisible y un mismo contribuyente
          solo puede ser titular simultáneamente de una cuenta de la modalidad general, sin
          perjuicio de la compatibilidad con una cuenta de la modalidad de reinversión.{' '}
          <Cite norma="lmv" art="341 y 344" /> El saldo de la cuenta operativa no puede ser superior
          a 1.500 € en la modalidad ordinaria.{' '}
          <Cite norma="lmv" art="344.4" /> En la modalidad de reinversión el saldo máximo se amplía
          hasta 8.000 €.{' '}
          <Cite norma="lmv" art="disposición adicional décima.2" /> Cuando se produzcan los abonos
          previstos, el titular dispone de tres meses para invertir el importe que exceda del umbral
          o para disponer del mismo; transcurrido ese plazo sin que el saldo descienda del umbral, se
          entiende producida una disposición parcial por el exceso y la entidad lo transfiere a la
          cuenta de contrapartida. La cuenta operativa no puede presentar saldo deudor.
        </li>
        <li>
          <b>Aportaciones.</b> El límite es de <b>150.000 € pendientes de recuperar</b> en la cuenta
          ordinaria, y de <b>800.000 € acumulados</b> en la modalidad de reinversión, donde las
          disposiciones no minoran el importe acumulado a efectos del límite.{' '}
          <Cite norma="rdl26" art="6.Segundo.Cinco.1.f" />{' '}
          <Cite norma="rdl26" art="6.Segundo.Doce.5" /> No computan como aportación el
          producto de transmisión o reembolso de activos que permanezca dentro de la misma cuenta,
          ni los importes procedentes de operaciones corporativas sobre activos ya
          integrados.{' '}
          <Cite norma="lmv" art="350.3" />
        </li>
        <li>
          <b>Tributación.</b> Las ganancias o pérdidas patrimoniales por transmisión o reembolso
          <b> no se integran</b> en la base imponible hasta que se efectúe una disposición total o
          parcial; las ganancias tributan al disponer.{' '}
          <Cite norma="rdl26" art="6.Segundo.Cinco.3" /> En la cuenta de la modalidad general, la parte
          de la ganancia atribuible a aportaciones que hayan permanecido en la cuenta más de cinco
          años queda excluida en un 100 % hasta 10.000 € por contribuyente y en un 20 % sobre el
          resto.{' '}
          <Cite norma="lirpf" art="95 ter.4" />{' '}
          <Cite norma="rdl26" art="6.Segundo.Cinco" /> En la cuenta de reinversión, esa misma parte
          queda excluida en un 20 %, sin la exclusión del 100 % de los primeros 10.000 €.{' '}
          <Cite norma="lirpf" art="disposición adicional sexagésima sexta.2" />{' '}
          <Cite norma="rdl26" art="6.Segundo.Doce" />
        </li>
        <li>
          <b>IIC elegibles.</b> Solo pueden integrarse acciones y participaciones de IIC{' '}
          <b>inscritas en el Registro de IIC Elegibles</b> que habilite la CNMV. Los requisitos
          son: inversión mínima del <b>70 %</b> en activos del Espacio Económico Europeo;{' '}
          <b>al menos el 50 %</b> de la cartera en instrumentos de renta variable y{' '}
          <b>al menos el 35 %</b> en renta variable computable como activo del EEE;{' '}
          <b>no invertir</b> en SOCIMI ni sus análogas extranjeras, en IIC inmobiliarias ni en SICAV,
          salvo réplica de índice de un mercado regulado; y una mención expresa en el folleto, con
          declaración responsable de la gestora.{' '}
          <Cite norma="lmv" art="352" /> <Cite norma="lmv" art="355" />{' '}
          <Cite norma="lmv" art="356" /> La baja en el registro da un periodo transitorio de{' '}
          <b>tres meses</b> para retirar la inversión de las carteras.{' '}
          <Cite norma="lmv" art="354" />
        </li>
        <li>
          <b>SIALP Financia Europa.</b> Seguro de vida con prima máxima de{' '}
          <b>10.000 € anuales</b> —frente a los 5.000 € del SIALP ordinario— y{' '}
          <b>sin garantía mínima del 85 %</b> que sí exige el plan de ahorro a largo plazo
          ordinario.{' '}
          <Cite norma="rdl26" art="6.Segundo.Siete.1.c y e" /> Solo pueden integrarse
          acciones de sociedades del EEE, participaciones de IIC que cumplan los requisitos del
          capítulo II y renta fija con calificación crediticia mínima BBB, sin derivados; y{' '}
          <b>al menos el 30 %</b> del valor de cada conjunto de activos debe corresponder a
          instrumentos de renta variable.{' '}
          <Cite norma="rdl26" art="6.Segundo.Siete.3" /> Si un activo deja de ser
          elegible, la entidad dispone de un <b>plazo de subsanación de tres meses</b>; si no se
          corrige, el seguro pierde la consideración de SIALP Financia Europa y deja de aplicarse la
          exención.{' '}
          <Cite norma="rdl26" art="6.Segundo.Siete.3" />
        </li>
      </ul>

      <h3 id={slugify('Disposiciones adicionales y de desarrollo')}>
        Disposiciones adicionales y de desarrollo
      </h3>

      <ul>
        <li>
          <b>DA 1.ª:</b> el Gobierno regulará en <b>seis meses</b>, a propuesta del Ministerio de
          Vivienda y Agenda Urbana, la definición y el procedimiento de certificación o
          reconocimiento de la figura de los proveedores sociales de vivienda asequible, incluidas
          las cooperativas, tomando como referente las Housing Associations. La certificación será{' '}
          <b>exclusivamente</b> a efectos de participación en programas o de acceso a financiación,
          ventajas o especialidades en relación con tributos o procedimientos estatales.{' '}
          <Cite norma="rdl26" art="disposición adicional primera" />
        </li>
        <li>
          <b>DA 2.ª:</b> en el plazo máximo de <b>cuatro meses</b> desde la entrada en vigor, la
          CNMV creará el Registro de IIC Elegibles y habilitará los medios para solicitar la
          inscripción.{' '}
          <Cite norma="rdl26" art="disposición adicional segunda" />
        </li>
        <li>
          <b>DF 3.ª (reglamento del IRPF):</b> modifica el RIRPF en tres materias independientes:
          el concepto de vivienda habitual a efectos de exención por reinversión (<Cite norma="rdl26" art="disposición final tercera.Uno" />);
          la ampliación de la declaración informativa de Planes de Ahorro a Largo Plazo para incluir
          los SIALP Financia Europa (<Cite norma="rdl26" art="disposición final tercera.Dos" />);
          y las normas sobre retenciones e ingresos a cuenta (<Cite norma="rdl26" art="disposición final tercera.Tres y Cuatro" />).
          La tributación de las cuentas de reinversión se regula en la disposición adicional sexagésima sexta de la LIRPF (<Cite norma="rdl26" art="6.Segundo.Doce" />).
        </li>
        <li>
          <b>DF 4.ª</b> (reglamento de gestión tributaria): nuevo{' '}
          <b>artículo 39 quater del Reglamento de gestión tributaria</b>, por el que las entidades
          proveedoras de la Cuenta deben
          presentar una <b>declaración informativa anual</b> con una quincena de datos, desde la
          fecha de apertura y su identificación interna hasta las operaciones, saldos, valores
          liquidativos e identificaciones de activos a 31 de diciembre, incluida la causa de
          cancelación y, en su caso, la de fallecimiento o pérdida de la condición de
          contribuyente.{' '}
          <Cite norma="rdl26" art="disposición final cuarta" />
        </li>
        <li>
          <b>DF 8.ª.2:</b> la orden a que se refiere el artículo 347.7 de la Ley de los Mercados de
          Valores —que regula la movilización entre entidades proveedoras—{' '}
          <b>debe aprobarse en el plazo de seis meses</b> desde la entrada en vigor del real
          decreto-ley.{' '}
          <Cite norma="rdl26" art="disposición final octava.2" />
        </li>
        <li>
          <b>DF 11.ª.3:</b> la Cuenta y los SIALP Financia Europa{' '}
          <b>no podrán comercializarse ni contratarse</b> hasta la orden ministerial que instrumente
          sus obligaciones de información; hasta que funcione el Registro de IIC Elegibles solo
          podrán comercializarse con los activos elegibles distintos de participaciones o acciones
          de IIC; y <b>no podrán efectuarse movilizaciones</b> hasta la orden del artículo 347 de
          la LMV.{' '}
          <Cite norma="rdl26" art="disposición final undécima.3" />
        </li>
        <li>
          <b>DF 9.ª:</b> el decreto incorpora parcialmente la Directiva (UE) 2021/2167, sobre
          administradores y compradores de créditos.{' '}
          <Cite norma="rdl26" art="disposición final novena" />
        </li>
      </ul>

      <div className="box ac2">
        <strong>Cesiones de crédito: una protección que no estaba en el análisis anterior.</strong>
        <p>
          La DF 1.ª añade un <b>artículo 25 bis a la Ley 5/2019</b> de contratos de crédito
          inmobiliario. Dos reglas importan:{' '}
          <b>queda prohibida la cesión de préstamos hipotecarios vencidos cuyo deudor esté acogido a
          las medidas del RDL 6/2012</b>, y cuando se ceda un crédito vencido garantizado por
          hipoteca sobre la vivienda habitual, la comunicación debe informar al deudor de la
          posibilidad de acogerse a esas medidas; si el deudor lo acredita{' '}
          <b>dentro de los seis meses siguientes</b> a la comunicación de la cesión,{' '}
          <b>el cedente debe readquirir el préstamo por el mismo precio</b> y ofrecer las medidas
          solicitadas, salvo que sea el propio cedente quien las ofrezca.{' '}
          <Cite norma="lrga" art="25 bis" /> Y se aplica a las cesiones realizadas{' '}
          <b>después de la entrada en vigor</b>, cualquiera que sea la fecha en que se hubiera
          celebrado el contrato.{' '}
          <Cite norma="rdl26" art="disposición final undécima.2" />
        </p>
      </div>

      <p className="page-meta">
        Última revisión: 1 de octubre de 2026. Articulado contrastado con{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20266">BOE-A-2026-20266</a> y{' '}
        <a href="https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20385">BOE-A-2026-20385</a>.
      </p>
    </>
  );
}
