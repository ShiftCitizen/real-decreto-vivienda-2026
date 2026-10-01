import type { Metadata } from 'next';
import Link from 'next/link';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Desahucios y alquiler',
  description:
    'Freno a la compra especulativa, suspensión de lanzamientos, enervación extraordinaria, reforma de la LAU, prórroga de cinco y siete años y régimen sancionador de las plataformas de corta duración.',
};

export default function DesahuciosPage() {
  return (
    <>
      <h1>Desahucios y alquiler</h1>
      <p className="lead">
        Freno a la compra especulativa, suspensión de lanzamientos hasta 2030, enervación
        extraordinaria, prórroga indefinida de cinco y siete años y reforma de la LAU, incluido
        un régimen sancionador nuevo para las plataformas de alquiler de corta duración.
      </p>

      <div className="box">
        <strong>Cómo está organizado esta página.</strong>
        <p>
          Las dos primeras secciones son el <span className="tono-rdl26">RDL 26/2026</span>. La
          sección «Coordinación» y las tres que la siguen son el{' '}
          <span className="tono-rdl27">RDL 27/2026</span> y el nuevo régimen sancionador, que
          no es del segundo decreto sino un Título V añadido a la LAU por el primero. Cada
          referencia lleva la etiqueta de su norma.
        </p>
      </div>

      <h2 id={slugify('Art. 1 (RDL 26/2026). Freno a la compra especulativa')}>
        Art. 1 (RDL 26/2026). Freno a la compra especulativa
      </h2>

      <p>
        Hasta el 31 de diciembre de 2028, toda entidad con o sin personalidad jurídica que
        incluya en su objeto social la adquisición de inmuebles tiene limitada la adquisición de
        una vivienda, a título gratuito u oneroso, por un precio inferior al 70 % de su valor de
        tasación de mercado. Afecta tanto a viviendas en estado de uso como a las de edificios
        construidos sobre suelo de calificación residencial que cumplan los requisitos para
        obtener la cédula de habitabilidad, desde que dispongan de certificado de fin de obra.{' '}
        <Cite norma="rdl26" art="1.1" />
      </p>

      <p>
        Quedan fuera las cinco finalidades del apartado 2: destino a vivienda habitual a precio
        asequible o social durante un plazo mínimo de cinco años; residencia de personas que
        precisen atención sociosanitaria; residencia de colectivos socialmente vulnerables por
        parte de entidades del tercer sector; protección de las víctimas de violencia de género,
        tanto de atención como residencial; y penetración del comprador que acredite su adhesión
        a un Código de Buenas Prácticas acordado con la autoridad competente en materia de
        vivienda.{' '}
        <Cite norma="rdl26" art="1.2" />
      </p>

      <p>
        Tampoco se aplica a las transmisiones elevadas a escritura pública antes de la entrada en
        vigor —aunque no estén inscritas, y sin que la escritura pueda modificarse después por
        adenda— ni a las adquisiciones que deriven de procedimientos de ejecución judicial o
        hipotecaria.{' '}
        <Cite norma="rdl26" art="1.3 y 4" /> Las exclusiones se resumen en el{' '}
        <Link href="/">resumen</Link>.
      </p>

      <h2 id={slugify('Art. 2 (RDL 26/2026). Suspensión de desahucios hasta el 31-12-2030')}>
        Art. 2 (RDL 26/2026). Suspensión de desahucios hasta el 31-12-2030
      </h2>

      <h3>Apartado 1: demandante especulativo</h3>

      <p>
        Si el demandante es una entidad con o sin personalidad jurídica dedicada a adquirir
        inmuebles o carteras de préstamo hipotecario impagados por un precio claramente inferior
        al de su tasación de mercado, con el objeto de eludir los mecanismos de función social de
        la vivienda o maximizar su rentabilidad, y el demandado se encuentra en situación de
        vulnerabilidad y sin alternativa habitacional, el tribunal suspende el proceso por auto.
        La suspensión también es aplicable cuando ya se hubiera dictado sentencia o auto
        acordando el lanzamiento, siempre que este no se hubiera ejecutado efectivamente.{' '}
        <Cite norma="rdl26" art="2.1" /> Quedan excluidos los entes públicos y las
        empresas o sociedades del sector públicas cuya finalidad sea la promoción y gestión de
        vivienda social y asequible.
      </p>

      <h3>Apartado 2: resto de demandantes</h3>

      <p>
        Solo si no opera la enervación extraordinaria del{' '}
        <Cite norma="rdl26" art="5.Dos" />. <Cite norma="rdl26" art="2.2" /> Si el demandado es vulnerable y no tiene
        alternativa habitacional, y la administración competente no ha ofrecido una alternativa
        digna y adecuada, el tribunal requiere informe a la administración competente para que
        exprese qué recursos tiene disponibles y los ofrezca. Si no hay respuesta o se informa de
        que no se cuenta con ellos, el tribunal suspende el proceso —también si ya se hubiera
        dictado sentencia o acordado el lanzamiento sin que se ejecutara— hasta que se adopte la
        medida y se garantice una alternativa adecuada.
      </p>

      <p>
        La suspensión se revisa cada doce meses y se alza cuando desaparezca la vulnerabilidad, se
        ponga a disposición una alternativa adecuada y efectiva o el demandado la rechace sin causa
        justificada previa audiencia, o transcurran tres años desde que se acordó.
      </p>

      <p>
        El tribunal determina además que la administración competente asumirá los gastos necesarios
        para la compensación a favor del demandante, sea persona física o persona jurídica
        dedicada al alquiler habitual asequible o social, que comprenderá como máximo la renta
        contractual dejada de percibir y los costes de suministros impagados. No son compensables
        el lucro cesante hipotético ni los daños morales; la demora en el pago genera los
        intereses correspondientes.{' '}
        <Cite norma="rdl26" art="2.2" />
      </p>

      <div className="box warn">
        <strong>Dos límites que se confunden con frecuencia.</strong>
        <p>
          El primero:{' '}
          <b>la suspensión no cancela la deuda de renta.</b> El precepto lo dice expresamente:
          «La suspensión o la compensación no supondrán la desaparición de la obligación de
          mantenerse al corriente de la renta debida». Seguir pagando es condición para que la
          suspensión siga sirviendo de algo.
        </p>
        <p>
          El segundo es la causa más malentendida de todo el decreto.{' '}
          <b>Un demandante persona física con dos o menos viviendas es el caso en el que la
          suspensión procede, no el caso en el que se pierde.</b> El artículo 2.2 del RDL 26/2026
          termina así:
          «Tampoco prevalecerá la situación de vulnerabilidad económica de la parte demandada
          cuando la parte demandante sea una persona física titular de dos o menos viviendas».
          Es decir, cuando el dueño es una persona física con pocas viviendas,{' '}
          <i>no</i> se le antepone su propia vulnerabilidad económica a la del inquilino,{' '}
          <i>sino</i> que la del inquilino prevalece y el proceso se suspende. La frase no dice que
          no procede la suspensión; dice que, para ese propietario, no puede oponer su vulnerabilidad
          para impedirla.{' '}
          <Cite norma="rdl26" art="2.2" /> La suspensión no procede
          solo cuando el tribunal aprecie que debe prevalecer la vulnerabilidad del demandante{' '}
          <i>salvo</i> que se trate de una persona jurídica o de una persona física que tenga la
          condición de gran tenedor.
        </p>
      </div>

      <h2 id={slugify('Enervación extraordinaria (art. 5 RDL 26/2026; nuevo art. 22.6 LEC)')}>
        Enervación extraordinaria (art. 5 RDL 26/2026; nuevo art. 22.6 LEC)
      </h2>

      <ul>
        <li>
          Acreditada la vulnerabilidad, se comunica a la administración, que dispone de un plazo
          máximo <b>e improrrogable</b> de dos meses desde la notificación para ofrecer una
          alternativa habitacional adecuada o, en su defecto, pagar o consignar la totalidad de lo
          reclamado. Durante ese plazo quedan suspendidos el procedimiento y el lanzamiento.
        </li>
        <li>
          Efectuado el pago o la consignación, se declara enervada la acción y terminado el
          procedimiento, manteniéndose vigente el contrato de arrendamiento.
        </li>
        <li>
          Transcurrido el plazo sin que se haya hecho ninguna de las dos cosas, la administración
          queda <b>subrogada automáticamente en la posición deudora del arrendatario</b>: no hay
          lugar para el lanzamiento y el contrato se mantiene vigente hasta su expiración en
          tanto se mantenga la vulnerabilidad.
        </li>
        <li>
          Esta enervación es independiente de la ordinaria del apartado 4, no computa como
          enervación anterior a sus efectos ni impide ejercerla después; y puede producirse{' '}
          <i>aunque el arrendador ya haya hecho el requerimiento fehaciente de pago</i>. La
          Administración General del Estado compensa los gastos en que incurran las comunidades
          autónomas, salvo los intereses por retraso.
        </li>
      </ul>

      <div className="box warn">
        <strong>Preámbulo y articulado no coinciden.</strong>
        <p>
          El preámbulo describe la consecuencia del incumplimiento de otro modo que el texto del
          artículo 22.6 LEC. Este análisis sigue el articulado, que es el que establece la
          subrogación automática y la ausencia de lanzamiento.
        </p>
      </div>

      <p>
        El apartado uno del <Cite norma="rdl26" art="5" /> añade además que la demanda de
        ejecución hipotecaria debe
        indicar si el inmueble es vivienda habitual del deudor y si el ejecutante tiene la
        condición de gran tenedora de vivienda; si dice que no la tiene, hay que acompañar
        certificación registral con la relación de viviendas a su nombre.{' '}
        <Cite norma="lec" art="685.2" /> La disposición transitoria segunda del RDL 26/2026 aplica
        los artículos 2 y 5.Dos a las ejecuciones en curso en la fecha de entrada en vigor siempre
        que no se
        hubiera practicado el lanzamiento, y permite a la persona ejecutada pedirlo aunque el
        trámite ya se hubiera resuelto o se hubiera agotado el plazo máximo de suspensión.{' '}
        <Cite norma="rdl26" art="disposición transitoria segunda" />
      </p>

      <h2 id={slugify('Art. 3 (RDL 26/2026). Reforma de la LAU')}>
        Art. 3 (RDL 26/2026). Reforma de la LAU
      </h2>

      <p>
        El artículo 3 modifica veinte puntos de la Ley de Arrendamientos Urbanos. Estos son los
        que cambian la respuesta a una pregunta práctica.
      </p>

      <h3>Vivienda temporal</h3>

      <ul>
        <li>
          Es el arrendamiento que cubre la necesidad de vivienda de alguien{' '}
          <i>temporalmente desplazado de su domicilio habitual por causa justificada y
          acreditable</i>. El contrato debe prever esa causa de forma expresa, y{' '}
          <b>la carga de probar que existe es del arrendador</b>. Si no se prevé, el contrato{' '}
          <i>pierde</i> su naturaleza temporal y queda sujeto al título II{' '}
          <i>con efectos retroactivos a su formalización</i>.{' '}
          <Cite norma="lau" art="7.2" />
        </li>
        <li>
          La duración se pacta libremente, debiendo superar los 31 días y no exceder, en general,
          de 12 meses. Si se pactó menos y sigue existiendo el motivo, puede prorrogarse por
          acuerdo expreso sin superar nunca 12 meses en conjunto, salvo que la causa de
          temporalidad subsista.
        </li>
        <li>
          Si el contrato supera los 12 meses sin justificación de la causa, o se renuevan o{' '}
          <b>suceden más de dos contratos temporales consecutivos</b> entre las mismas partes y
          sobre la misma vivienda, <b>el primero se entiende celebrado como contrato de vivienda
          habitual</b>, con su plazo mínimo y su régimen de prórrogas.{' '}
          <Cite norma="lau" art="9 bis.2" />
        </li>
      </ul>

      <h3>Habitaciones y estancias</h3>

      <ul>
        <li>
          El arrendamiento parcial de una habitación o estancia{' '}
          <b>es arrendamiento de vivienda</b> a todos los efectos del título II, siempre que su
          destino primordial sea satisfacer la necesidad de vivienda del arrendatario.{' '}
          <Cite norma="lau" art="2.1" />
        </li>
        <li>
          La suma de las rentas de los contratos parciales vigentes de forma simultánea{' '}
          <b>no puede exceder</b> del importe de la renta del contrato unitario de la vivienda
          completa; y si la vivienda está en zona tensionada, ese importe debe respetar en todo caso
          los límites de los apartados 6, 7 y 8 del artículo 17 de la LAU.{' '}
          <Cite norma="lau" art="17.9" />
        </li>
      </ul>

      <h3>Rentas y límites en zona tensionada</h3>

      <ul>
        <li>
          En zona de mercado residencial tensionado, la renta del nuevo contrato no puede exceder
          de la última renta vigente en los últimos cinco años en la misma vivienda, una vez
          aplicada la cláusula de actualización del contrato anterior. Solo puede incrementarse,
          como máximo un 10 % sobre esa renta, si se acredita rehabilitación terminada en los dos
          años anteriores, ahorro de energía primaria no renovable del 30 %, mejora de la
          accesibilidad o un contrato de diez o más años —o con prórroga potestativa del
          inquilino— que garantice esa permanencia.{' '}
          <Cite norma="lau" art="17.6" />
        </li>
        <li>
          Si el arrendador{' '}
          <b>es gran tenedor</b>, la renta no puede exceder del límite máximo del precio aplicable
          conforme al sistema de índices de precios de referencia, sin que puedan fijarse nuevas
          condiciones que supongan superejar ese límite. Ese mismo límite se aplica a los
          contratos sobre inmuebles sin contrato vigente en los últimos cinco años cuando así lo
          recoja la resolución del Ministerio.{' '}
          <Cite norma="lau" art="17.7" />
        </li>
        <li>
          En contratos temporales sucesivos sobre la misma vivienda, la renta de los posteriores{' '}
          <b>no puede subir más que el IRAV</b> del año.{' '}
          <Cite norma="lau" art="17.8" />
        </li>
      </ul>

      <h3>Gastos, reparaciones y garantías</h3>

      <ul>
        <li>
          <b>Prohibición de repercutir gastos de gestión:</b> los gastos de gestión inmobiliaria y
          de formalización del contrato <b>no pueden repercutirse al arrendatario ni directa ni
          indirectamente</b>, bajo ningún concepto o denominación. Cualquier otro servicio no
          esencial solo puede cargársele si el arrendatario lo ha solicitado de manera expresa por
          escrito, habiendo sido informado de su carácter opcional y de su coste.{' '}
          <Cite norma="lau" art="20.2" />
        </li>
        <li>
          Cuando existan daños que afecten a la habitabilidad, la seguridad o la salubridad, el
          arrendatario puede exigir por escrito la reparación <b>adjuntando un presupuesto
          razonable</b>. El arrendador tiene <b>quince días naturales</b> para aceptarlo, proponer
          una reparación alternativa o ejecutarla directamente. Transcurrido el plazo sin
          respuesta, o ante negativa injustificada, el arrendatario puede ejecutar las obras{' '}
          <b>y descontar su importe de las rentas futuras</b>.{' '}
          <Cite norma="lau" art="21.5" />
        </li>
        <li>
          <b>Prohibición de los seguros de impago de renta.</b> Aunque las partes pacten una
          garantía adicional a la fianza, «en ningún caso podrá exigirse al arrendatario la
          contratación de seguros de impago de renta u otras coberturas análogas»; su valor no
          podrá exceder de dos mensualidades (una, en arrendamientos temporales).{' '}
          <Cite norma="lau" art="36.5" />
        </li>
        <li>
          Al finalizar el contrato hay que dejar constancia por escrito del estado de la vivienda
          mediante un{' '}
          <b>documento de finalización firmado por ambas partes</b>; si no se suscribe o no
          refleja ningún desperfecto, se presume que la vivienda se entregó en estado adecuado.{' '}
          <Cite norma="lau" art="36.7" />
        </li>
      </ul>

      <h3>Derecho de adquisición preferente</h3>

      <ul>
        <li>
          El tanteo se ejerce en <b>treinta días naturales</b> desde la notificación fehaciente de
          la decisión de vender, el precio y las demás condiciones esenciales; y{' '}
          <b>los efectos de esa notificación caducan a los ciento ochenta días</b> naturales.{' '}
          <Cite norma="lau" art="25.2" />
        </li>
        <li>
          Cuando la venta recaiga además sobre los objetos alquilados como accesorios por el
          mismo arrendador, el arrendatario{' '}
          <b>no puede ejercer los derechos solo sobre la vivienda</b>.{' '}
          <Cite norma="lau" art="25.6" />
        </li>
        <li>
          En la venta conjunta, el precio imputable a la vivienda arrendada se obtiene por
          distribución proporcional del precio global conforme a{' '}
          <b>criterios objetivos y verificables</b>, atendiendo preferentemente al valor de
          referencia catastral o, en su defecto, a tasación independiente; las asignaciones hechas
          para impedir u obstaculizar el derecho son ineficaces.{' '}
          <Cite norma="lau" art="25.7" />
        </li>
        <li>
          Las partes <b>no pueden pactar la renuncia</b> del arrendatario al derecho de
          adquisición preferente.{' '}
          <Cite norma="lau" art="25.8" />
        </li>
      </ul>

      <h3>Formalización y régimen transitorio</h3>

      <ul>
        <li>
          <b>A instancia del arrendatario la formalización por escrito es obligatoria</b>. Su
          incumplimiento no afecta a la validez ni a la eficacia del contrato verbalmente
          celebrado, sin perjuicio de las responsabilidades administrativas sectoriales.{' '}
          <Cite norma="lau" art="37.2" />
        </li>
        <li>
          Los contratos de temporada, vivienda temporal y similares{' '}
          <b>celebrados antes del 1 de octubre de 2026</b> conservan su consideración de
          arrendamiento de uso distinto del de vivienda y se rigen por el régimen que les era
          aplicable hasta el vencimiento del plazo pactado, y entonces quedan extinguidos sin
          posibilidad de prórroga. El temporal renovado sí se rige por el régimen nuevo.{' '}
          <Cite norma="lau" art="disposición transitoria octava" />
        </li>
        <li>
          Las disposiciones sobre temporada y habitaciones, y el conjunto del título, se entienden{' '}
          <b>sin perjuicio de los derechos civiles forales o especiales</b> (Cataluña) y de las
          competencias autonómicas en vivienda; en particular, de las normas autonómicas sobre
          vivienda temporal y habitaciones.{' '}
          <Cite norma="lau" art="disposición adicional duodécima" />
        </li>
      </ul>

      <h2 id={slugify('Art. 4 (RDL 26/2026). Ley 12/2023')}>Art. 4 (RDL 26/2026). Ley 12/2023</h2>

      <p>
        El <Cite norma="rdl26" art="4" /> modifica la definición de gran tenedor del artículo
        3.k){' '}
        <Cite norma="l123" art="3.k" /> Los umbrales no cambian: más de diez inmuebles urbanos de
        uso residencial, o más de 1.500 m² construidos de uso residencial, excluyendo en todo caso
        garajes y trasteros. La condición se acredita mediante certificación del Registro de la
        Propiedad.
      </p>

      <p>
        La reforma <b>sí añade un criterio que puede cambiar el resultado</b>: cuando una finca
        registral comprende un edificio compuesto por varias unidades susceptibles de uso
        residencial, cada una de ellas constituye un inmueble independiente a efectos de cómputo,{' '}
        <b>con independencia de que no exista división horizontal inscrita</b>. Para quien cuente
        inmuebles —un propietario, un pequeño promotor, una entidad— este detalle decide si se cruza el
        umbral o no. La definición puede además particularizarse en la declaración de entorno de
        mercado residencial tensionado hasta los titulares de cinco o más inmuebles, cuando así lo
        motive la comunidad autónoma en su memoria justificativa.{' '}
        <Cite norma="rdl26" art="4.Uno" />
      </p>

      <h2 id={slugify('DF 5.ª y DF 6.ª')}>DF 5.ª y DF 6.ª</h2>

      <p>
        <b>Prórroga extraordinaria (DF 5.ª):</b> para los contratos vigentes a la entrada en vigor
        en los que el periodo de prórroga obligatoria del artículo 9.1 de la LAU, el de la prórroga
        tácita de los apartados 10.1 y 10.2 de la LAU en su redacción anterior, o el de la tácita
        reconducción del artículo 1566 del Código Civil <b>finalice antes del 31 de diciembre de
        2028</b>,{' '}
        <b>previa solicitud del arrendatario</b> y siempre que este se encuentre al corriente de
        pago y{' '}
        <b>lo haya estado mensualmente durante los ocho meses anteriores</b>, se aplica una
        prórroga extraordinaria por plazos anuales y hasta un máximo de dos años adicionales,
        manteniendo los términos del contrato.{' '}
        <Cite norma="rdl26" art="disposición final quinta.1" />
      </p>

      <div className="box warn">
        <strong>Los ocho meses no son un plazo para pedir la prórroga.</strong>
        <p>
          Es fácil leerlo al revés. El precepto dice «siempre y cuando la parte arrendataria se
          encuentre al corriente de pago del alquiler, y lo haya estado mensualmente durante los
          ocho meses anteriores»: es un <b>requisito de historial de pagos</b>, la puerta de
          entrada. <b>El decreto no fija ningún plazo para solicitar la prórroga</b> ni exige que la
          solicitud se formule en los ocho meses siguientes a la fecha en que termina la prórroga
          original. Lo que sí hace el decreto es condicionar la extensión a que el arrendador la
          acepte obligatoriamente salvo que haya otros términos pactados, se haya suscrito un
          contrato nuevo, o el arrendador haya comunicado la necesidad de ocupar la vivienda en
          los plazos y condiciones del artículo 9.3 LEC —con causa real y acreditada—.
        </p>
        <p>
          Y hay una incompatibilidad que la página anterior no recogía:{' '}
          <b>esta prórroga extraordinaria es incompatible con la del artículo 10.3 de la LAU, que se
          aplicará con carácter preferente</b>. Es decir, si el caso encaja en la prórroga voluntaria
          del artículo 10.3 de la LAU, mandan los dos años de la DF 5.ª.{' '}
          <Cite norma="rdl26" art="disposición final quinta.1" />
        </p>
        <p>
          No procede cuando arrendador y arrendatario acuerden renovar o celebrar un contrato
          nuevo con una renta inferior al menos un 5 % a la del contrato vigente.{' '}
          <Cite norma="rdl26" art="disposición final quinta.2" />
        </p>
      </div>

      <p>
        <b>Actualización de rentas (DF 6.ª):</b> hasta el 31 de diciembre de 2027, el
        arrendatario puede negociar con el arrendador la actualización anual de la renta. Si la
        renta es superior al límite máximo del precio aplicable conforme al sistema de índices de
        precios de referencia,{' '}
        <b>no procederá incremento alguno</b>; en los demás casos, el incremento será el del nuevo
        pacto entre las partes y, en ausencia de pacto, <b>no podrá superar el 2 %</b>.{' '}
        <Cite norma="rdl26" art="disposición final sexta" />
      </p>

      <h2 id="coordinacion">Coordinación: el RDL 27/2026 y la prórroga indefinida</h2>

      <p className="lead">
        Esta sección y las tres siguientes son del <span className="tono-rdl27">RDL 27/2026</span>,
        que solo modifica el artículo 10 de la LAU. Su disposición adicional primera fija cómo
        convive con la prórroga extraordinaria del RDL 26/2026.
      </p>

      <h3 id={slugify('Prórroga indefinida e indemnización')}>Prórroga indefinida e indemnización</h3>

      <p>
        Los contratos de vivienda habitual, incluidas las prórrogas voluntarias o convencionales y las
        reguladas por ley, <b>se prorrogan obligatoriamente por plazos sucesivos de cinco años</b>,{' '}
        <b>o de siete si el arrendador es persona jurídica</b>, una vez transcurridos como mínimo
        cinco años de duración —siete en el caso de persona jurídica— y siempre que ninguna de
        las partes haya notificado su voluntad de no renovar: el arrendador con{' '}
        <b>seis meses de antelación</b> y el arrendatario con dos meses.{' '}
        <Cite norma="rdl27" label="artículo" art="único.1" />
      </p>

      <p>
        Cuando el arrendador comunique válidamente su voluntad de no prorrogar,{' '}
        <b>viene obligado a indemnizar al arrendatario con una cantidad equivalente, al menos, al
        importe de doce mensualidades</b> de renta de una vivienda de análogas características a
        la arrendada. El cálculo se hace, siempre que sea posible, con base en el{' '}
        <b>sistema estatal de referencia de precios de alquiler</b>, y nunca por debajo de{' '}
        <b>una mensualidad por cada año que el arrendatario haya residido</b> en la vivienda,
        prorrateándose por meses y por días. La indemnización se abona en el momento de la entrega
        de la vivienda. La enajenación de la vivienda arrendada no afecta a este derecho, que
        corresponderá al adquirente que se subrogue en la posición del arrendador.{' '}
        <Cite norma="lau" art="10.1" />
      </p>

      <p>
        <b>No procede la indemnización</b> cuando, respecto del vencimiento de que se trate, el
        arrendatario reúna los requisitos para obtener <b>a su solicitud</b> una prórroga legal de
        aceptación obligatoria para el arrendador,{' '}
        <b>aunque no la hubiera solicitado</b>. Tampoco procede en los seis casos del apartado 2,
        que deben hacerse constar de forma expresa, detallada y por escrito en la notificación de
        preaviso:{' '}
        <Cite norma="lau" art="10.2" />
      </p>

      <ScrollTable label="Casos en que no procede la indemnización por no renovación">
        <table>
          <thead>
            <tr>
              <th scope="col">Causa de exclusión</th>
              <th scope="col">Qué exige</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Necesidad de la vivienda (a)</td>
              <td>
                Que el arrendador, siendo persona física, la necesite para vivienda permanente
                para sí o para familiares de segundo grado de consanguinidad o por adopción, o
                para su cónyuge en caso de sentencia firme de separación, divorcio o nulidad. Si
                transcurridos tres meses desde la entrega no la han ocupado, el arrendatario
                tiene derecho a la indemnización, exigible desde ese momento.
              </td>
            </tr>
            <tr>
              <td>No ocupación (b)</td>
              <td>
                No haber habitado la vivienda más de seis meses en los doce anteriores a la
                notificación, salvo causa justificada (salud, trabajo, estudios o cuidado de
                familiares) o que sigan habitándola las personas del artículo 7.1 LAU.
              </td>
            </tr>
            <tr>
              <td>Otra vivienda apta (c)</td>
              <td>
                Disponer, en la fecha de la notificación y en el mismo municipio, de otra vivienda
                apta como titular del pleno dominio o de un derecho real de uso o disfrute que
                pueda ocupar.
              </td>
            </tr>
            <tr>
              <td>Contrato nuevo (d)</td>
              <td>Que las partes suscriban un nuevo contrato de arrendamiento de vivienda habitual.</td>
            </tr>
            <tr>
              <td>Rechazo de oferta (e)</td>
              <td>
                Rechazo expreso o tácito de una oferta fehaciente de formalización de un contrato
                nuevo sobre la misma vivienda, formulada dentro del plazo de preaviso.{' '}
                <b>Para que esta causa sea aplicable</b>, la oferta debe garantizar la permanencia
                del arrendatario <b>al menos cinco años</b> (o siete si el arrendador es persona
                jurídica) <b>y</b> el importe económico total de la nueva renta mensual debe
                ajustarse a las reglas del artículo 17.6 LAU{' '}
                <b>incluso cuando el inmueble no esté en zona tensionada</b>.
              </td>
            </tr>
            <tr>
              <td>Otra causa justificada (f)</td>
              <td>
                Que concurra otra circunstancia debidamente justificada que, en el caso concreto,
                determine la prevalencia de los intereses del arrendador{' '}
                <b>cuando este tenga vulnerabilidad acreditada</b>.
              </td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>

      <p>
        Además, dos reglas que suelen pasarse por alto: una prórroga voluntaria o convencional
        acordada <b>después</b> de que el arrendador haya dicho que no renueva <b>no puede ser
        inferior</b> a los plazos del apartado primero ({' '}
        <Cite norma="lau" art="10.3" />), y son <b>nulas y se tienen por no puestas</b> las
        estipulaciones de los acuerdos de prórroga que modifiquen las condiciones del contrato
        original en perjuicio del arrendatario ({' '}
        <Cite norma="lau" art="10.4" />).
      </p>

      <h3 id={slugify('Prórrogas extraordinarias: art. 10.5 y 10.6 de la LAU')}>
        Prórrogas extraordinarias: art. 10.5 y 10.6 de la LAU
      </h3>

      <p>
        Son dos mecanismos nuevos, y la diferencia entre ellos decide a quién
        favorece la prórroga.
      </p>

      <ScrollTable label="Comparación de las dos prórrogas extraordinarias del artículo 10">
        <table>
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Art. 10.5 LAU — vulnerabilidad</th>
              <th scope="col">Art. 10.6 LAU — zona tensionada</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Requisito</td>
              <td>
                Que el contrato hubiera de extinguirse por no renovación válida del arrendador.
              </td>
              <td>El mismo, más que el inmueble esté en zona tensionada declarada.</td>
            </tr>
            <tr>
              <td>Duración</td>
              <td>Un año, como máximo.</td>
              <td>Por plazos anuales, hasta tres años.</td>
            </tr>
            <tr>
              <td>Acreditación</td>
              <td>
                Informe o certificado de servicios sociales (municipal o autonómico) emitido{' '}
                <b>en el último año</b> que acredite vulnerabilidad social y económica.
              </td>
              <td>La mera ubicación en zona de mercado residencial tensionado.</td>
            </tr>
            <tr>
              <td>Obligatoriedad de aceptación</td>
              <td>
                <b>Solo cuando el arrendador sea gran tenedor</b> (art. 3.k Ley 12/2023), y salvo
                que se hubiera suscrito un contrato nuevo.
              </td>
              <td>
                Siempre, salvo que: se hayan fijado otros términos por acuerdo, se haya suscrito
                contrato nuevo con las limitaciones de renta que procedan, o el arrendador haya
                comunicado la necesidad de ocupar la vivienda en los plazos del artículo 9.3 LAU.
              </td>
            </tr>
            <tr>
              <td>Acumulación</td>
              <td>
                No acumulable con otras prórrogas extraordinarias de rango legal; el arrendatario
                puede optar por la más favorable.
              </td>
              <td>
                <b>Incompatible</b> con otras prórrogas extraordinarias de rango legal y{' '}
                <b>se aplica con carácter preferente</b>.
              </td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>

      <p>
        <Cite norma="lau" art="10.5" /> <Cite norma="lau" art="10.6" />
      </p>

      <h3 id={slugify('DA 1.ª: coordinación con la DF 5.ª')}>
        DA 1.ª: coordinación con la DF 5.ª
      </h3>

      <p>
        La disposición adicional primera del RDL 27/2026 fija, en tres apartados, cómo convive la
        nueva prórroga con la prórroga extraordinaria de la DF 5.ª del RDL 26/2026:
      </p>

      <ol>
        <li>
          La prórroga extraordinaria de la DF 5.ª del RDL 26/2026{' '}
          <b>no será de aplicación cuando proceda la prórroga del artículo 10.1 LAU</b> en su
          redacción actual. Donde encaje la prórroga indefinida de cinco o siete años, esa manda: la
          prórroga extraordinaria de dos años de la DF 5.ª queda desplazada.
        </li>
        <li>
          Cuando la prórroga extraordinaria de la DF 5.ª se aplique a un contrato respecto del cual
          el arrendador ya hubiera comunicado válidamente su voluntad de no prorrogarlo, el contrato
          <b>se extinguirá al finalizar dicha prórroga extraordinaria</b>, salvo que las partes
          acuerden su prórroga conforme a los apartados 3 y 4 del artículo 10 LAU o suscriban un
          contrato nuevo. Y la extinción por voluntad del arrendador sin causa del apartado 2
          devengará en favor del arrendatario{' '}
          <b>el derecho a indemnización del artículo 10.1 de la LAU</b>.
        </li>
        <li>
          A efectos de la DF 5.ª, las referencias a los apartados primero y segundo del artículo 10
          LAU sobre la finalización de los periodos de prórroga se entienden realizadas{' '}
          <b>en su redacción inmediatamente anterior</b> a la entrada en vigor del RDL 27/2026; y
          la referencia al apartado tercero, sobre la incompatibilidad entre prórrogas, se
          entiende hecha al <b>apartado sexto</b> del mismo artículo en la redacción dada por este
          decreto.
        </li>
      </ol>

      <p>
        En la práctica: donde proceda el artículo 10.1 LAU en la redacción del RDL 27/2026, rige la
        renovación indefinida de cinco o siete años —con su indemnización de doce mensualidades— y
        no la prórroga extraordinaria de dos años de la DF 5.ª del RDL 26/2026.
      </p>

      <h3 id={slugify('DT única: qué contratos quedan dentro')}>
        DT única: qué contratos quedan dentro
      </h3>

      <ul>
        <li>
          La nueva prórroga se aplica a los contratos de vivienda habitual{' '}
          <b>vigentes el 2 de octubre de 2026</b>, respecto de los vencimientos del contrato o de
          cualquiera de sus prórrogas que se produzcan después de esa fecha.{' '}
          <Cite norma="rdl27" art="disposición transitoria única.1" />
        </li>
        <li>
          Si quedaban <b>menos de seis meses</b> para el vencimiento, el preaviso del arrendador
          puede hacerse con una antelación mínima de <b>cuatro meses</b> en lugar de seis.{' '}
          <Cite norma="rdl27" art="disposición transitoria única.2" />
        </li>
        <li>
          Los contratos que ya estaban en el periodo de prórroga del artículo 10.1 de la LAU{' '}
          <b>anterior</b> continúan en él hasta su término, y solo a su término se les aplica el
          régimen nuevo.{' '}
          <Cite norma="rdl27" art="disposición transitoria única.3" />
        </li>
        <li>
          La remisión al artículo 10 LAU contenida en la disposición transitoria cuarta.1 de la Ley
          12/2023 (en la redacción dada por el artículo 4.Dos del RDL 26/2026) se entiende
          realizada al artículo 10 en la redacción del RDL 27/2026,{' '}
          <b>sin perjuicio del régimen transitorio</b> para los contratos vigentes y para las
          comunicaciones de no renovación hechas antes del 2 de octubre.{' '}
          <Cite norma="rdl27" art="disposición transitoria única.4" />
        </li>
        <li>
          Los contratos en <b>tácita reconducción</b> del artículo 1566 del Código Civil quedan
          sujetos al artículo 10 a partir del primer vencimiento que se produzca una vez
          transcurridos <b>cuatro meses</b> desde la entrada en vigor; hasta entonces se rigen, en
          cuanto a su duración, por los artículos 1566 y 1581 del Código Civil. Para el requisito
          de duración mínima del artículo 10.1 de la LAU{' '}
          <b>se computa conjuntamente</b> el tiempo desde el contrato originario y el transcurrido
          en reconducción. Las comunicaciones para poner fin a la reconducción{' '}
          <b>hechas válidamente antes del 2 de octubre conservan su eficacia y no generan
          indemnización</b>.{' '}
          <Cite norma="rdl27" art="disposición transitoria única.5" />
        </li>
      </ul>

      <p>
        También del RDL 27/2026: la disposición adicional segunda, que manda que{' '}
        <b>salvo la coordinación específica de la DA 1.ª</b>, las referencias que otras normas
        hagan a los apartados 2 y 3 del artículo 10 LAU en su redacción anterior se entiendan{' '}
        <b>hechas a los apartados quinto y sexto</b>, respectivamente ({' '}
        <Cite norma="rdl27" art="disposición adicional segunda" />); y la disposición final
        primera, que ancla el decreto en el{' '}
        <b>artículo 149.1.8.ª de la CE</b> en materia de legislación civil, sin perjuicio de los derechos
        civiles forales o especiales y de las bases de las obligaciones contractuales ({' '}
        <Cite norma="ce" art="149.1.8" /> <Cite norma="rdl27" art="disposición final primera" />).
        Entra en vigor el día siguiente al de su publicación, esto es, el 2 de octubre de 2026({' '}
        <Cite norma="rdl27" art="disposición final segunda" />).
      </p>

      <h2 id={slugify('Título V: régimen sancionador de las plataformas de corta duración')}>
        Título V: régimen sancionador de las plataformas de corta duración
      </h2>

      <p className="lead">
        El RDL 26/2026 añade un Título V entero a la LAU (artículos 38 a 51) para sancionar a las{' '}
        <b>plataformas en línea de alquiler de corta duración</b> por el incumplimiento de las
        obligaciones de suministro e intercambio de datos previstas en el Reglamento (UE)
        2024/1028 ante la Ventanilla Única Digital de Arrendamientos. Es la parte del decreto que
        más afecta a un platform o un gestor de alquileres, y antes no estaba aquí.
      </p>

      <h3>Quién responde y de qué</h3>

      <p>
        Los sujetos responsables son las plataformas en línea de alquiler de corta duración que
        incurran en las infracciones tipificadas en el Reglamento (UE) 2024/1028.{' '}
        <Cite norma="lau" art="38" /> Esto es <b>sin perjuicio</b> de las competencias
        regulatorias de las comunidades autónomas en vivienda, turismo, consumo o urbanismo, y de
        las de las administraciones públicas para inspeccionar y sancionar la oferta, publicidad,
        intermediación, formalización o ejecución de esos contratos.{' '}
        <Cite norma="lau" art="38.1" />
      </p>

      <h3>Tipos de infracción</h3>

      <ScrollTable label="Infracciones y sanciones del Título V de la LAU">
        <table>
          <thead>
            <tr>
              <th scope="col">Gravedad</th>
              <th scope="col">Conducta</th>
              <th scope="col">Multa base</th>
              <th scope="col">Prescripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Muy grave</td>
              <td>
                No llevar a cabo la recogida y transmisión <b>mensual o trimestral</b> de los datos
                a la Ventanilla Única Digital de Arrendamientos, cuando la obligación del artículo 9
                del Reglamento (UE) 2024/1028 resulte de aplicación.{' '}
                <Cite norma="lau" art="40" />
              </td>
              <td>1.000.000 €</td>
              <td>5 años</td>
            </tr>
            <tr>
              <td>Grave</td>
              <td>
                Haber hecho la recogida y transmisión, pero con datos <b>incompletos o no
                exactos</b>.{' '}
                <Cite norma="lau" art="41" />
              </td>
              <td>500.000 €</td>
              <td>3 años</td>
            </tr>
            <tr>
              <td>Leve (a)</td>
              <td>
                <b>No interconexión</b> con la Ventanilla Única Digital a los efectos del
                artículo 7.1.c del Reglamento (UE) 2024/1028.{' '}
                <Cite norma="lau" art="42.a" />
              </td>
              <td>100.000 €</td>
              <td>1 año</td>
            </tr>
            <tr>
              <td>Leve (b)</td>
              <td>
                Cumplir la obligación del artículo 9 del Reglamento (UE) 2024/1028, pero{' '}
                <b>fuera del plazo</b> previsto normativamente.{' '}
                <Cite norma="lau" art="42.b" />
              </td>
              <td>100.000 €</td>
              <td>1 año</td>
            </tr>
          </tbody>
        </table>
      </ScrollTable>

      <p>
        Las multas pueden <b>incrementarse</b> en atención a la gravedad y trascendencia del hecho,
        la reincidencia —más de una infracción de la misma naturaleza en dos años, declarada así
        por resolución firme—, el beneficio económico obtenido y el criterio de proporcionalidad.{' '}
        <Cite norma="lau" art="43.1" /> La multa por infracción muy grave puede llegar hasta el{' '}
        <b>2 % del volumen de negocio total anual global</b> del ejercicio financiero anterior, y la
        grave hasta el 1 %. Junto a la sanción económica puede imponerse la{' '}
        <b>obligación de adoptar medidas correctivas</b> —subsanación, adaptación tecnológica,
        auditoría de sistemas, remisión complementaria—.{' '}
        <Cite norma="lau" art="43.2 y 3" /> Las sanciones firmes por infracciones graves o muy graves
        se publican en el BOE con la identificación del infractor, la infracción y el importe.{' '}
        <Cite norma="lau" art="43.4" />
      </p>

      <h3>Procedimiento y prescripción</h3>

      <ul>
        <li>
          La prescripción es de <b>cinco años</b> para infracciones muy graves, <b>tres</b> para
          graves y <b>un año</b> para leves; el plazo no empieza a contar hasta que la infracción se
          manifieste o exteriorice, y en infracciones continuadas, hasta que termine la acción
          infractora.{' '}
          <Cite norma="lau" art="44.1 y 2" />
        </li>
        <li>
          El procedimiento <b>caduca a los nueve meses</b> sin resolución; si se acumulan
          infracciones que se tramitaban por separado, el plazo corre desde el acuerdo de inicio del
          último. Lo obtenido en el procedimiento caducado conserva su validez probatoria.{' '}
          <Cite norma="lau" art="44.4" />
        </li>
        <li>
          Antes de incoar por un incumplimiento <b>técnico o documental</b>, el órgano competente
          puede <b>requerir la subsanación en quince días</b>, salvo que concurra dolo o
          reincidencia.{' '}
          <Cite norma="lau" art="47.3" />
        </li>
        <li>
          Notificado el inicio hay <b>veinte días naturales</b> para pagar con reducción o formular
          alegaciones y pruebas. Pagar en ese plazo (<b>procedimiento abreviado</b>) reduce la
          sanción un 50 %, implica renuncia a alegar, termina el procedimiento sin resolución
          expresa y agota la vía administrativa; no es aplicable si hay alguna circunstancia del
          apartado 43.1 que permita incrementar la sanción.{' '}
          <Cite norma="lau" art="48 y 49" />
        </li>
        <li>
          Si en el plazo no se alegan ni se abona, el acuerdo de inicio deviene acto resolutorio:{' '}
          <b>siempre</b> en infracciones leves, y en infracciones graves, ejecutables treinta días
          naturales después de la notificación de la denuncia.{' '}
          <Cite norma="lau" art="50.4" />
        </li>
        <li>
          Son competentes para sancionar la persona titular de la Secretaría de Estado de Vivienda
          y Agenda Urbana (muy graves), de la Secretaría General de Agenda Urbana, Vivienda y
          Arquitectura (graves) y de la Dirección General de Planificación y Evaluación (leves), con
          posibilidad de delegación, incluso a órganos con tramitación automatizada de denuncias.{' '}
          <Cite norma="lau" art="46" />
        </li>
      </ul>

      <div className="box ac2">
        <strong>Para el arrendador, el régimen sancionador no es lo peor.</strong>
        <p>
          Si alquila como turismo, lo que le afecta es fiscal: la{' '}
          <b>salida de la exención del IVA</b> para arrendamientos amueblados con servicios propios
          de hostelería o cuando la duración a favor de un mismo arrendatario no supere las 30
          noches, salvo que la vivienda sea la residencia habitual del arrendador, desde el 1 de
          diciembre de 2026, y el{' '}
          <b>recargo de IBI</b> de hasta el 150 % en zona tensionada.{' '}
          <Link href="/fiscal">Ver la parte fiscal</Link>.
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
