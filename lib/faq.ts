import type { Cita } from './cronologia';

export type FaqEntry = {
  id: string;
  pregunta: string;
  /**
   * Answer paragraphs as plain strings. Article references are given as a
   * trailing `citas` list rendered with <Cite>, so no answer can contain a bare
   * "art. N": the component that renders them requires the norm, and the build
   * fails if a page leaves one un-cited.
   */
  respuesta: string[];
  citas: Cita[];
};

/**
 * Drawn from what the verification pass showed readers actually ask, ordered by
 * how urgent the question is rather than by article number. Rendered with native
 * <details>, so it works with JS disabled and can be force-expanded for print.
 */
export const FAQ: FaqEntry[] = [
  {
    id: 'en-vigor',
    pregunta: '¿Está en vigor ya?',
    respuesta: [
      'Sí, los dos reales decretos-ley están en vigor. El RDL 26/2026 entró en vigor el 1 de octubre de 2026, el día siguiente al de su publicación en el «BOE» núm. 241, y el RDL 27/2026 el 2 de octubre de 2026, tras publicarse en el núm. 243 del 1 de octubre.',
      'Lo que todavía no ha ocurrido es la convalidación en el Congreso de los Diputados. Mientras no se vote, la normativa rige con plena eficacia; si el Congreso la deroga, cesa de inmediato sin anular los efectos ya producidos.',
    ],
    citas: [
      { norma: 'rdl26', art: 'disposición final undécima.1' },
      { norma: 'rdl27', art: 'disposición final segunda' },
      { norma: 'ce', art: '86.2' },
    ],
  },
  {
    id: 'subir-renta',
    pregunta: '¿Me pueden subir la renta?',
    respuesta: [
      'Solo si hay pacto expreso. Desde el 1 de octubre de 2026, en defecto de pacto expreso no se aplica actualización de rentas a los contratos: la renta solo puede actualizarse en la fecha en que se cumpla cada año de vigencia y en los términos pactados por las partes.',
      'Si el pacto existe pero no detalla el índice o la metodología de referencia, la actualización se hace por referencia a la variación anual del IRAV, y en todo caso el incremento no puede superar esa variación.',
      'Hasta el 31 de diciembre de 2027 hay además un límite extraordinario: si la renta supera el límite máximo del precio aplicable conforme al sistema de índices de precios de referencia, no procede incremento alguno; en los demás casos, el pactado o, a falta de pacto, un máximo del 2 %.',
    ],
    citas: [
      { norma: 'lau', art: '18.1' },
      { norma: 'rdl26', art: '3.Once' },
      { norma: 'rdl26', art: 'disposición final sexta' },
    ],
  },
  {
    id: 'desahucio',
    pregunta: '¿Me pueden hacer un desahucio?',
    respuesta: [
      'Puede, pero hay dos frenos nuevos. Si se acredita la vulnerabilidad económica y falta alternativa habitacional, la administración competente dispone de un plazo máximo e improrrogable de dos meses para ofrecer una alternativa adecuada o, en su defecto, pagar o consignar la deuda. Durante ese plazo quedan suspendidos el procedimiento y el lanzamiento.',
      'Si la administración no actúa, queda subrogada automáticamente en la posición deudora del arrendatario: no hay lugar para el lanzamiento y el contrato se mantiene vigente hasta su expiración mientras persista la situación de vulnerabilidad.',
      'Aparte de eso, y hasta el 31 de diciembre de 2030, se suspende el proceso cuando el demandante es una entidad que adquiere inmuebles o carteras de préstamo hipotecario impagados por un precio claramente inferior al de tasación, para eludir los mecanismos de función social de la vivienda. En el caso del apartado segundo, la suspensión o la compensación no supondrán la desaparición de la obligación de mantenerse al corriente de la renta debida.',
    ],
    citas: [
      { norma: 'lec', art: '22.6' },
      { norma: 'rdl26', art: '5.Dos' },
      { norma: 'rdl26', art: '2' },
    ],
  },
  {
    id: 'indemnizacion',
    pregunta: '¿Cuánto me deben si no me renuevan?',
    respuesta: [
      'Desde el 2 de octubre de 2026, el arrendador que notifique válidamente su voluntad de no renovar debe indemnizar al arrendatario con una cantidad equivalente, al menos, al importe de doce mensualidades de renta de una vivienda de análogas características a la arrendada.',
      'El cálculo se hace, siempre que ello sea posible, en base al sistema estatal de referencia de precios de alquiler de vivienda, y en ningún caso por debajo del importe equivalente a una mensualidad de renta por cada año que el arrendatario haya residido en la vivienda, prorrateándose por meses los períodos inferiores al año y por días los inferiores al mes.',
      'No procede esa indemnización en seis casos, que deben hacerse constar de forma expresa, detallada y por escrito en la notificación de preaviso: que el arrendador necesite la vivienda para sí o para familiares de segundo grado de consanguinidad, por adopción o para su cónyuge en caso de separación, divorcio o nulidad; que el arrendatario no haya habitado la vivienda más de seis meses en los doce anteriores a la notificación sin causa justificada; que disponga de otra vivienda apta en el mismo municipio; que las partes suscriban un contrato nuevo; que el arrendatario rechace una oferta fehaciente; o que concurra otra circunstancia debidamente justificada.',
    ],
    citas: [
      { norma: 'lau', art: '10.1' },
      { norma: 'lau', art: '10.2' },
      { norma: 'rdl27', art: 'único.1' },
    ],
  },
  {
    id: 'aplicacion-contrato',
    pregunta: '¿Cuándo se aplica a mi contrato?',
    respuesta: [
      'La nueva prórroga de cinco o siete años se aplica a los contratos de vivienda habitual vigentes el 2 de octubre de 2026, respecto de los vencimientos del contrato o de cualquiera de sus prórrogas que se produzcan con posterioridad al día siguiente a esa fecha.',
      'Hay tres reglas transitorias que conviene conocer: si a la entrada en vigor quedaban menos de seis meses para el vencimiento, el preaviso del arrendador puede efectuarse con una antelación mínima de cuatro meses; los contratos que ya se encontraban en el periodo de prórroga del anterior artículo 10.1 de la LAU continúan en él hasta su término, y solo a su término se les aplica el régimen nuevo; y los contratos en situación de tácita reconducción conforme al artículo 1566 del Código Civil quedan sujetos al artículo 10 de la LAU a partir del primer vencimiento que se produzca una vez transcurridos cuatro meses desde la entrada en vigor.',
      'Las comunicaciones o requerimientos para poner fin a la tácita reconducción, formulados válidamente con anterioridad al 2 de octubre de 2026, conservan su eficacia y no dan lugar a la indemnización de doce mensualidades.',
    ],
    citas: [
      { norma: 'rdl27', art: 'disposición transitoria única.1' },
      { norma: 'rdl27', art: 'disposición transitoria única.2 y 3' },
      { norma: 'rdl27', art: 'disposición transitoria única.5' },
    ],
  },
  {
    id: 'gran-tenedor',
    pregunta: '¿Soy gran tenedor?',
    respuesta: [
      'Es la persona física o jurídica titular de más de diez inmuebles urbanos de uso residencial, o de una superficie construida de más de 1.500 m² de uso residencial, excluyendo en todo caso garajes y trasteros. La condición se acredita mediante certificación del Registro de la Propiedad.',
      'La reforma añade un criterio que puede cambiar la respuesta: cuando una finca registral comprende un edificio compuesto por varias unidades susceptibles de uso residencial, se entiende que cada una de esas unidades constituye un inmueble independiente a efectos de cómputo, con independencia de que no exista división horizontal inscrita.',
      'La definición puede particularizarse en la declaración de entorno de mercado residencial tensionado hasta aquellos titulares de cinco o más inmuebles de uso residencial ubicadas en ese ámbito, cuando así sea motivado por la comunidad autónoma en la correspondiente memoria justificativa.',
    ],
    citas: [
      { norma: 'l123', art: '3.k' },
      { norma: 'rdl26', art: '4.Uno' },
    ],
  },
  {
    id: 'vivienda-asequible',
    pregunta: '¿Qué es vivienda asequible?',
    respuesta: [
      'Aquella cuyas condiciones de precio de venta o alquiler, incluidos todos los gastos asociados al mismo, no superen el treinta por ciento de la renta mediana de la unidad de convivencia habitual del municipio en el que se ubique el inmueble. Los gastos asociados a los anejos no podrán suponer un incremento del precio de alquiler respecto al determinado para la vivienda.',
      'La definición del artículo 14 del RDL 26/2026 se reutiliza después como condición en otros preceptos: en la DA 20.ª de la Ley 33/2003, que fija el precio máximo permanente de las viviendas de CASA 47, y en la reducción del 25 % al 50 % para las SOCIMI con más del 80 % de parque asequible.',
    ],
    citas: [
      { norma: 'rdl26', art: '14' },
      { norma: 'rdl26', art: '11.Uno' },
      { norma: 'rdl26', art: '9.Uno.5' },
    ],
  },
  {
    id: 'cuenta-financia-europa',
    pregunta: '¿Puedo participar en la Cuenta Financia Europa?',
    respuesta: [
      'Todavía no. La Cuenta de Ahorro e Inversión Financia Europa no puede ser objeto de comercialización ni de contratación hasta la entrada en vigor de la orden ministerial que instrumente el cumplimiento de las obligaciones de información específicas, y los Seguros Individuales de Ahorro a Largo Plazo Financia Europa quedan bajo la misma condición.',
      'Tampoco pueden efectuarse movilizaciones entre entidades proveedoras hasta la entrada en vigor de la orden ministerial prevista en el artículo 347.7 de la Ley de los Mercados de Valores, que el RDL obliga a aprobar en el plazo de seis meses.',
      'Hasta que funcione el Registro de IIC Elegibles, las entidades sí pueden comercializarla, pero solo con los activos elegibles distintos de participaciones o acciones de IIC, que únicamente podrán incluirse una vez inscritas en ese Registro. La CNMV dispone de cuatro meses para crearlo.',
    ],
    citas: [
      { norma: 'rdl26', art: 'disposición final undécima.3.a' },
      { norma: 'rdl26', art: 'disposición final undécima.3.b y c' },
      { norma: 'rdl26', art: 'disposición final octava.2' },
      { norma: 'rdl26', art: 'disposición adicional segunda' },
    ],
  },
  {
    id: 'alquileres-turisticos',
    pregunta: '¿Qué pasa con los alquileres turísticos?',
    respuesta: [
      'Para la plataforma, hay un régimen sancionador completamente nuevo. El RDL 26/2026 añade un Título V a la LAU con multa de un millón de euros para las infracciones muy graves, quinientos mil para las graves y cien mil para las leves, por no recoger y transmitir, o transmitir mal, los datos a la Ventanilla Única Digital de Arrendamientos en los términos del Reglamento (UE) 2024/1028.',
      'La cuantía puede incrementarse por la gravedad del hecho, la reincidencia en dos años, el beneficio económico obtenido y el criterio de proporcionalidad, hasta alcanzar el 2 % del volumen de negocio total anual global del ejercicio anterior en las muy graves y el 1 % en las graves. Las infracciones muy graves prescriben a los cinco años, las graves a los tres y las leves al año.',
      'Para el propietario, en cambio, la fiscalidad es la parte dura: los arrendamientos con servicios propios de hostelería, o de más de 30 noches sin que el arrendador resida en la vivienda, salen de la exención del IVA y tributan al 10 % desde el 1 de diciembre de 2026; y en los municipios situados en zona de mercado residencial tensionado se crea un recargo de IBI de hasta el 150 % de la cuota líquida para titulares de cuatro o más inmuebles de uso turístico.',
    ],
    citas: [
      { norma: 'lau', art: '43.2' },
      { norma: 'lau', art: '44.1' },
      { norma: 'rdl26', art: '3.Veinte' },
      { norma: 'rdl26', art: '8.Cuatro' },
    ],
  },
];
