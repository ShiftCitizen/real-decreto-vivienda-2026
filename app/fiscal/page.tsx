import type { Metadata } from 'next';
import Link from 'next/link';
import AvisoEstado from '@/components/AvisoEstado';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Fiscalidad',
  description:
    'El RDL 29/2026 (en vigor desde el 8-10-2026) recupera reducciones IRPF, IVA estancias cortas, recargos IBI y gravamen SOCIMI. El RDL 26/2026 quedó derogado el 2-10-2026.',
};

const REDUCCIONES = [
  {
    supuesto:
      'Nuevo contrato del mismo arrendador no gran tenedor con rebaja de renta superior al 5 %',
    reduccion:
      '100, 95, 90, 85 o 70 %, según continuidad del inquilino, renta por debajo del índice, zona tensionada y edad del arrendatario (entre 18 y 35 años)',
  },
  {
    supuesto: 'Nuevo contrato del mismo arrendador no gran tenedor sin subir la renta anterior (o que no la exceda)',
    reduccion: '50 %',
  },
  {
    supuesto: 'Nuevo contrato del mismo arrendador no gran tenedor con subida de renta',
    reduccion:
      '40, 30, 25, 20 o 15 %, según el incremento (hasta 5 %, hasta 10 %, hasta 15 %, hasta 20 %, o más)',
  },
  {
    supuesto: 'Alquiler por primera vez (no gran tenedor)',
    reduccion:
      '100, 95, 90, 85 o 50 %, según renta por debajo del índice, zona tensionada, edad y renta',
  },
  {
    supuesto:
      'Alquiler social, o a una administración pública o entidad sin fines lucrativos para alquiler asequible',
    reduccion: '70 %',
  },
  { supuesto: 'Vivienda rehabilitada en los dos años anteriores', reduccion: '60 %' },
  {
    supuesto:
      'Prórroga tácita del artículo 10.1 LAU, sin gran tenedor y respetando la renta de referencia',
    reduccion: '80 %',
  },
];

export default function FiscalPage() {
  return (
    <>
      <h1>Fiscalidad</h1>
      <p className="lead">
        El RDL 29/2026 (en vigor desde el 8-10-2026, pendiente de convalidación)
        recupera las reducciones en el IRPF por alquiler, el IVA sobre estancias
        cortas, los recargos de IBI y el gravamen especial de las SOCIMI. Esta
        página los describe con las citas del RDL 26/2026, derogado el 2-10-2026,
        cuyo contenido reproduce en lo sustancial.
      </p>

      <AvisoEstado />

      <h2 id={slugify('Art. 6 (RDL 26/2026). IRPF')}>Art. 6 (RDL 26/2026). IRPF</h2>

      <h3>Reducción del rendimiento por alquiler de vivienda</h3>

      <ScrollTable label="Reducciones del rendimiento neto por arrendamiento de vivienda">
        <table>
          <thead>
            <tr>
              <th scope="col">Supuesto</th>
              <th scope="col">Reducción</th>
            </tr>
          </thead>
          <tbody>
            {REDUCCIONES.map((row) => (
              <tr key={row.supuesto}>
                <td>{row.supuesto}</td>
                <td>{row.reduccion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>

      <p>
        Se aplica la reducción de mayor cuantía cuando concurren varias, y los requisitos se{' '}
        <b>cumplen al celebrar el contrato</b>, siendo la reducción aplicable durante su vigencia
        mientras se sigan cumpliendo. Las reducciones solo afectan a rendimientos netos positivos
        calculados en una autoliquidación presentada{' '}
        <b>antes</b> de que se haya iniciado un procedimiento de verificación de datos, de
        comprobación limitada o de inspección que incluya la comprobación de esos rendimientos, y
        nunca sobre la parte de los ingresos no incluidos o de los gastos indebidamente deducidos
        que se regularicen después. Tampoco son aplicables a contratos que{' '}
        <b>incumplan el artículo 17.6 de la LAU</b>. En los supuestos del mismo arrendador no
        gran tenedor, la renta inicial se compara con la última renta del anterior contrato de
        la misma vivienda, una vez aplicada, en su caso, la cláusula de actualización anual del
        contrato anterior. Las zonas de mercado residencial tensionado a
        las que puede aplicarse son las de la resolución que apruebe el Ministerio de Vivienda y
        Agenda Urbana.{' '}
        <Cite norma="rdl26" art="6.Segundo.Dos" />
      </p>

      <p>
        El régimen transitorio distingue los contratos anteriores a la Ley 12/2023 —que conservan la
        reducción del artículo 23.2 LIRPF <i>en su redacción vigente a 31 de diciembre de
        2021</i>— de los celebrados entre la entrada en vigor de esa ley y el 1 de diciembre de
        2026, a los que se aplica la redacción vigente a 31 de diciembre de 2025. Con
        independencia de la fecha, la reducción del 80 % por prórroga del contrato exige que
        el cumplimiento del plazo mínimo de cinco años del artículo 9 de la LAU tenga lugar con
        posterioridad al 1 de diciembre de 2026, siempre que el arrendador no sea gran tenedor y
        la renta no supere el límite máximo del sistema de índices de referencia.{' '}
        <Cite norma="rdl26" art="6.Segundo.Catorce" /> <Cite norma="lirpf" art="disposición transitoria trigésima octava.2" />
      </p>

      <h3>Lo que cambia de verdad en el IRPF</h3>

      <div className="box">
        <strong>Nueva deducción por alquiler de vivienda habitual en el IRPF.</strong>
        <p>
          Se introduce una deducción del 10 % por el alquiler de vivienda habitual en la cuota
          líquida estatal. Aplica a contribuyentes con suma de base imponible general y del ahorro
          inferior a 33.007,20 €. La base máxima de la deducción es de 11.630 € anuales para bases
          imponibles hasta 23.007,20 €, reduciéndose en 1,163 por cada euro de exceso sobre esa cifra
          hasta 33.007,20 €.{' '}
          <Cite norma="rdl26" art="6.Segundo.Tres y Cuatro" /> <Cite norma="lirpf" art="68.6" />
        </p>
        <p>
          <b>Requisito de titularidad:</b> se exige que durante al menos la mitad del período
          impositivo, ni el contribuyente ni ninguno de los miembros de su unidad familiar sean
          titulares, de manera individual o conjuntamente, de la totalidad del pleno dominio o de
          un derecho real de uso o disfrute constituido sobre otra vivienda distante a menos de
          50 km de la vivienda arrendada, salvo que exista una resolución
          administrativa o judicial que les impida su uso como residencia.{' '}
          <Cite norma="rdl26" art="6.Segundo.Cuatro" /> <Cite norma="lirpf" art="68.6" />
        </p>
      </div>

      <h3>Otras medidas</h3>

      <ul>
        <li>
          <b>Exención por venta a entes públicos de vivienda social</b> (hasta el 31-12-2027):
          exenta del todo hasta 200.000 € de valor de transmisión y decreciente hasta un valor de
          transmisión total inferior a 800.000 €. Requiere que la vivienda haya permanecido{' '}
          <b>desocupada de forma continuada y sin causa justificada durante los dos años</b> anteriores
          a la transmisión —las causas justificadas son las que enumera el artículo 72.4 bis LRHL—.{' '}
          <Cite norma="rdl26" art="6.Segundo.Once" />{' '}
          <Cite norma="lirpf" art="disposición adicional sexagésima quinta.1-2" />
        </li>
        <li>
          <b>Reinversión en la Cuenta de Ahorro e Inversión Financia Europa Reinversión:</b> la
          exención por reinversión solo se aplica a transmisiones realizadas una vez transcurridos{' '}
          <b>treinta días hábiles</b> desde la entrada en vigor del decreto. Debe reinvertirse,
          en el plazo de <b>seis meses</b> desde la transmisión (o desde la entrada
          en vigor de la orden ministerial de información si esta fuera posterior), el valor de
          transmisión que proporcionalmente se corresponda con la ganancia patrimonial no exenta.{' '}
          <Cite norma="rdl26" art="6.Segundo.Once" />{' '}
          <Cite norma="lirpf" art="disposición adicional sexagésima quinta.1" /> El importe total
          acumulado de las aportaciones a esa cuenta no puede exceder de <b>800.000 €</b>.{' '}
          <Cite norma="rdl26" art="6.Segundo.Doce" />{' '}
          <Cite norma="lirpf" art="disposición adicional sexagésima sexta.5" />
        </li>
        <li>
          <b>Imputación de rentas inmobiliarias</b> (desde el 1-1-2027): escala sobre la suma de
          valores catastrales de los inmuebles imputables: 1,1 % sobre los primeros 100.000 € (cuota
          de 1.100 €); 1,5 % sobre los siguientes 400.000 € (hasta 500.000 €, cuota de 7.100 €);
          2 % sobre los siguientes 500.000 € (hasta 1.000.000 €, cuota de 17.100 €); y 3 % sobre el
          exceso de 1.000.000 €. Si el inmueble careciera de valor catastral o no se hubiera
          notificado, se computa el 50 % del mayor valor verificado por la Administración o el
          precio de adquisición.{' '}
          <Cite norma="rdl26" art="6.Tercero.Dos" /> <Cite norma="lirpf" art="85.1" />
        </li>
        <li>
          <b>Rendimiento en caso de parentesco:</b> si el arrendatario es cónyuge o pariente
          hasta el tercer grado, el rendimiento neto total no podrá ser inferior al que resulte de
          aplicar el porcentaje medio efectivo a que se refiere el artículo 85 LIRPF sobre el valor
          catastral, computando además los inmuebles del artículo 24 LIRPF.{' '}
          <Cite norma="rdl26" art="6.Tercero.Uno" />
        </li>
        <li>
          <b>Vivienda habitual a efectos del Reglamento del IRPF</b> (DF 3.ª): para las exenciones
          por transmisión cuenta como habitual la vivienda de las personas mayores de 65 años o
          en situación de dependencia severa o gran dependencia que trasladan su residencia a
          un centro especializado o al domicilio de un familiar hasta el tercer grado por
          consanguinidad o afinidad; y la del
          cónyuge que debe abandonar el domicilio por separación, divorcio o nulidad, siempre que
          el requisito de ocupación efectiva concurra en el cónyuge que permaneció en la misma.{' '}
          <Cite norma="rdl26" art="disposición final tercera.Uno" />
        </li>
      </ul>

      <h2 id={slugify('Art. 7 (RDL 26/2026). IVA')}>Art. 7 (RDL 26/2026). IVA</h2>

      <ul>
        <li>
          <b>Sale de la exención</b> (con efectos desde el 1-12-2026) el arrendamiento de
          apartamentos o viviendas amueblados en dos supuestos independientes: primero, cuando el
          arrendador se obligue a la prestación de servicios complementarios propios de la industria
          hotelera; o segundo, cuando la duración de la cesión a favor de un mismo arrendatario sea
          igual o inferior a <b>30 noches</b>, salvo que la cesión se produce en la vivienda en la
          que el arrendador tenga su residencia habitual, en cuyo caso estará exenta.{' '}
          <Cite norma="rdl26" art="7.Uno" /> <Cite norma="liva" art="20.Uno.23.e" /> Tributan al
          10 %. <Cite norma="liva" art="91.Uno.2.2" />
        </li>
        <li>
          <b>Tipo del 10 % para obras de renovación y reparación</b> en edificios o partes de
          ellos destinados a vivienda, cuando se cumplan los siguientes requisitos: que el
          destinatario sea persona física sin condición de empresario o profesional para uso
          particular, una comunidad de propietarios, o se trate de una vivienda destinada a
          arrendamiento como vivienda habitual cualquiera que sea la condición del arrendador; que
          la construcción o rehabilitación de la vivienda haya concluido al menos dos años antes
          del inicio de las obras; que la persona que realice las obras no aporte materiales para
          su ejecución o, si los aporta, su coste no exceda del 40 % de la base imponible de la
          operación; y que la contraprestación se haya pagado mediante tarjeta de crédito o débito,
          transferencia bancaria, cheque nominativo o ingreso en cuentas de entidades de crédito.{' '}
          <Cite norma="rdl26" art="7.Tres" /> <Cite norma="liva" art="91.Uno.2.10" />
        </li>
        <li>
          <b>Tipo superreducido</b> (con efectos desde el 1-12-2026) para las viviendas calificadas
          administrativamente como de protección oficial de régimen especial o de promoción pública,
          así como las viviendas protegidas sujetas a calificación permanente o indefinida, cuando
          las entregas se efectúen por sus promotores, incluidos los garajes y anexos situados en
          el mismo edificio que se transmitan conjuntamente, con un máximo de dos plazas de garaje;
          y para las viviendas que adquieran las
          entidades del régimen especial de arrendamiento de vivienda si a sus rentas se aplica la
          bonificación del artículo 49.1 de la Ley del Impuesto sobre Sociedades.{' '}
          <Cite norma="rdl26" art="7.Cuatro" /> <Cite norma="liva" art="91.Dos.1.6" />
        </li>
      </ul>

      <h2 id={slugify('Art. 8 (RDL 26/2026). IBI')}>Art. 8 (RDL 26/2026). IBI</h2>

      <p>
        El artículo 8 reescribe el título del artículo 72 LRHL y añade dos apartados. <b>Son dos
        regímenes distintos y no se pueden leer como uno solo</b>: el de la vivienda desocupada
        difiere según el municipio esté o no declarado zona de mercado residencial tensionado.
      </p>

      <ScrollTable label="Recargo del IBI por vivienda desocupada y por alojamiento turístico">
        <table>
          <thead>
            <tr>
              <th scope="col">Supuesto</th>
              <th scope="col">Recargo sobre la cuota líquida</th>
              <th scope="col">Precondición</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={3}>
                <b>Vivienda desocupada con carácter permanente</b>
                <br />
                <b>FUERA</b> de zona tensionada (art. 72.4 bis LRHL, párrafo primero)
              </td>
              <td>Hasta el 50 %</td>
              <td>
                Desocupación continuada y sin causa justificada <b>más de dos años</b>, para
                inmuebles de <b>titulares de cuatro o más</b> inmuebles de uso residencial.
              </td>
            </tr>
            <tr>
              <td>Hasta el 100 % (sustituye al 50 % base)</td>
              <td>
                El periodo de desocupación <b>supera los tres años</b>.
              </td>
            </tr>
            <tr>
              <td>
                Hasta <b>50 puntos porcentuales adicionales</b> sobre la base máxima anterior
              </td>
              <td>
                Inmuebles de titulares de <b>dos o más</b> inmuebles de uso residencial desocupados{' '}
                <b>en el mismo término municipal</b>.
              </td>
            </tr>
            <tr>
              <td rowSpan={3}>
                <b>Vivienda desocupada con carácter permanente</b>
                <br />
                <b>DENTRO</b> de zona tensionada (art. 72.4 bis LRHL, párrafo segundo)
              </td>
              <td>Hasta el 50 %</td>
              <td>
                Desocupación continuada y sin causa justificada <b>más de dos años</b>.
              </td>
            </tr>
            <tr>
              <td>Hasta el 100 % (sustituye al 50 % base)</td>
              <td>
                Inmuebles de titulares de <b>cuatro o más</b> inmuebles de uso residencial.
              </td>
            </tr>
            <tr>
              <td>
                Hasta <b>50 puntos porcentuales adicionales</b> sobre la base máxima anterior
              </td>
              <td>
                Desocupación <b>más de tres años</b> y titular de <b>cuatro o más</b> inmuebles de
                uso residencial.
              </td>
            </tr>
            <tr>
              <td rowSpan={3}>
                <b>Alojamiento de uso turístico</b> (art. 72.4 ter LRHL)
                <br />
                Solo en zona tensionada
              </td>
              <td>Hasta el 50 %</td>
              <td>Inmueble de uso residencial destinado a alojamiento de uso turístico (identificado según normativa autonómica).</td>
            </tr>
            <tr>
              <td>Hasta el 100 %</td>
              <td>Titulares de <b>dos o más</b> inmuebles de uso residencial destinados a alojamientos de uso turístico.</td>
            </tr>
            <tr>
              <td>Hasta el <b>150 %</b></td>
              <td>Titulares de <b>cuatro o más</b> inmuebles de uso residencial destinados a alojamientos de uso turístico.</td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>

      <div className="box warn">
        <strong>Estructura de los recargos del IBI.</strong>
        <p>
          En el recargo por vivienda desocupada (art. 72.4 bis LRHL), el recargo consiste en una{' '}
          <b>base máxima del 50 % o del 100 % (el 100 % sustituye al 50 %), más hasta 50 puntos</b>{' '}
          porcentuales adicionales según el número de inmuebles y tiempo de desocupación. El
          régimen difiere según el inmueble esté dentro o fuera de zona tensionada.{' '}
          <Cite norma="lrhl" art="72.4 bis" />
        </p>
        <p>
          En ambos regímenes se exige ordenanza fiscal municipal: el recargo es potestativo, no automático.
        </p>
      </div>

      <p>
        En los dos regímenes del apartado 4 bis se establece en todo caso un <b>catálogo de causas justificadas</b>{' '}
        (traslado por razones laborales o de formación, cambio de domicilio por dependencia o
        salud, segunda residencia con un máximo de cuatro años, actuaciones de obra o
        rehabilitación, litigio o causa pendiente de resolución judicial o administrativa, o
        venta o alquiler ofrecidos en el mercado con máximo de un año o seis meses
        respectivamente). El recargo se devenga el 31 de diciembre y se liquida anualmente una vez
        constatada la desocupación en esa fecha, previa audiencia del sujeto pasivo.{' '}
        <Cite norma="lrhl" art="72.4 bis" />
      </p>

      <h2 id={slugify('Arts. 9 y 10')}>Arts. 9 y 10</h2>

      <p>
        <b>SOCIMI:</b> el gravamen especial pasa del 15 % general al <b>25 %</b> cuando el importe
        de los beneficios no distribuidos derive del ejercicio de la actividad de arrendamiento de
        viviendas, en cualquiera de las modalidades de la LAU, o de cualquier otro arrendamiento o
        cesión de uso de inmuebles residenciales, <b>incluidos los destinados a alojamiento u
        hospedaje, fines turísticos o de corta duración</b>. El gravamen del 25 % se aplica solo sobre
        la parte de los beneficios no distribuidos que proceda de rentas que no hayan tributado al
        tipo general y que no se encuentren dentro del plazo de reinversión del artículo 6.1.b de la
        Ley 11/2009. Se devenga el día del acuerdo de aplicación del resultado por la junta general, y
        se autoliquida e ingresa en dos meses.{' '}
        <Cite norma="rdl26" art="9.Uno" /> <Cite norma="lic" art="9.4" />
      </p>

      <p>
        Se reduce <b>un 50 %</b> cuando las viviendas destinadas a alquiler a precio asequible
        representen <b>más del 80 %</b> del parque total de viviendas destinadas a arrendamiento, y{' '}
        <b>un 100 %</b> cuando, además, el beneficio no distribuido se reinvierte en el plazo de{' '}
        <b>tres años</b> en viviendas de alquiler a precio asequible. A estos efectos se cuentan
        tanto las viviendas asequibles como las protegidas del artículo 3 de la Ley 12/2023, y el
        80 % se calcula sobre el <b>balance consolidado</b> si la sociedad es dominante de un
        grupo de SOCIMI, computando solo el parque en alquiler en territorio español.{' '}
        <Cite norma="rdl26" art="9.Uno.5" />
      </p>

      <div className="box">
        <strong>El umbral del 80 % no es plano.</strong>
        <p>
          La <b>disposición transitoria cuarta</b> de la Ley 11/2009 (añadida por el RDL 26/2026) lo
          modula: <b>más del 60 %</b> basta en los períodos impositivos iniciados dentro de{' '}
          <b>2026</b> que no hubieran finalizado a la entrada en vigor, y <b>más del 70 %</b> en los
          iniciados dentro de <b>2027</b>. En ambos años se sigue exigiendo, para la reducción del
          100 %, la reinversión del beneficio en el plazo de tres años.{' '}
          <Cite norma="rdl26" art="9.Dos" /> Quien diga «el 80 %» sin más está
          simplificando: en 2026 y 2027 los umbrales reales son otros dos.
        </p>
      </div>

      <p>
        <b>IIVTNU:</b> con efectos desde el 1 de diciembre de 2026, se fijan los importes máximos
        de los coeficientes aplicables sobre el valor del terreno en el momento del devengo, según
        el periodo de generación del incremento.{' '}
        <Cite norma="rdl26" art="10" />
      </p>

      <ScrollTable label="Coeficientes máximos del IIVTNU con efectos desde el 1 de diciembre de 2026">
        <table>
          <thead>
            <tr>
              <th scope="col">Periodo de generación</th>
              <th scope="col">Coeficiente máximo</th>
              <th scope="col">Periodo de generación</th>
              <th scope="col">Coeficiente máximo</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Inferior a 1 año', '0,17', '10 años', '0,22'],
              ['1 año', '0,16', '11 años', '0,18'],
              ['2 años', '0,16', '12 años', '0,14'],
              ['3 años', '0,17', '13 años', '0,12'],
              ['4 años', '0,17', '14 años', '0,11'],
              ['5 años', '0,19', '15 años', '0,11'],
              ['6 años', '0,21', '16 años', '0,11'],
              ['7 años', '0,23', '17 años', '0,11'],
              ['8 años', '0,24', '18 años', '0,13'],
              ['9 años', '0,25', '19 años', '0,20'],
              ['Igual o superior a 20 años', '0,30', '', ''],
            ].map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td>{row[1]}</td>
                <td>{row[2]}</td>
                <td>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollTable>

      <div className="box ac2">
        <strong>Si alquilas como turismo, mira los tres juntos.</strong>
        <p>
          La salida de la exención del IVA (art. 7 del RDL 26/2026), el recargo de IBI en zona
          tensionada (art. 8 del RDL 26/2026) y el agravamiento del gravamen SOCIMI aplicado al
          alquiler turístico y de corta duración (art. 9 del RDL 26/2026) <b>se refuerzan
          mutuamente</b>. Ninguno de los tres es el coste relevante por sí solo; juntos cambian la
          cuenta.{' '}
          <Link href="/desahucios-y-alquiler#titulo-v-regimen-sancionador-de-las-plataformas-de-corta-duracion">
            Y si eres una plataforma, el Título V de la LAU
          </Link>
          .
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
