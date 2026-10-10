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
      'Sí, en parte. El RDL 29/2026 está en vigor desde el 8 de octubre de 2026, pendiente de convalidación por la Diputación Permanente; el RDL 28/2026 está publicado pero aún no está en vigor (prevista el 15-11-2026 si se convalida).',
      'Los RDL 26/2026 y 27/2026 quedaron derogados el 2-10-2026 (172 a favor y 178 en contra el RDL 26/2026; el RDL 27/2026 fue rechazado sin cifra a favor confirmada en fuente oficial, con 184 en contra). Rigen la LAU y las demás normas anteriores a los decretos. Si recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un sindicato de inquilinos. Si alguna medida se tramita como proyecto de ley, este sitio se actualizará desde ese texto.',
    ],
    citas: [
      { norma: 'rdl29', art: 'disposición final decimoprimera.1' },
      { norma: 'rdl28', art: 'disposición final segunda' },
      { norma: 'ce', art: '86.2' },
    ],
  },
  {
    id: 'subir-renta',
    pregunta: '¿Me pueden subir la renta?',
    respuesta: [
      'Vuelve a estar en vigor por la disposición final sexta del RDL 29/2026 (desde el 8-10-2026, pendiente de convalidación): sin pacto, la actualización anual no supera el 2 %, y es cero si la renta supera el índice de referencia.',
      'Ese tope era de la DF 6.ª del RDL 26/2026, derogado el 2-10-2026; el RDL 29/2026 lo reproduce. La actualización de la renta es la pactada en cada contrato.',
    ],
    citas: [
      { norma: 'rdl29', art: 'disposición final sexta' },
      { norma: 'rdl26', art: '3.Once' },
      { norma: 'rdl26', art: 'disposición final sexta' },
    ],
  },
  {
    id: 'desahucio',
    pregunta: '¿Me pueden hacer un desahucio?',
    respuesta: [
      'Vuelven a estar en vigor por los arts. 2 y 5.Dos del RDL 29/2026 (desde el 8-10-2026, pendiente de convalidación): suspensión de desahucios de vulnerables y enervación extraordinaria. Los procesos siguen las reglas anteriores de la LAU y la LEC cuando no aplica ese régimen.',
      'El plazo de dos meses para la administración y la subrogación automática en la deuda eran del RDL 26/2026, derogado el 2-10-2026; el RDL 29/2026 los reproduce. Si recibiste una notificación fechada el 1 o el 2 de octubre, llévala a un abogado o a un sindicato de inquilinos.',
    ],
    citas: [
      { norma: 'rdl29', art: '2' },
      { norma: 'rdl29', art: '5.Dos' },
      { norma: 'lec', art: '22.6' },
      { norma: 'rdl26', art: '5.Dos' },
      { norma: 'rdl26', art: '2' },
    ],
  },
  {
    id: 'indemnizacion',
    pregunta: '¿Cuánto me deben si no me renuevan?',
    respuesta: [
      'Vuelve a estar en vigor por el artículo único del RDL 28/2026 (pendiente de convalidación): prórroga por plazos sucesivos de cinco y siete años e indemnización por no renovación.',
      'Las seis excepciones del apartado 10.2 (necesidad del arrendador, no ocupación, otra vivienda, contrato nuevo, rechazo de oferta y vulnerabilidad del arrendador) eran del texto del RDL 27/2026, derogado el 2-10-2026; el RDL 28/2026 las reproduce.',
    ],
    citas: [
      { norma: 'rdl28', art: 'único.1' },
      { norma: 'lau', art: '10.1' },
      { norma: 'lau', art: '10.2' },
      { norma: 'rdl27', art: 'único.1' },
    ],
  },
  {
    id: 'aplicacion-contrato',
    pregunta: '¿Cuándo se aplica a mi contrato?',
    respuesta: [
      'El régimen transitorio es ahora el de la disposición transitoria única del RDL 28/2026 (pendiente de convalidación): se aplica a los vencimientos posteriores a su entrada en vigor.',
      'Los preavisos de cuatro meses y las reglas de tácita reconducción del texto derogado tienen su equivalente en esa transitoria. Los contratos se rigen por la LAU anterior cuando no aplica el régimen nuevo.',
    ],
    citas: [
      { norma: 'rdl28', art: 'disposición transitoria única' },
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
      'Ese criterio rige de nuevo: el art. 4 del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación) mantiene que cada unidad de una finca registral cuenta como inmueble independiente. Era del RDL 26/2026, derogado el 2-10-2026.',
      'La definición puede particularizarse en la declaración de entorno de mercado residencial tensionado hasta aquellos titulares de cinco o más inmuebles de uso residencial ubicadas en ese ámbito, cuando así sea motivado por la comunidad autónoma en la correspondiente memoria justificativa.',
    ],
    citas: [
      { norma: 'l123', art: '3.k' },
      { norma: 'rdl29', art: '4.Uno' },
      { norma: 'rdl26', art: '4.Uno' },
    ],
  },
  {
    id: 'vivienda-asequible',
    pregunta: '¿Qué es vivienda asequible?',
    respuesta: [
      'La define de nuevo el art. 14 del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación): no superar el treinta por ciento de la renta mediana de la unidad de convivencia habitual del municipio, sin incrementos por anejos. Esa definición era del RDL 26/2026, derogado el 2-10-2026.',
      'El gravamen especial del 25 % rige de nuevo por el art. 9 del RDL 29/2026: se reduce en un 50 % (o un 100 % con reinversión en tres años) cuando más del 80 % de las viviendas se destinasen a arrendamiento asequible o protegido (art. 9.5 de la Ley 11/2009). Los umbrales transitorios de más del 60 % en 2026 y más del 70 % en 2027 eran del decreto derogado.',
    ],
    citas: [
      { norma: 'rdl29', art: '14' },
      { norma: 'rdl29', art: '9' },
      { norma: 'rdl26', art: '14' },
      { norma: 'rdl26', art: '11' },
      { norma: 'rdl26', art: '9.Uno.5' },
      { norma: 'rdl26', art: '9.Dos' },
    ],
  },
  {
    id: 'cuenta-financia-europa',
    pregunta: '¿Puedo participar en la Cuenta Financia Europa?',
    respuesta: [
      'El marco rige de nuevo por el título VI del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación), aunque la comercialización sigue condicionada a la orden ministerial: la Cuenta de Ahorro e Inversión Financia Europa no puede contratarse hasta que entre en vigor, y lo mismo vale para los Seguros Individuales de Ahorro a Largo Plazo Financia Europa.',
      'Tampoco pueden efectuarse movilizaciones entre entidades proveedoras hasta la entrada en vigor de la orden ministerial prevista en el artículo 347.7 de la Ley de los Mercados de Valores, que el RDL obliga a aprobar en el plazo de seis meses.',
      'Hasta que funcione el Registro de IIC Elegibles, las entidades sí pueden comercializarla, pero solo con los activos elegibles distintos de participaciones o acciones de IIC, que únicamente podrán incluirse una vez inscritas en ese Registro. La CNMV dispone de cuatro meses para crearlo.',
    ],
    citas: [
      { norma: 'rdl29', art: '21' },
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
      'Rigen de nuevo por el RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación): título V sancionador, IVA del 10 % y recargos de IBI. Ese régimen era del RDL 26/2026, derogado el 2 de octubre de 2026.',
      'Para la plataforma, hay un régimen sancionador completamente nuevo. El RDL 29/2026 añade un Título V a la LAU con multa de un millón de euros para las infracciones muy graves, quinientos mil para las graves y cien mil para las leves, por no recoger y transmitir, o transmitir mal, los datos a la Ventanilla Única Digital de Arrendamientos en los términos del Reglamento (UE) 2024/1028.',
      'La cuantía puede incrementarse por la gravedad del hecho, la reincidencia en dos años, el beneficio económico obtenido y el criterio de proporcionalidad, hasta alcanzar el 2 % del volumen de negocio total anual global del ejercicio anterior en las muy graves y el 1 % en las graves. Las infracciones muy graves prescriben a los cinco años, las graves a los tres y las leves al año.',
      'Para el propietario, en cambio, la fiscalidad es la parte dura: los arrendamientos en que el arrendador se obligue a la prestación de servicios propios de la industria hotelera, o cuando la duración de la cesión a un mismo arrendatario sea igual o inferior a 30 noches (excepto si la cesión se produce en la vivienda en la que el arrendador tenga su residencia habitual, en cuyo caso estará exenta), salen de la exención del IVA y tributan al 10 % desde el 1 de diciembre de 2026; y en los municipios situados en zona de mercado residencial tensionado se crea un recargo de IBI de hasta el 150 % de la cuota líquida para titulares de cuatro o más inmuebles de uso turístico.',
    ],
    citas: [
      { norma: 'rdl29', art: '3.Veinte' },
      { norma: 'lau', art: '43.2' },
      { norma: 'lau', art: '44.1' },
      { norma: 'rdl26', art: '3.Veinte' },
      { norma: 'rdl26', art: '8.Cuatro' },
    ],
  },
  {
    id: 'deduccion-alquiler-requisitos',
    pregunta: '¿Qué exige la deducción por alquiler en el IRPF?',
    respuesta: [
      'Rige de nuevo por el art. 6 del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación). Esa deducción era del RDL 26/2026, derogado el 2 de octubre de 2026.',
      'La deducción es del 10 % de lo pagado por alquiler de vivienda habitual, para bases imponibles inferiores a 33.007,20 €, con base máxima de 11.630 € anuales (art. 68.6 de la LIRPF, añadido por el art. 6 del RDL 29/2026).',
      'Pide que, durante al menos la mitad del período impositivo, ni el contribuyente ni nadie de su unidad familiar sean titulares, de manera individual o conjuntamente, de la totalidad del pleno dominio o de un derecho real de uso o disfrute constituido sobre otra vivienda distante a menos de 50 km de la arrendada, salvo que exista una resolución administrativa o judicial que les impida su uso como residencia.',
    ],
    citas: [
      { norma: 'rdl29', art: '6.Segundo.Cuatro' },
      { norma: 'rdl26', art: '6.Segundo.Cuatro' },
      { norma: 'lirpf', art: '68.6' },
    ],
  },
  {
    id: 'reinversion-financia-europa',
    pregunta: '¿Cómo funciona la reinversión en la Cuenta Financia Europa Reinversión?',
    respuesta: [
      'Rige de nuevo por el art. 6 del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación). Esa reinversión era del RDL 26/2026, derogado el 2 de octubre de 2026.',
      'Solo vale para transmisiones realizadas una vez transcurridos treinta días hábiles desde la entrada en vigor del decreto. Hay que reinvertir, en seis meses desde la transmisión (o desde la orden ministerial de información si es posterior), el valor de transmisión que proporcionalmente se corresponda con la ganancia patrimonial no exenta (disposición adicional 65.1 de la LIRPF, introducida por el art. 6.Segundo.Once del RDL 26/2026).',
      'El importe total acumulado aportado a esa cuenta no puede exceder de 800.000 € (disposición adicional 66.5 de la LIRPF y art. 6.Segundo.Doce del RDL 26/2026).',
    ],
    citas: [
      { norma: 'rdl29', art: '6.Segundo.Once' },
      { norma: 'rdl26', art: '6.Segundo.Once' },
      { norma: 'lirpf', art: 'disposición adicional sexagésima quinta.1' },
      { norma: 'rdl26', art: '6.Segundo.Doce' },
      { norma: 'lirpf', art: 'disposición adicional sexagésima sexta.5' },
    ],
  },
  {
    id: 'vivienda-habitual-mayores-65',
    pregunta: '¿Sigue siendo vivienda habitual si me mudo por edad o dependencia?',
    respuesta: [
      'Rige de nuevo por la DF 3.ª del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación). Esa regla era del RDL 26/2026, derogado el 2 de octubre de 2026.',
      'Para las exenciones por transmisión cuenta como habitual la vivienda de las personas mayores de 65 años o en situación de dependencia severa o gran dependencia que trasladan su residencia a un centro especializado o al domicilio de un familiar hasta el tercer grado por consanguinidad o afinidad.',
      'Y en separación, divorcio o nulidad, la del cónyuge que debe abandonar el domicilio, siempre que el requisito de ocupación efectiva concurra en el cónyuge que permaneció en la misma (DF 3.ª del RDL 26/2026).',
    ],
    citas: [{ norma: 'rdl29', art: 'disposición final tercera' }, { norma: 'rdl26', art: 'disposición final tercera.Uno' }],
  },
  {
    id: 'iva-superreducido-protegida',
    pregunta: '¿Qué viviendas llevan IVA superreducido?',
    respuesta: [
      'Rige de nuevo por el art. 7 del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación). Esa regla era del RDL 26/2026, derogado el 2 de octubre de 2026.',
      'Con efectos desde el 1-12-2026, las calificadas como protección oficial de régimen especial o de promoción pública y las protegidas con calificación permanente o indefinida, cuando las entregas se efectúen por sus promotores, incluidos los garajes y anexos situados en el mismo edificio que se transmitan conjuntamente, con un máximo de dos plazas de garaje (art. 7.Cuatro del RDL 26/2026 y art. 91.Dos.1.6 de la LIVA).',
      'Y las que adquieran las entidades del régimen especial de arrendamiento de vivienda si a sus rentas se aplica la bonificación del artículo 49.1 de la Ley del Impuesto sobre Sociedades.',
    ],
    citas: [
      { norma: 'rdl29', art: '7.Cuatro' },
      { norma: 'rdl26', art: '7.Cuatro' },
      { norma: 'liva', art: '91.Dos.1.6' },
    ],
  },
  {
    id: 'cuenta-tributacion-10-000',
    pregunta: '¿Cómo tributa la Cuenta Financia Europa a los cinco años?',
    respuesta: [
      'Rige de nuevo por el art. 6 del RDL 29/2026 (en vigor desde el 8-10, pendiente de convalidación). Ese régimen era del RDL 26/2026, derogado el 2 de octubre de 2026.',
      'Las ganancias no se integran hasta disponer total o parcialmente. En la cuenta de la modalidad general, la parte atribuible a aportaciones que hayan permanecido más de cinco años queda excluida en un 100 % hasta 10.000 € por contribuyente y en un 20 % sobre el resto (art. 95 ter, apartado 4, de la LIRPF, introducido por el art. 6.Segundo.Cinco del RDL 26/2026).',
      'En la cuenta de reinversión, esa misma parte queda excluida en un 20 %, sin la exclusión del 100 % de los primeros 10.000 € (disposición adicional 66.2 de la LIRPF y art. 6.Segundo.Doce del RDL 26/2026).',
    ],
    citas: [
      { norma: 'lirpf', art: '95 ter.4' },
      { norma: 'rdl29', art: '6.Segundo.Cinco' },
      { norma: 'rdl26', art: '6.Segundo.Cinco' },
      { norma: 'lirpf', art: 'disposición adicional sexagésima sexta.2' },
      { norma: 'rdl29', art: '6.Segundo.Doce' },
      { norma: 'rdl26', art: '6.Segundo.Doce' },
    ],
  },
];
