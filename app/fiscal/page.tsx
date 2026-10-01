import type { Metadata } from 'next';
import Link from 'next/link';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Fiscalidad',
  description:
    'IRPF por alquiler de vivienda, IVA sobre estancias cortas, recargos de IBI por vivienda desocupada y alojamientos turísticos, y el gravamen especial de las SOCIMI.',
};

const REDUCCIONES = [
  {
    supuesto:
      'Nuevo contrato del mismo arrendador no gran tenedor con rebaja de renta superior al 5 %',
    reduccion:
      '100, 95, 90, 85 o 70 %, según continuidad del inquilino, renta por debajo del índice, zona tensionada y edad del arrendatario (entre 18 y 35 años)',
  },
  {
    supuesto: 'Nuevo contrato sin subir la renta anterior (o que no la exceda)',
    reduccion: '50 %',
  },
  {
    supuesto: 'Nuevo contrato con subida de renta',
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
        Nuevas reducciones en el IRPF por alquiler, IVA sobre estancias cortas, recargos de IBI
        por vivienda desocupada de forma permanente y por alojamientos turísticos, y el gravamen
        especial de las SOCIMI (Título II).
      </p>

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
        <b>incumplan el artículo 17.6 de la LAU</b>. Las zonas de mercado residencial tensionado a
        las que puede aplicarse son las de la resolución que apruebe el Ministerio de Vivienda y
        Agenda Urbana.{' '}
        <Cite norma="rdl26" art="6.Segundo.Dos" />
      </p>

      <p>
        El régimen transitorio distingue los contratos anteriores a la Ley 12/2023 —que conservan la
        reducción del artículo 23.2 LIRPF <i>en su redacción vigente a 31 de diciembre de
        2021</i>— de los celebrados entre la entrada en vigor de esa ley y el 1 de diciembre de
        2026, a los que se aplica la redacción vigente a 31 de diciembre de 2025. Con
        independencia de la fecha, la reducción del 80 % por prórroga tácita se aplica a los{' '}
        <b>contratos cuya prórroga se produzca después del 1 de diciembre de 2026</b>.{' '}
        <Cite norma="rdl26" art="6.Segundo.Catorce" />
      </p>

      <h3>Lo que cambia de verdad en el IRPF</h3>

      <div className="box warn">
        <strong>La deducción del 10 % por alquiler no es nueva.</strong>
        <p>
          Ya existía en el artículo 68 LIRPF. Lo que hace el decreto es <b>ampliar su efecto</b>: el
          nuevo apartado 6 del artículo 68 LIRPF crea la deducción —10 % de lo pagado, con base imponible
          inferior a 33.007,20 €; base máxima de 11.630 € hasta 23.007,20 € y decreciente entre
          ambas cifras; y sin otra vivienda a menos de 50 km salvo resolución judicial o
          administrativa que lo impida— y, sobre todo, modifica el{' '}
          <b>artículo 67.1 LIRPF</b> para que la cuota líquida estatal reste la{' '}
          <b>totalidad</b> de esa deducción.{' '}
          <Cite norma="rdl26" art="6.Segundo.Tres y Cuatro" /> Antes se restaba el 50 % de
          las deducciones de los apartados 2 a 5; con el nuevo apartado 6 la deducción del 10 %{' '}
          <b>se resta al 100 %</b>. Ese es el cambio, no la creación del beneficio.
        </p>
      </div>

      <h3>Otras medidas</h3>

      <ul>
        <li>
          <b>Exención por venta a entes públicos de vivienda social</b> (hasta el 31-12-2027):
          exenta del todo hasta 200.000 € de valor de transmisión y decreciente hasta 800.000 €.{' '}
          <Cite norma="lirpf" art="disposición adicional sexagésima quinta.1" /> Requiere que la
          vivienda haya permanecido <b>desocupada de forma continuada y sin causa justificada
          durante los dos años</b> anteriores a la transmisión —las causas justificadas son las que
          enumera el artículo 72.4 LRHL— y que la transmisión se realice una vez transcurridos{' '}
          <b>treinta días hábiles</b> desde la entrada en vigor del decreto.{' '}
          <Cite norma="rdl26" art="6.Segundo.Doce.1" />
        </li>
        <li>
          <b>Reinversión en la Cuenta de Ahorro e Inversión Financia Europa Reinversión:</b> la
          parte no exenta puede reinvertirse en el plazo de <b>seis meses</b> desde la transmisión,
          con un máximo acumulado de <b>800.000 €</b>. Si a la fecha de la transmisión no hubiera
          entrado en vigor la orden ministerial de información, el plazo de seis meses se computa
          desde la entrada en vigor de esa orden.{' '}
          <Cite norma="rdl26" art="6.Segundo.Doce.5" />
        </li>
        <li>
          <b>Imputación de rentas inmobiliarias</b> (desde el 1-1-2027): se aplica un 1,1 % hasta
          100.000 € de suma de valores catastrales, un 1,5 % al resto hasta 400.000 €, un 2 % al
          resto hasta 500.000 €, un 3 % al resto hasta 1.000.000 € y un 3 % en adelante. Si el
          inmueble careciera de valor catastral o no se hubiera notificado, se computa el 50 % del
          mayor valor verificado por la Administración o el precio de adquisición.{' '}
          <Cite norma="rdl26" art="6.Tercero.Dos" />
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
          por transmisión cuenta como habitual la vivienda de quienes tienen 65 años o más o
          están en situación de dependencia severa o gran dependencia y trasladan su residencia a
          un centro especializado o al domicilio de un familiar hasta tercer grado; y la del
          cónyuge que debe abandonar el domicilio por separación, divorcio o nulidad.{' '}
          <Cite norma="rdl26" art="disposición final tercera.Uno" />
        </li>
      </ul>

      <h2 id={slugify('Art. 7 (RDL 26/2026). IVA')}>Art. 7 (RDL 26/2026). IVA</h2>

      <ul>
        <li>
          <b>Sale de la exención</b> (con efectos desde el 1-12-2026) el arrendamiento de
          apartamentos o viviendas amueblados cuando el arrendador se obligue a prestar
          servicios complementarios propios de la industria hotelera —restaurante, limpieza, lavado
          de ropa— o cuando la duración a favor de un mismo arrendatario no supere las{' '}
          <b>30 noches</b>, salvo que la vivienda sea la residencia habitual del arrendador.{' '}
          <Cite norma="liva" art="20.Uno.23.e" /> Tributan al 10 %.{' '}
          <Cite norma="liva" art="91.Uno.2.2" />
        </li>
        <li>
          <b>Tipo del 10 % para obras de renovación y reparación</b> en edificios o partes de
          ellos destinados a vivienda, con requisitos: que el destinatario sea persona física sin
          condición de empresario o profesional para uso particular, o una comunidad de
          propietarios, o una vivienda destinada a arrendamiento como vivienda habitual cualquiera
          que sea la condición del arrendador; que la contraprestación se haya pagado con tarjeta,
          transferencia bancaria, cheque nominativo o ingreso en cuenta de entidad de crédito; y
          los demás requisitos de antigüedad y composición de materiales.{' '}
          <Cite norma="liva" art="91.Uno.2.10" />
        </li>
        <li>
          <b>Tipo superreducido</b> para viviendas protegidas de calificación permanente o
          indefinida, con hasta dos plazas de garaje, y para las viviendas que adquieran las
          entidades del régimen especial de arrendamiento de vivienda si a sus rentas se aplica la
          bonificación del artículo 49.1 de la Ley del Impuesto sobre Sociedades.
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
              <td rowSpan={4}>
                <b>Vivienda desocupada con carácter permanente</b>
                <br />
                <b>FUERA</b> de zona tensionada (art. 72.4 bis LRHL, párrafo primero)
              </td>
              <td>Hasta el 50 %</td>
              <td>
                Desocupación continuada y sin causa justificada <b>más de dos años</b>, y que los
                inmuebles pertenezcan a <b>titulares de cuatro o más</b> inmuebles de uso
                residencial.
              </td>
            </tr>
            <tr>
              <td>Hasta el 100 %</td>
              <td>
                El periodo de desocupación <b>supera los tres años</b>. Puede modularse según el
                tiempo de desocupación.
              </td>
            </tr>
            <tr>
              <td>
                Hasta <b>50 puntos porcentuales adicionales</b> sobre el anterior
              </td>
              <td>
                Que el inmueble pertenezca a titulares de <b>dos o más</b> inmuebles de uso
                residencial desocupados <b>en el mismo término municipal</b>.
              </td>
            </tr>
            <tr>
              <td>
                Mismos tramos que dentro de zona tensionada
              </td>
              <td>
                <b>DENTRO</b> de zona tensionada (art. 72.4 bis LRHL, párrafo segundo): hasta el
                50 % a
                los dos años; hasta el 100 % para titulares de cuatro o más inmuebles; y hasta 50
                puntos porcentuales adicionales si el periodo de desocupación supera los tres
                años <b>y</b> el titular tiene cuatro o más inmuebles.
              </td>
            </tr>
            <tr>
              <td rowSpan={3}>
                <b>Alojamiento de uso turístico</b> (art. 72.4 ter LRHL)
                <br />
                Solo en zona tensionada
              </td>
              <td>Hasta el 50 %</td>
              <td>Inmueble de uso residencial destinado a alojamiento turístico.</td>
            </tr>
            <tr>
              <td>Hasta el 100 %</td>
              <td>Titulares de <b>dos o más</b> inmuebles de uso residencial.</td>
            </tr>
            <tr>
              <td>Hasta el <b>150 %</b></td>
              <td>Titulares de <b>cuatro o más</b> inmuebles de uso residencial.</td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>

      <div className="box warn">
        <strong>Dos precisiones que el texto anterior mezclaba.</strong>
        <p>
          Primera: los tres tramos de la vivienda desocupada —50 %, 100 % por tres años y +50
          puntos— son <b>acumulables</b> y se sitúan <b>fuera</b> de zona tensionada; dentro de la
          zona, el tercer escalón exige además cuatro o más inmuebles del titular.{' '}
          <Cite norma="lrhl" art="72.4 bis" />
        </p>
        <p>
          Segunda: el <b>100 % por cuatro o más inmuebles</b> pertenece al régimen <b>de zona
          tensionada</b>. Fuera de ella, el disparador del 100 % no es el número de inmuebles sino{' '}
          <b>los tres años de desocupación</b>. Y el recargo por vivienda desocupada, en ambos
          regímenes, <b>exige ordenanza fiscal municipal</b>: es potestativo, no automático.
        </p>
      </div>

      <p>
        En ambos apartados se establece en todo caso un <b>catálogo de causas justificadas</b>{' '}
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
        hospedaje, fines turísticos o de corta duración</b>. Se devenga el día del acuerdo de
        aplicación del resultado por la junta general, y se autoliquida e ingresa en dos meses.{' '}
        <Cite norma="rdl26" art="9.Uno.1" />
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
          La <b>disposición transitoria cuarta</b> lo modula para los dos primeros años:{' '}
          <b>más del 60 %</b> basta en los períodos impositivos iniciados dentro de{' '}
          <b>2026</b>, y <b>más del 70 %</b> en los iniciados dentro de <b>2027</b>. En ambos
          años se sigue exigiendo, para la reducción del 100 %, el reintegro del beneficio en el
          plazo de tres años.{' '}
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
